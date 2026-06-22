/**
 * Razorpay Payment Service
 * Handles all Razorpay payment operations including:
 * - Creating payment orders
 * - Verifying payment signatures
 * - Refunding payments
 * - Fetching payment details
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('[RAZORPAY] Missing credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
    }

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create a payment order
   * @param {number} amount - Amount in paisa (e.g., 50000 for ₹500)
   * @param {string} currency - Currency code (default: INR)
   * @param {string} receipt - Receipt ID (unique identifier)
   * @param {object} metadata - Additional metadata (customer info, etc.)
   * @returns {Promise<object>} Order details from Razorpay
   */
  async createOrder(amount, currency = 'INR', receipt = null, metadata = {}) {
    try {
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const orderOptions = {
        amount: Math.round(amount), // Razorpay expects amount in smallest currency unit (paisa)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: metadata,
      };

      const order = await this.razorpay.orders.create(orderOptions);

      return {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          receipt: order.receipt,
          createdAt: new Date(order.created_at * 1000),
        },
        message: 'Order created successfully',
      };
    } catch (error) {
      console.error('[RAZORPAY] Create order error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to create order',
      };
    }
  }

  /**
   * Verify payment signature
   * @param {string} orderId - Razorpay order ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Signature from payment response
   * @returns {Promise<boolean>} True if signature is valid
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === signature;

      if (!isValid) {
        console.warn('[RAZORPAY] Invalid signature received');
      }

      return isValid;
    } catch (error) {
      console.error('[RAZORPAY] Signature verification error:', error.message);
      return false;
    }
  }

  /**
   * Fetch payment details
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise<object>} Payment details
   */
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);

      return {
        success: true,
        data: {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          acquirerData: payment.acquirer_data,
          createdAt: new Date(payment.created_at * 1000),
        },
        message: 'Payment details fetched successfully',
      };
    } catch (error) {
      console.error('[RAZORPAY] Fetch payment error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to fetch payment details',
      };
    }
  }

  /**
   * Fetch order details
   * @param {string} orderId - Razorpay order ID
   * @returns {Promise<object>} Order details
   */
  async getOrderDetails(orderId) {
    try {
      const order = await this.razorpay.orders.fetch(orderId);

      return {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          amountPaid: order.amount_paid,
          amountDue: order.amount_due,
          currency: order.currency,
          status: order.status,
          receipt: order.receipt,
          paymentCount: order.payments?.count || 0,
          createdAt: new Date(order.created_at * 1000),
        },
        message: 'Order details fetched successfully',
      };
    } catch (error) {
      console.error('[RAZORPAY] Fetch order error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to fetch order details',
      };
    }
  }

  /**
   * Refund a payment
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to refund (optional, defaults to full amount)
   * @param {string} reason - Reason for refund
   * @returns {Promise<object>} Refund details
   */
  async refundPayment(paymentId, amount = null, reason = 'Customer request') {
    try {
      const refundOptions = {
        notes: {
          reason,
        },
      };

      if (amount) {
        refundOptions.amount = Math.round(amount); // Amount in paisa
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundOptions);

      return {
        success: true,
        data: {
          refundId: refund.id,
          paymentId: refund.payment_id,
          amount: refund.amount,
          status: refund.status,
          reason: refund.notes?.reason || reason,
          createdAt: new Date(refund.created_at * 1000),
        },
        message: 'Refund processed successfully',
      };
    } catch (error) {
      console.error('[RAZORPAY] Refund error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to process refund',
      };
    }
  }

  /**
   * Capture a payment (for authorized payments)
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to capture in paisa
   * @returns {Promise<object>} Captured payment details
   */
  async capturePayment(paymentId, amount) {
    try {
      const payment = await this.razorpay.payments.capture(paymentId, Math.round(amount));

      return {
        success: true,
        data: {
          paymentId: payment.id,
          amount: payment.amount,
          status: payment.status,
        },
        message: 'Payment captured successfully',
      };
    } catch (error) {
      console.error('[RAZORPAY] Capture error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to capture payment',
      };
    }
  }

  /**
   * Get all payments
   * @param {object} filters - Filter options (count, skip, etc.)
   * @returns {Promise<object>} List of payments
   */
  async listPayments(filters = {}) {
    try {
      const options = {
        count: filters.count || 10,
        skip: filters.skip || 0,
      };

      const payments = await this.razorpay.payments.all(options);

      return {
        success: true,
        data: payments.items.map(payment => ({
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          createdAt: new Date(payment.created_at * 1000),
        })),
        total: payments.count,
        message: 'Payments fetched successfully',
      };
    } catch (error) {
      console.error('[RAZORPAY] List payments error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to fetch payments',
      };
    }
  }

  /**
   * Create a payment link (for unauthenticated users)
   * @param {number} amount - Amount in paisa
   * @param {string} currency - Currency code
   * @param {string} description - Description
   * @param {string} customerEmail - Customer email
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Payment link details
   */
  async createPaymentLink(amount, currency = 'INR', description, customerEmail, metadata = {}) {
    try {
      const linkOptions = {
        amount: Math.round(amount),
        currency,
        description,
        customer: {
          email: customerEmail,
        },
        notify: {
          sms: false,
          email: true,
        },
        notes: metadata,
      };

      // Note: Payment Link is a Pro feature in Razorpay
      // This is a placeholder - actual implementation depends on your Razorpay plan
      console.warn('[RAZORPAY] Payment Link creation requires Razorpay Pro plan');

      return {
        success: true,
        data: {
          message: 'Payment link creation requires Razorpay Pro plan',
        },
      };
    } catch (error) {
      console.error('[RAZORPAY] Create payment link error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to create payment link',
      };
    }
  }
}

module.exports = RazorpayService;
