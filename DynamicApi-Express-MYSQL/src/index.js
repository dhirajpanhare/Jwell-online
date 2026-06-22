/**
 * Dynamic API Express Application
 * Main entry point for the Express application
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

// Import configuration
const swaggerSpec = require('./config/swagger');

// Import services
const DynamicApiService = require('./services/dynamicApiService');
const ProcedureMetadataExtractor = require('./services/procedureMetadataExtractor');
const TransactionExecutor = require('./services/transactionExecutor');
const { initializeEmailService } = require('./services/emailService');

// Import controllers
const DynamicApiController = require('./controllers/dynamicApiController');

// Import routes
const { registerApiRoutes } = require('./routes/apiRoutes');
const { registerCommonProcedureRoutes } = require('./routes/commonProcedureRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Import utilities
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Body parser middleware - limit reduced to prevent DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS middleware - Allow only specific origins
const corsOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000','http://localhost:5173', 'http://localhost:4200', 'http://localhost:8000'];

const corsOptions = {
    origin: corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600
};

app.use(cors(corsOptions));

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet — security headers (CSP, HSTS, XSS, NoSniff, FrameGuard, etc.)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    xssFilter: true,
    noSniff: true,
    frameguard: { action: 'deny' },
}));

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(301, `https://${req.header('host')}${req.url}`);
        }
        next();
    });
}

// Global API rate limit — 200 req / 15 min per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// Auth-specific rate limits
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { status: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { status: false, message: 'Too many OTP requests, please try again later.' },
});
const paymentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { status: false, message: 'Too many payment requests, please slow down.' },
});

// Apply specific limiters on routes below (after route mounts)
app.use('/api/v1.0/auth/login', loginLimiter);
app.use('/api/v1.0/auth/send-otp', otpLimiter);
app.use('/api/v1.0/auth/resend-otp', otpLimiter);
app.use('/api/v1.0/auth/forgot-password', otpLimiter);
app.use('/api/v1.0/payments/create-order', paymentLimiter);

// Initialize email service
initializeEmailService();
// ============================================================================
// DATABASE CONNECTION POOLS
// ============================================================================

// Main database connection pool for procedure execution
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'DynamicApiDb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Separate connection pool for logging operations
const loggingConnection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
});

// ============================================================================
// SERVICE AND CONTROLLER INITIALIZATION
// ============================================================================

// Initialize metadata extractor with database pool and logger
const procedureMetadataExtractor = new ProcedureMetadataExtractor(async () => pool, logger);

// Initialize transaction executor with database pool and logger
const transactionExecutor = new TransactionExecutor(async () => pool, logger);

// Initialize service with database pools, metadataExtractor and logger
const dynamicApiService = new DynamicApiService(pool, loggingConnection, logger, procedureMetadataExtractor);
dynamicApiService.transactionExecutor = transactionExecutor;

// Initialize controller with service
const dynamicApiController = new DynamicApiController(dynamicApiService);

// ============================================================================
// SWAGGER SETUP
// ============================================================================

app.use('/api/v1.0/docs', swaggerUi.serve);
app.get('/api/v1.0/docs', swaggerUi.setup(swaggerSpec, { 
    swaggerOptions: { url: '/swagger.json' } 
}));
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Redirect /docs to /api/v1.0/docs
app.get('/docs', (req, res) => {
    res.redirect('/api/v1.0/docs');
});

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

// Create router instance
const apiRouter = express.Router();

// Register all API routes
registerApiRoutes(apiRouter, dynamicApiController);

// Register common procedure routes (cart, wishlist, categories, testimonials)
registerCommonProcedureRoutes(apiRouter, dynamicApiService);

// Mount auth routes
app.use('/api/v1.0/auth', authRoutes);

// Mount upload routes
app.use('/api/v1.0/upload', uploadRoutes);

// Mount payment routes
app.use('/api/v1.0/payments', paymentRoutes);

// Mount router
app.use(apiRouter);

// ============================================================================
// HEALTH / READINESS / LIVENESS ENDPOINTS
// ============================================================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api/ready', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ready', db: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(503).json({ status: 'not ready', db: 'disconnected', error: err.message });
    }
});

app.get('/api/live', (req, res) => {
    res.json({ status: 'alive', pid: process.pid, timestamp: new Date().toISOString() });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("");
    console.log("=".repeat(60));
    console.log("  Express Dynamic API - Development Server Started");
    console.log("=".repeat(60));
    console.log(`[STARTUP] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[STARTUP] Port: ${PORT}`);
    console.log(`[STARTUP] CORS Origins: ${process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8000'}`);
    console.log("");
    console.log("[STARTUP] API Endpoints:");
    console.log(`  - Swagger UI: http://localhost:${PORT}/api/v1.0/docs`);
    console.log(`  - Health Check: http://localhost:${PORT}/health`);
    console.log(`  - API Endpoint: http://localhost:${PORT}/api/v1.0/DynamicApi/DynamicApiExecute`);
    console.log("");
    logger.info(`✓ Server running on port ${PORT}`);
    logger.info(`✓ Swagger documentation at http://localhost:${PORT}/api/v1.0/docs`);
    logger.info(`✓ Health check endpoint at http://localhost:${PORT}/health`);
    console.log("=".repeat(60) + "");
});

module.exports = app;
