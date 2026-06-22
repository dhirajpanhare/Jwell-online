/**
 * Payment Routes
 * All payment-related API endpoints
 */

const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();
const paymentController = new PaymentController();

/**
 * @swagger
 * /api/v1.0/payments/create-order:
 *   post:
 *     summary: Create a payment order
 *     description: Create a Razorpay order for payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in paisa (e.g., 50000 for ₹500)
 *                 example: 50000
 *               currency:
 *                 type: string
 *                 description: Currency code
 *                 example: INR
 *               orderDescription:
 *                 type: string
 *                 description: Order description
 *                 example: Jewelry purchase
 *               customerId:
 *                 type: string
 *                 description: Customer ID
 *               customerEmail:
 *                 type: string
 *                 description: Customer email
 *                 example: customer@example.com
 *               customerPhone:
 *                 type: string
 *                 description: Customer phone
 *                 example: 9876543210
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid request
 */
router.post('/create-order', verifyAuth, (req, res) => paymentController.createOrder(req, res));

/**
 * @swagger
 * /api/v1.0/payments/verify-signature:
 *   post:
 *     summary: Verify payment signature
 *     description: Verify the payment signature returned from Razorpay
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Razorpay order ID
 *               paymentId:
 *                 type: string
 *                 description: Razorpay payment ID
 *               signature:
 *                 type: string
 *                 description: Payment signature from Razorpay
 *     responses:
 *       200:
 *         description: Signature verified successfully
 */
router.post('/verify-signature', verifyAuth, (req, res) => paymentController.verifySignature(req, res));

/**
 * @swagger
 * /api/v1.0/payments/{paymentId}:
 *   get:
 *     summary: Get payment details
 *     description: Fetch details of a specific payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Razorpay payment ID
 *     responses:
 *       200:
 *         description: Payment details fetched
 *       404:
 *         description: Payment not found
 */
router.get('/:paymentId', verifyAuth, (req, res) => paymentController.getPaymentDetails(req, res));

/**
 * @swagger
 * /api/v1.0/payments/orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     description: Fetch details of a specific order
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Razorpay order ID
 *     responses:
 *       200:
 *         description: Order details fetched
 *       404:
 *         description: Order not found
 */
router.get('/orders/:orderId', verifyAuth, (req, res) => paymentController.getOrderDetails(req, res));

/**
 * @swagger
 * /api/v1.0/payments/refund:
 *   post:
 *     summary: Refund a payment
 *     description: Process refund for a payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentId:
 *                 type: string
 *                 description: Razorpay payment ID
 *               amount:
 *                 type: number
 *                 description: Amount to refund (optional, full amount if not provided)
 *               reason:
 *                 type: string
 *                 description: Reason for refund
 *     responses:
 *       200:
 *         description: Refund processed successfully
 */
router.post('/refund', verifyAuth, (req, res) => paymentController.refundPayment(req, res));

/**
 * @swagger
 * /api/v1.0/payments/capture:
 *   post:
 *     summary: Capture a payment
 *     description: Capture an authorized payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentId:
 *                 type: string
 *                 description: Razorpay payment ID
 *               amount:
 *                 type: number
 *                 description: Amount to capture in paisa
 *     responses:
 *       200:
 *         description: Payment captured successfully
 */
router.post('/capture', verifyAuth, (req, res) => paymentController.capturePayment(req, res));

/**
 * @swagger
 * /api/v1.0/payments:
 *   get:
 *     summary: List all payments
 *     description: Fetch list of all payments
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of payments to fetch
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *           default: 0
 *         description: Number of payments to skip
 *     responses:
 *       200:
 *         description: Payments fetched successfully
 */
router.get('/', verifyAuth, (req, res) => paymentController.listPayments(req, res));

/**
 * @swagger
 * /api/v1.0/payments/webhook:
 *   post:
 *     summary: Payment webhook
 *     description: Handle Razorpay payment webhook events
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post('/webhook', (req, res) => paymentController.handleWebhook(req, res));

module.exports = router;
