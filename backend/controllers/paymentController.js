const Payment = require('../models/Payment');
const Milestone = require('../models/Milestone');
const Workplace = require('../models/Workplace');
const Notification = require('../models/Notification');

/**
 * Create payment record
 * POST /api/payments
 */
exports.createPayment = async (req, res) => {
  try {
    const { workplaceId, projectId, milestoneId, recipientId, amount, description, dueDate, paymentMethod } = req.body;
    const payerId = (req.user._id || req.user.id).toString();

    // Verify workplace and user authorization
    const workplace = await Workplace.findById(workplaceId);
    if (!workplace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workplace.client.toString() !== payerId) {
      return res.status(403).json({ error: 'Only client can create payments' });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment = new Payment({
      workplaceId,
      projectId,
      milestoneId,
      payerId,
      recipientId,
      amount,
      currency: 'USD',
      description,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      paymentMethod,
      invoiceNumber,
      status: 'pending',
    });

    if (milestoneId) {
      const milestone = await Milestone.findById(milestoneId);
      if (milestone) {
        payment.relatedMilestone = {
          title: milestone.title,
          dueDate: milestone.dueDate,
        };
      }
    }

    await payment.save();

    // Create notification
    await Notification.create({
      userId: recipientId,
      type: 'payment_pending',
      title: 'Payment Pending',
      message: `You have a pending payment of $${amount}`,
      relatedPayment: payment._id,
      priority: 'high',
      icon: '💰',
    });

    res.json({
      message: 'Payment created successfully',
      payment,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

/**
 * Get payments for workspace
 * GET /api/payments/workspace/:workplaceId
 */
exports.getWorkplacePayments = async (req, res) => {
  try {
    const { workplaceId } = req.params;
    const userId = (req.user._id || req.user.id).toString();
    const { status, limit = 10, page = 1 } = req.query;

    // Verify user access
    const workplace = await Workplace.findById(workplaceId);
    if (!workplace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const isClient = workplace.client.toString() === userId;
    const isMember = workplace.members?.some((m) => m.user.toString() === userId);

    if (!isClient && !isMember) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const skip = (page - 1) * limit;
    let query = { workplaceId };

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('payerId', 'name email image')
      .populate('recipientId', 'name email image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

/**
 * Get user's payments (as payer or recipient)
 * GET /api/payments/user/history
 */
exports.getUserPayments = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { role = 'all', status, limit = 20, page = 1 } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    if (role === 'payer') {
      query.payerId = userId;
    } else if (role === 'recipient') {
      query.recipientId = userId;
    } else {
      query = { $or: [{ payerId: userId }, { recipientId: userId }] };
    }

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('payerId', 'name email image')
      .populate('recipientId', 'name email image')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

/**
 * Get single payment details
 * GET /api/payments/:id
 */
exports.getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate('payerId', 'name email image')
      .populate('recipientId', 'name email image')
      .populate('projectId', 'title')
      .populate('milestoneId', 'title');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

/**
 * Update payment status
 * PUT /api/payments/:id/status
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, transactionId } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify authorization (payer or recipient)
    if (payment.payerId.toString() !== userId && payment.recipientId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const oldStatus = payment.status;
    payment.status = status;
    if (transactionId) payment.transactionId = transactionId;
    if (notes) payment.notes = notes;

    if (status === 'completed') {
      payment.paidDate = new Date();

      // Create notification
      await Notification.create({
        userId: payment.recipientId,
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of $${payment.amount} received successfully`,
        relatedPayment: payment._id,
        icon: '✅',
      });
    } else if (status === 'refunded') {
      payment.refundDate = new Date();

      // Create notification
      await Notification.create({
        userId: payment.recipientId,
        type: 'payment_received',
        title: 'Payment Refunded',
        message: `Payment of $${payment.amount} has been refunded`,
        relatedPayment: payment._id,
        icon: '💸',
      });
    }

    await payment.save();

    res.json({
      message: `Payment status updated from ${oldStatus} to ${status}`,
      payment,
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

/**
 * Get payment statistics for workspace
 * GET /api/payments/stats/:workplaceId
 */
exports.getPaymentStats = async (req, res) => {
  try {
    const { workplaceId } = req.params;

    const payments = await Payment.find({ workplaceId });

    const stats = {
      totalAmount: 0,
      completedAmount: 0,
      pendingAmount: 0,
      totalPayments: payments.length,
      completedPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
    };

    payments.forEach((payment) => {
      stats.totalAmount += payment.amount;

      if (payment.status === 'completed') {
        stats.completedAmount += payment.amount;
        stats.completedPayments++;
      } else if (payment.status === 'pending') {
        stats.pendingAmount += payment.amount;
        stats.pendingPayments++;
      } else if (payment.status === 'failed') {
        stats.failedPayments++;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

/**
 * Delete payment (only if pending)
 * DELETE /api/payments/:id
 */
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.payerId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending payments' });
    }

    await Payment.findByIdAndDelete(id);

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};
