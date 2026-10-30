const express = require('express');
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Generate a new report for workspace
router.post('/generate/:workplaceId', reportController.generateReport);

// Get reports for a workspace
router.get('/workplace/:workplaceId', reportController.getWorkplaceReports);

// Get all user's reports across all workplaces
router.get('/my-reports', reportController.getUserReports);

// Get project stats (quick overview)
router.get('/stats/:workplaceId', reportController.getProjectStats);

// Get single report
router.get('/:id', reportController.getReport);

// Delete a report
router.delete('/:id', reportController.deleteReport);

module.exports = router;
