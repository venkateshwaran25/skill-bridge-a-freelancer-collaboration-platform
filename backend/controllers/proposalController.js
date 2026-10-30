const Proposal = require("../models/Proposal");
const Project = require("../models/Project");
const Workplace = require("../models/Workplace");
const Task = require("../models/Task");
const Milestone = require("../models/Milestone");

// Create a proposal (Freelancers only)
const createProposal = async (req, res) => {
  try {
    const {
      projectId,
      bidAmount,
      proposedAmount,
      hourlyRate,
      estimatedHours,
      estimatedTotal,
      timeline,
      coverLetter,
      estimatedDays,
    } = req.body;

    if (!projectId || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: "Project ID and Cover Letter are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.status !== "open" || project.assignedFreelancer) {
      return res.status(400).json({
        success: false,
        message: "This project has already hired a freelancer and is closed for new proposals",
      });
    }

    // Check maximum freelancer proposal limit for this project
    const maxLimit = project.maxProposals || 5;
    if ((project.proposalsCount || 0) >= maxLimit) {
      return res.status(400).json({
        success: false,
        message: `Application limit reached for this project (Maximum ${maxLimit} freelancer applications allowed).`,
      });
    }

    // Check if user already submitted proposal
    const existing = await Proposal.findOne({
      project: projectId,
      freelancer: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a proposal for this project",
      });
    }

    // Calculate figures
    let calcTotal = estimatedTotal;
    if (hourlyRate && estimatedHours) {
      calcTotal = Number(hourlyRate) * Number(estimatedHours);
    }

    const finalBidAmount =
      proposedAmount || calcTotal || bidAmount || project.budget || 0;

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user._id,
      bidAmount: finalBidAmount,
      proposedAmount: proposedAmount ? Number(proposedAmount) : finalBidAmount,
      hourlyRate: hourlyRate ? Number(hourlyRate) : null,
      estimatedHours: estimatedHours ? Number(estimatedHours) : null,
      estimatedTotal: calcTotal ? Number(calcTotal) : null,
      timeline: timeline || `${estimatedDays || 7} days`,
      coverLetter,
      estimatedDays: estimatedDays || 7,
    });

    // Increment proposals count on project
    project.proposalsCount = (project.proposalsCount || 0) + 1;
    await project.save();

    const populated = await Proposal.findById(proposal._id)
      .populate("freelancer", "name email title rating hourlyRate skills portfolio bio location")
      .populate("project", "title budget budgetType budgetMin budgetMax hourlyRateMin hourlyRateMax");

    // Emit real-time proposal socket alert to project owner
    const io = req.app.get("io");
    if (io && project.postedBy) {
      io.to(project.postedBy.toString()).emit("proposal_alert", {
        type: "new_proposal",
        projectId: project._id,
        projectTitle: project.title,
        freelancerId: req.user._id,
        freelancerName: req.user.name,
        bidAmount,
        proposal: populated,
        message: `🎉 New proposal submitted by ${req.user.name} for "${project.title}" ($${bidAmount})`,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposal: populated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get proposals for a specific project (Project Owner)
const getProjectProposals = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Verify requesting user is owner
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can view project proposals",
      });
    }

    const proposals = await Proposal.find({ project: projectId })
      .populate("freelancer", "name email title rating hourlyRate skills bio profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      proposals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get my submitted proposals (Freelancer)
const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate({
        path: "project",
        populate: { path: "postedBy", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      proposals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update proposal status (Accept/Reject) & Auto-Create Workplace + Initial Tasks
const updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!["accepted", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const proposal = await Proposal.findById(id).populate("project");
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }

    // Check project owner
    if (proposal.project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    proposal.status = status;
    await proposal.save();

    let workplaceId = null;

    if (status === "accepted") {
      proposal.project.status = "in progress";
      proposal.project.assignedFreelancer = proposal.freelancer;
      await proposal.project.save();

      // Check if workplace already exists
      let workplace = await Workplace.findOne({ project: proposal.project._id });

      if (!workplace) {
        workplace = await Workplace.create({
          project: proposal.project._id,
          proposal: proposal._id,
          client: proposal.project.postedBy,
          freelancer: proposal.freelancer,
          title: proposal.project.title,
          description: proposal.project.description,
          budget: proposal.bidAmount,
          members: [
            { user: proposal.project.postedBy, role: "client" },
            { user: proposal.freelancer, role: "freelancer" },
          ],
        });

        // Create initial starter tasks for task management
        const task1 = await Task.create({
          workplace: workplace._id,
          title: "Project Alignment & Setup",
          description: `Kickoff consultation for project: ${proposal.project.title}. Finalize requirements and initial architecture.`,
          assignedTo: proposal.freelancer,
          createdBy: proposal.project.postedBy,
          priority: "high",
          status: "to-do",
          estimatedHours: 4,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        });

        const task2 = await Task.create({
          workplace: workplace._id,
          title: "Core Feature Implementation",
          description: "Develop core application features and milestone deliverables as outlined in accepted proposal.",
          assignedTo: proposal.freelancer,
          createdBy: proposal.project.postedBy,
          priority: "medium",
          status: "in-progress",
          estimatedHours: 20,
          dueDate: new Date(Date.now() + (proposal.estimatedDays || 7) * 24 * 60 * 60 * 1000),
        });

        workplace.tasks.push(task1._id, task2._id);

        // Create initial milestone
        const milestone1 = await Milestone.create({
          workplace: workplace._id,
          title: "Milestone 1 - Initial Deliverable",
          description: "Completion of initial codebase and baseline functionality.",
          amount: proposal.bidAmount,
          dueDate: new Date(Date.now() + (proposal.estimatedDays || 7) * 24 * 60 * 60 * 1000),
          createdBy: proposal.project.postedBy,
          assignedTo: proposal.freelancer,
          status: "pending",
        });

        workplace.milestones.push(milestone1._id);
        await workplace.save();
      }

      workplaceId = workplace._id;
    }

    // Emit real-time hiring status change socket event to freelancer
    const io = req.app.get("io");
    if (io && proposal.freelancer) {
      const freelancerId = proposal.freelancer._id ? proposal.freelancer._id.toString() : proposal.freelancer.toString();
      io.to(freelancerId).emit("proposal_status_changed", {
        type: "proposal_status",
        status,
        projectId: proposal.project._id,
        projectTitle: proposal.project.title,
        workplaceId,
        message: status === "accepted" 
          ? `🎉 Congratulations! Your proposal for "${proposal.project.title}" was ACCEPTED! Digital Workplace activated.` 
          : `Proposal update for "${proposal.project.title}": Status changed to ${status}.`,
        timestamp: new Date(),
      });
      if (workplaceId) {
        io.to(`workplace_${workplaceId}`).emit("workplace_activated", {
          workplaceId,
          projectTitle: proposal.project.title,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Proposal ${status}. Digital Workplace is active!`,
      proposal,
      workplaceId,
    });
  } catch (error) {
    console.error("Error updating proposal status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createProposal,
  getProjectProposals,
  getMyProposals,
  updateProposalStatus,
};
