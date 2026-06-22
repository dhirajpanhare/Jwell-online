/**
 * Common Procedure Routes
 * Provides convenient endpoints for frequently used stored procedures
 * with proper parameter validation and default values
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Register common procedure routes
 * @param {express.Router} router - Express router instance
 * @param {DynamicApiService} dynamicApiService - Service for executing procedures
 */
function registerCommonProcedureRoutes(router, dynamicApiService) {
    /**
     * GET /api/v1.0/categories
     * Get all product categories
     * SP_GetCategories() - No parameters required
     */
    router.get('/api/v1.0/categories', async (req, res) => {
        try {
            logger.info('Fetching categories');
            
            const result = await dynamicApiService.executeProcedureAsync(
                'SP_GetCategories',
                '', // No parameters
                '|',
                '=',
                req.user?.email || 'anonymous'
            );

            return res.status(result.status ? 200 : 400).json({
                status: result.status,
                message: result.message,
                executionTime: result.executionTime,
                data: result.data || []
            });
        } catch (error) {
            logger.error(`Error fetching categories: ${error.message}`);
            return res.status(500).json({
                status: false,
                message: 'Error fetching categories',
                data: []
            });
        }
    });

    /**
     * GET /api/v1.0/cart
     * Get user's cart items
     * SP_GetCart(p_UserId) - Requires user ID from authentication
     */
    router.get('/api/v1.0/cart', authenticate, async (req, res) => {
        try {
            if (!req.user?.id) {
                return res.status(401).json({
                    status: false,
                    message: 'User ID not found in authentication token',
                    data: []
                });
            }

            logger.info(`Fetching cart for user: ${req.user.id}`);

            const parameters = `p_UserId=${req.user.id}`;
            
            const result = await dynamicApiService.executeProcedureAsync(
                'SP_GetCart',
                parameters,
                '|',
                '=',
                req.user?.email || 'anonymous'
            );

            return res.status(result.status ? 200 : 400).json({
                status: result.status,
                message: result.message,
                executionTime: result.executionTime,
                data: result.data || []
            });
        } catch (error) {
            logger.error(`Error fetching cart: ${error.message}`);
            return res.status(500).json({
                status: false,
                message: 'Error fetching cart',
                data: []
            });
        }
    });

    /**
     * GET /api/v1.0/wishlist
     * Get user's wishlist items
     * SP_GetWishlist(p_UserId) - Requires user ID from authentication
     */
    router.get('/api/v1.0/wishlist', authenticate, async (req, res) => {
        try {
            if (!req.user?.id) {
                return res.status(401).json({
                    status: false,
                    message: 'User ID not found in authentication token',
                    data: []
                });
            }

            logger.info(`Fetching wishlist for user: ${req.user.id}`);

            const parameters = `p_UserId=${req.user.id}`;
            
            const result = await dynamicApiService.executeProcedureAsync(
                'SP_GetWishlist',
                parameters,
                '|',
                '=',
                req.user?.email || 'anonymous'
            );

            return res.status(result.status ? 200 : 400).json({
                status: result.status,
                message: result.message,
                executionTime: result.executionTime,
                data: result.data || []
            });
        } catch (error) {
            logger.error(`Error fetching wishlist: ${error.message}`);
            return res.status(500).json({
                status: false,
                message: 'Error fetching wishlist',
                data: []
            });
        }
    });

    /**
     * GET /api/v1.0/testimonials
     * Get testimonials with optional limit
     * SP_GetTestimonials(p_Limit) - Optional limit (default: 6)
     * Query param: ?limit=10
     */
    router.get('/api/v1.0/testimonials', async (req, res) => {
        try {
            // Get limit from query parameter, default to 6
            const limit = parseInt(req.query.limit, 10) || 6;

            // Validate limit is a positive number
            if (limit <= 0 || limit > 1000) {
                return res.status(400).json({
                    status: false,
                    message: 'Limit must be a positive number between 1 and 1000',
                    data: []
                });
            }

            logger.info(`Fetching testimonials with limit: ${limit}`);

            const parameters = `p_Limit=${limit}`;
            
            const result = await dynamicApiService.executeProcedureAsync(
                'SP_GetTestimonials',
                parameters,
                '|',
                '=',
                req.user?.email || 'anonymous'
            );

            return res.status(result.status ? 200 : 400).json({
                status: result.status,
                message: result.message,
                executionTime: result.executionTime,
                data: result.data || []
            });
        } catch (error) {
            logger.error(`Error fetching testimonials: ${error.message}`);
            return res.status(500).json({
                status: false,
                message: 'Error fetching testimonials',
                data: []
            });
        }
    });
}

module.exports = { registerCommonProcedureRoutes };
