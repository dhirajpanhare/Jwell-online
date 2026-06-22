/**
 * Payment Controller
 * Handles all payment-related API requests
 */

const crypto = require('crypto');
const RazorpayService = require('../services/razorpayService');
const pool = require('../config/database');
const logger = require('../utils/logger');

class PaymentController {
  constructor() {
    this.razorpayService = new RazorpayService();
  }

  /**
   * Internal: Update order payment/order status in DB after webhook
   * @param {string|null} razorpayOrderId
   * @param {string|null} razorpayPaymentId
   * @param {string} paymentStatus  - authorized | paid | failed | refunded
   * @param {string|null} orderStatus - confirmed | cancelled | null (no change)
   */
  async _updateOrderPaymentStatus(razorpayOrderId, razorpayPaymentId, paymentStatus, orderStatus = null) {
    const connection = await pool.getConnection();
    try {
      let orderId = null;

      // Resolve internal OrderId from RazorpayOrderId
      if (razorpayOrderId) {
        const [rows] = await connection.query(
          'SELECT OrderId FROM Orders WHERE RazorpayOrderId = ? LIMIT 1',
          [razorpayOrderId]
        );
        if (rows.length > 0) orderId = rows[0].OrderId;
      }

      // Fallback: resolve via RazorpayPaymentId
      if (!orderId && razorpayPaymentId) {
        const [rows] = await connection.query(
          'SELECT OrderId FROM Orders WHERE RazorpayPaymentId = ? LIMIT 1',
          [razorpayPaymentId]
        );
        if (rows.length > 0) orderId = rows[0].OrderId;
      }

      if (!orderId) {
        logger.warn(`[WEBHOOK] Could not resolve OrderId for razorpayOrderId=${razorpayOrderId} paymentId=${razorpayPaymentId}`);
        return;
      }

      const updates = { PaymentStatus: paymentStatus, UpdatedAt: new Date() };
      if (razorpayPaymentId) updates.RazorpayPaymentId = razorpayPaymentId;
      if (orderStatus) updates.OrderStatus = orderStatus;

      const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const values = [...Object.values(updates), orderId];
      await connection.query(`UPDATE Orders SET ${fields} WHERE OrderId = ?`, values);

      logger.info(`[WEBHOOK] Order ${orderId} updated — PaymentStatus=${paymentStatus}${orderStatus ? ` OrderStatus=${orderStatus}` : ''}`);
    } catch (err) {
      logger.error('[WEBHOOK] DB update failed:', err.message);
    } finally {
      connection.release();
    }
  }

