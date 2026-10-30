const mongoose = require('mongoose');
const Review = require('../models/Review');
const Workplace = require('../models/Workplace');
const User = require('../models/User');

/**
 * Submit a review
 * POST /api/reviews
 */
exports.submitReview = async (req, res) => {
  try {
    const { toUserId, workplaceId, projectId, rating, title, comment, categories, reviewerType } = req.body;
    const fromUserId = req.user._id || req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      fromUser: fromUserId,
      toUser: toUserId,
      workplaceId,
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this user for this project' });
    }

    // Verify workplace exists and user is member
    const workplace = await Workplace.findById(workplaceId);
    if (!workplace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const isMember = workplace.members?.some((m) => m.user.toString() === fromUserId.toString());
    if (!isMember && workplace.client.toString() !== fromUserId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Create review with approved status by default
    const review = new Review({
      fromUser: fromUserId,
      toUser: toUserId,
      workplaceId,
      projectId,
      rating,
      title,
      comment,
      categories: categories || {},
      reviewerType: reviewerType || (workplace.client.toString() === fromUserId.toString() ? 'client' : 'freelancer'),
      status: 'approved',
      isVerifiedTransaction: true,
    });

    await review.save();

    // Update user's average rating
    await updateUserRating(toUserId);

    res.json({
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

/**
 * Get reviews for a user
 * GET /api/reviews/user/:userId
 */
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1, status } = req.query;

    const skip = (page - 1) * limit;

    let query = { toUser: userId, status: status || { $ne: 'rejected' } };

    const reviews = await Review.find(query)
      .populate('fromUser', 'name title image _id')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Calculate average ratings using new mongoose.Types.ObjectId
    const objectIdUser = new mongoose.Types.ObjectId(userId);
    const averageRating = await Review.aggregate([
      { $match: { toUser: objectIdUser, status: { $ne: 'rejected' } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    res.json({
      reviews,
      averageRating: averageRating[0]?.avg || 0,
      totalReviews: averageRating[0]?.count || 0,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

/**
 * Get reviews by a specific user
 * GET /api/reviews/from/:userId
 */
exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ fromUser: userId })
      .populate('toUser', 'name image _id')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ fromUser: userId });

    res.json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

/**
 * Get single review
 * GET /api/reviews/:id
 */
exports.getReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('fromUser', 'name title image')
      .populate('toUser', 'name title image')
      .populate('projectId', 'title');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

/**
 * Update review (helpful/unhelpful)
 * PUT /api/reviews/:id/helpful
 */
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (helpful) {
      review.helpful += 1;
    } else {
      review.unhelpful += 1;
    }

    await review.save();

    res.json({ message: 'Thanks for your feedback', review });
  } catch (error) {
    console.error('Error marking helpful:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

/**
 * Delete review (only author or admin)
 * DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.fromUser.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Review.findByIdAndDelete(id);

    // Update user's average rating
    await updateUserRating(review.toUser);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

/**
 * Get workspace reviews (all reviews within a project)
 * GET /api/reviews/workspace/:workplaceId
 */
exports.getWorkspaceReviews = async (req, res) => {
  try {
    const { workplaceId } = req.params;

    const reviews = await Review.find({ workplaceId, status: 'approved' })
      .populate('fromUser', 'name image')
      .populate('toUser', 'name image')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching workspace reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

/**
 * Helper function: Update user's average rating
 */
const updateUserRating = async (userId) => {
  try {
    const objectIdUser = new mongoose.Types.ObjectId(userId);
    const reviews = await Review.aggregate([
      { $match: { toUser: objectIdUser, status: { $ne: 'rejected' } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = reviews[0]?.averageRating || 0;
    const totalReviews = reviews[0]?.totalReviews || 0;

    await User.findByIdAndUpdate(userId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews,
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};

module.exports = {
  submitReview: exports.submitReview,
  getUserReviews: exports.getUserReviews,
  getReviewsByUser: exports.getReviewsByUser,
  getReview: exports.getReview,
  markHelpful: exports.markHelpful,
  deleteReview: exports.deleteReview,
  getWorkspaceReviews: exports.getWorkspaceReviews,
};
