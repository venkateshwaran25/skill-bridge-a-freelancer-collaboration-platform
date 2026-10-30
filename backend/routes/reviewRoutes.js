const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Submit review
router.post('/', reviewController.submitReview);

// Get reviews for a user (received reviews)
router.get('/user/:userId', reviewController.getUserReviews);

// Get reviews by a user (reviews given by user)
router.get('/from/:userId', reviewController.getReviewsByUser);

// Get workspace reviews
router.get('/workspace/:workplaceId', reviewController.getWorkspaceReviews);

// Get single review
router.get('/:id', reviewController.getReview);

// Mark helpful/unhelpful
router.put('/:id/helpful', reviewController.markHelpful);

// Delete review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
