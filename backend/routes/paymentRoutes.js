const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create payment
router.post('/', paymentController.createPayment);

// Get workspace payments
router.get('/workspace/:workplaceId', paymentController.getWorkplacePayments);

// Get user payments
router.get('/user/history', paymentController.getUserPayments);

// Get payment stats
router.get('/stats/:workplaceId', paymentController.getPaymentStats);

// Get single payment
router.get('/:id', paymentController.getPayment);

// Update payment status
router.put('/:id/status', paymentController.updatePaymentStatus);

// Delete payment
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