  /**
   * Create a payment order
   * POST /api/v1.0/payments/create-order
   * @param {number} amount - Amount in paisa (₹500 = 50000 paisa)
   * @param {string} currency - Currency (default: INR)
   * @param {string} orderDescription - Order description
   * @param {object} customerInfo - Customer details (email, phone, etc.)
   */
  async createOrder(req, res) {
    try {
      const { amount, currency = 'INR', orderDescription, customerId, customerEmail, customerPhone } = req.body;

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          status: false,
          message: 'Invalid amount. Amount must be greater than 0.',
          code: 'INVALID_AMOUNT',
        });
      }

      // Convert to paisa if needed
      const amountInPaisa = amount > 100 ? amount : amount * 100;

      const metadata = {
        customerId,
        customerEmail,
        customerPhone,
        description: orderDescription,
        source: 'JeweleryApp',
      };

      const receipt = `receipt_${Date.now()}_${customerId || 'guest'}`;

      const result = await this.razorpayService.createOrder(
        amountInPaisa,
        currency,
        receipt,
        metadata
      );

      if (!result.success) {
        return res.status(400).json({
          status: false,
          message: result.error,
          code: 'ORDER_CREATION_FAILED',
        });
      }

      return res.json({
        status: true,
        message: 'Order created successfully',
        data: {
          orderId: result.data.orderId,
          amount: result.data.amount,
          amountInRupees: result.data.amount / 100,
          currency: result.data.currency,
          status: result.data.status,
          receipt: result.data.receipt,
          createdAt: result.data.createdAt,
        },
      });
    } catch (error) {
      console.error('Create order error:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Failed to create order',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Verify payment signature
   * POST /api/v1.0/payments/verify-signature
   * @param {string} orderId - Razorpay order ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Signature from payment response
   */
  async verifySignature(req, res) {
    try {
      const { orderId, paymentId, signature } = req.body;

      if (!orderId || !paymentId || !signature) {
        return res.status(400).json({
          status: false,
          message: 'Missing required fields: orderId, paymentId, signature',
          code: 'MISSING_FIELDS',
        });
      }

      const isValid = this.razorpayService.verifyPaymentSignature(orderId, paymentId, signature);

      if (!isValid) {
        return res.status(400).json({
          status: false,
          message: 'Invalid payment signature',
          code: 'INVALID_SIGNATURE',
        });
      }

      return res.json({
        status: true,
        message: 'Payment signature verified successfully',
        data: {
          orderId,
          paymentId,
          isVerified: true,
        },
      });
    } catch (error) {
      console.error('Verify signature error:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Failed to verify signature',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Get payment details
   * GET /api/v1.0/payments/:paymentId
   * @param {string} paymentId - Razorpay payment ID
   */
  async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return res.status(400).json({
          status: false,
          message: 'Payment ID is required',
          code: 'MISSING_PAYMENT_ID',
        });
      }

      const result = await this.razorpayService.getPaymentDetails(paymentId);

      if (!result.success) {
        return res.status(404).json({
          status: false,
          message: result.error,
          code: 'PAYMENT_NOT_FOUND',
        });
      }

      return res.json({
        status: true,
        message: 'Payment details fetched',
        data: result.data,
      });
    } catch (error) {
      console.error('Get payment details error:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Failed to fetch payment details',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Get order details
   * GET /api/v1.0/payments/orders/:orderId
   * @param {string} orderId - Razorpay order ID
   */
  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          status: false,
          message: 'Order ID is required',
          code: 'MISSING_ORDER_ID',
        });
      }

      const result = await this.razorpayService.getOrderDetails(orderId);

      if (!result.success) {
        return res.status(404).json({
          status: false,
          message: result.error,
          code: 'ORDER_NOT_FOUND',
        });
      }

      return res.json({
        status: true,
        message: 'Order details fetched',
        data: result.data,
      });
    } catch (error) {
      console.error('Get order details error:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Failed to fetch order details',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Refund payment
   * POST /api/v1.0/payments/refund
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to refund (optional)
   * @param {string} reason - Refund reason
   */
  async refundPayment(req, res) {
    try {
      const { paymentId, amount, reason = 'Customer request' } = req.body;

      if (!paymentId) {
        return res.status(400).json({
          status: false,
          message: 'Payment ID is required',
          code: 'MISSING_PAYMENT_ID',
        });
      }

      // Convert amount to paisa if provided
      const refundAmount = amount ? (amount > 100 ? amount : amount * 100) : null;

      const result = await this.razorpayService.refundPayment(paymentId, refundAmount, reason);

      if (!result.success) {
        return res.status(400).json({
          status: false,
          message: result.error,
          code: 'REFUND_FAILED',
        });
      }

      return res.json({
        status: true,
        message: 'Refund processed successfully',
        data: {
          refundId: result.data.refundId,
          paymentId: result.data.paymentId,
          amount: result.data.amount,
          amountInRupees: result.data.amount / 100,
          status: result.data.status,
          reason: result.data.reason,
          createdAt: result.data.createdAt,
        },
      });
    } catch (error) {
      console.error('Refund payment error:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Failed to process refund',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Capture payment
   * POST /api/v1.0/payments/capture
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to capture in paisa
   */
  async capturePayment(req, res) {
    try {
      const { paymentId, amount } = req.body;

      if (!paymentId || !amount) {
        return res.status(400).json({
          status: false,
          message: 'Payment ID and amount are required',
          code: 'MISSING_FIELDS',
        });
      }

      const captureAmount = amount > 100 ? amount : amount * 100;
      const result = await this.razorpayService.capturePayment(paymentId, captureAmount);

      if (!result.success) {
        return res.status(400).json({
          status: false,
          message: result.error,
          code: 'CAPTURE_FAILED',
        });
      }

      return res.json({
        status: true,
        message: 'Payment captured successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Capture payment error:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Failed to capture payment',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * List payments
   * GET /api/v1.0/payments
   * @param {number} count - Number of payments to fetch
   * @param {number} skip - Number of payments to skip
   */
  async listPayments(req, res) {
    try {
      const { count = 10, skip = 0 } = req.query;

      const result = await this.razorpayService.listPayments({
        count: parseInt(count) || 10,
        skip: parseInt(skip) || 0,
      });

      if (!result.success) {
        return res.status(400).json({
          status: false,
          message: result.error,
          code: 'FETCH_FAILED',
        });
      }

      return res.json({
        status: true,
        message: 'Payments fetched successfully',
        data: result.data,
        total: result.total,
      });
    } catch (error) {
      console.error('List payments error:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Failed to fetch payments',
        code: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Handle payment webhook
   * POST /api/v1.0/payments/webhook
   * Called by Razorpay when payment status changes
   */
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret || webhookSecret === 'webhook_secret_from_dashboard' || webhookSecret === 'your_webhook_secret_here') {
        console.error('[RAZORPAY WEBHOOK] RAZORPAY_WEBHOOK_SECRET is not configured');
        return res.status(500).json({ status: false, message: 'Webhook not configured' });
      }

      if (!signature) {
        console.warn('[RAZORPAY WEBHOOK] Missing signature header');
        return res.status(400).json({ status: false, message: 'Missing webhook signature' });
      }

      // Verify webhook signature using raw body
      const rawBody = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('[RAZORPAY WEBHOOK] Invalid signature — possible spoofed request');
        return res.status(400).json({ status: false, message: 'Invalid webhook signature' });
      }

      const event = req.body.event;
      const payload = req.body.payload;

      console.log(`[RAZORPAY WEBHOOK] Verified event: ${event}`, {
        paymentId: payload?.payment?.entity?.id,
        orderId: payload?.payment?.entity?.order_id,
        status: payload?.payment?.entity?.status,
      });

      switch (event) {
        case 'payment.authorized':
          console.log('[RAZORPAY] Payment authorized:', payload.payment.entity.id);
          await this._updateOrderPaymentStatus(
            payload.payment.entity.order_id,
            payload.payment.entity.id,
            'authorized'
          );
          break;

        case 'payment.failed':
          console.log('[RAZORPAY] Payment failed:', payload.payment.entity.id);
          await this._updateOrderPaymentStatus(
            payload.payment.entity.order_id,
            payload.payment.entity.id,
            'failed'
          );
          break;

        case 'payment.captured':
          console.log('[RAZORPAY] Payment captured:', payload.payment.entity.id);
          await this._updateOrderPaymentStatus(
            payload.payment.entity.order_id,
            payload.payment.entity.id,
            'paid',
            'confirmed'
          );
          break;

        case 'refund.created':
          console.log('[RAZORPAY] Refund created:', payload.refund.entity.id);
          if (payload.refund?.entity?.payment_id) {
            await this._updateOrderPaymentStatus(
              null,
              payload.refund.entity.payment_id,
              'refunded'
            );
          }
          break;

        case 'order.paid':
          console.log('[RAZORPAY] Order paid:', payload.order.entity.id);
          await this._updateOrderPaymentStatus(
            payload.order.entity.id,
            null,
            'paid',
            'confirmed'
          );
          break;

        default:
          console.log('[RAZORPAY] Unhandled webhook event:', event);
      }

      return res.json({ status: true, message: 'Webhook received' });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({
        status: false,
        message: 'Webhook processing failed',
        code: 'WEBHOOK_ERROR',
      });
    }
  }
}

module.exports = PaymentController;
