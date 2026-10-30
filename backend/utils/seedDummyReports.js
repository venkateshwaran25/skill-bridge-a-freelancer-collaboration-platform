const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Project = require("../models/Project");
const Workplace = require("../models/Workplace");
const Report = require("../models/Report");

const seedReports = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding dummy reports...");

    const users = await User.find({});
    const workplaces = await Workplace.find({}).populate("project");

    if (workplaces.length === 0) {
      console.log("No workplaces found. Creating dummy report requires at least 1 workplace.");
      process.exit(0);
    }

    console.log(`Found ${workplaces.length} workplaces and ${users.length} users.`);

    // Clear existing dummy reports to prevent duplicate flood
    await Report.deleteMany({});
    console.log("Cleared existing reports.");

    const dummyReportsData = [
      {
        title: "Full-Stack E-Commerce: Sprint 3 AI Execution Report",
        type: "weekly",
        summary: `Executive Project Overview:
The E-Commerce platform project has achieved high sprint velocity this week. Core authentication, product catalog filters, and Stripe webhook listeners were finalized.

Key Accomplishments:
- Implemented JWT token refresh flow and role-based route guards.
- Completed responsive shopping cart and checkout UI with instant total calculations.
- Integrated WebSocket notifications for live bid status updates.

Blockers & Items Requiring Attention:
- Stripe test sandbox API webhook signature keys require periodic renewal.
- Multi-currency conversion rate caching needs an hourly invalidation strategy.

Strategic Recommendations:
- Proceed with end-to-end integration testing on staging environment.
- Prepare automated lighthouse audit to guarantee 90+ performance score across mobile devices.`,
        aiRecommendation: "Authentication, checkout, and real-time bidding are ahead of schedule. Prioritize end-to-end payment testing and staging deployment before client sign-off.",
        metrics: {
          totalTasks: 18,
          completedTasks: 14,
          completionPercentage: 82,
          delayedTasks: 1,
          onScheduleTasks: 17,
          avgTaskCompletionTime: 4.5,
          totalMilestones: 4,
          completedMilestones: 3,
          delayedMilestones: 0,
          projectCompletionPercentage: 78,
          budgetUsed: 2870,
          budgetRemaining: 630,
          budgetPercentage: 82,
        },
        insights: {
          strengths: [
            "Sprint velocity is 24% higher than baseline expectations.",
            "Zero critical security vulnerabilities detected in API auth endpoints.",
            "High test pass rate (96.4%) across all backend route controllers.",
          ],
          concerns: [
            "Minor delay on mobile checkout screen keyboard avoidance.",
            "Stripe webhook testing requires live domain tunneling.",
          ],
          recommendations: [
            "Prioritize payment edge-case testing with invalid card numbers.",
            "Optimize bundle chunk sizes using dynamic code splitting.",
          ],
        },
        taskStatuses: { todo: 3, inProgress: 1, completed: 14, blocked: 0 },
        milestoneStatuses: { notStarted: 0, inProgress: 1, completed: 3, delayed: 0, onHold: 0 },
        teamPerformance: {
          teamProductivity: "high",
          averageTasksPerTeamMember: 7,
          topPerformer: { name: "Sarah Jenkins", tasksCompleted: 9 },
        },
        riskAssessment: {
          overallRisk: "low",
          atRiskTasks: [],
          atRiskMilestones: [],
        },
        aiGenerated: true,
      },
      {
        title: "AI Knowledge Base & LLM Pipeline Health Audit",
        type: "weekly",
        summary: `Executive Project Overview:
PDF document ingestion pipeline and vector similarity search have successfully passed initial stress tests. Gemini API token throughput remains within budget.

Key Accomplishments:
- PDF chunking and semantic embedding generation functional for files up to 50MB.
- Low-latency chat interface connected to Google Gemini 1.5 Flash.
- Added citation highlighting pointing users to exact page numbers in uploaded source documents.

Blockers & Items Requiring Attention:
- Complex nested tables in scanned PDFs require OCR fallback mode.
- High concurrency stress test revealed slight latency increase on batch uploads.

Strategic Recommendations:
- Implement client-side PDF preview worker to lighten server memory footprint.
- Enable Redis-backed query response caching for repetitive FAQ lookups.`,
        aiRecommendation: "Vector indexing and Gemini model inference response time is under 1.2s. Focus on caching frequent queries and fine-tuning prompt templates for edge cases.",
        metrics: {
          totalTasks: 15,
          completedTasks: 11,
          completionPercentage: 73,
          delayedTasks: 0,
          onScheduleTasks: 15,
          avgTaskCompletionTime: 5.8,
          totalMilestones: 4,
          completedMilestones: 2,
          delayedMilestones: 0,
          projectCompletionPercentage: 70,
          budgetUsed: 3100,
          budgetRemaining: 1100,
          budgetPercentage: 73,
        },
        insights: {
          strengths: [
            "Gemini API integration responses averaged 1.1s latency.",
            "Document parsing pipeline correctly identifies 99.1% of headers and sections.",
          ],
          concerns: [
            "Scanned non-searchable PDFs require higher CPU compute for OCR.",
          ],
          recommendations: [
            "Deploy Redis cache to serve identical questions instantaneously.",
            "Run automated QA test suite on 50 representative domain documents.",
          ],
        },
        taskStatuses: { todo: 3, inProgress: 1, completed: 11, blocked: 0 },
        milestoneStatuses: { notStarted: 1, inProgress: 1, completed: 2, delayed: 0, onHold: 0 },
        teamPerformance: {
          teamProductivity: "high",
          averageTasksPerTeamMember: 5.5,
          topPerformer: { name: "Alex Chen", tasksCompleted: 8 },
        },
        riskAssessment: {
          overallRisk: "low",
          atRiskTasks: [],
          atRiskMilestones: [],
        },
        aiGenerated: true,
      },
      {
        title: "UI/UX Modernization & Design System Milestone Review",
        type: "milestone",
        summary: `Executive Project Overview:
The design system overhaul and component library development are currently in Phase 3. 45 responsive React components have been finalized with dark mode support.

Key Accomplishments:
- Glassmorphic card system and animated modals integrated into core pages.
- Accessibility review completed: WCAG 2.1 AA color contrast compliance achieved.
- Reusable micro-animations added for status badges and button states.

Blockers & Items Requiring Attention:
- Mobile Safari backdrop-filter compatibility tweak needed for older iOS versions.

Strategic Recommendations:
- Consolidate Tailwind CSS configuration to purge unused color classes.
- Schedule cross-browser audit across Firefox, Edge, Chrome, and Safari.`,
        aiRecommendation: "Component library is 90% complete with exceptional aesthetic polish. Finalize remaining form validation components and cross-browser testing.",
        metrics: {
          totalTasks: 20,
          completedTasks: 18,
          completionPercentage: 90,
          delayedTasks: 0,
          onScheduleTasks: 20,
          avgTaskCompletionTime: 3.2,
          totalMilestones: 3,
          completedMilestones: 2,
          delayedMilestones: 0,
          projectCompletionPercentage: 88,
          budgetUsed: 2200,
          budgetRemaining: 300,
          budgetPercentage: 88,
        },
        insights: {
          strengths: [
            "Flawless visual hierarchy and responsive glassmorphism UI tokens.",
            "Zero broken styles across standard screen resolutions.",
          ],
          concerns: [
            "Ensure fallback styles for older browsers without CSS backdrop-filter support.",
          ],
          recommendations: [
            "Finalize documentation in Storybook / interactive component catalog.",
          ],
        },
        taskStatuses: { todo: 1, inProgress: 1, completed: 18, blocked: 0 },
        milestoneStatuses: { notStarted: 0, inProgress: 1, completed: 2, delayed: 0, onHold: 0 },
        teamPerformance: {
          teamProductivity: "excellent",
          averageTasksPerTeamMember: 9,
          topPerformer: { name: "Elena Rostova", tasksCompleted: 11 },
        },
        riskAssessment: {
          overallRisk: "low",
          atRiskTasks: [],
          atRiskMilestones: [],
        },
        aiGenerated: true,
      },
    ];

    // For every user, seed reports connected to the workplaces
    const reportsToInsert = [];

    users.forEach((user, uIdx) => {
      dummyReportsData.forEach((repData, rIdx) => {
        const wp = workplaces[rIdx % workplaces.length];
        reportsToInsert.push({
          ...repData,
          workplaceId: wp._id,
          projectId: wp.project?._id || wp._id,
          generatedBy: user._id,
          createdAt: new Date(Date.now() - (rIdx * 3 + 1) * 24 * 60 * 60 * 1000),
          generatedAt: new Date(Date.now() - (rIdx * 3 + 1) * 24 * 60 * 60 * 1000),
        });
      });
    });

    await Report.insertMany(reportsToInsert);
    console.log(`Successfully seeded ${reportsToInsert.length} dummy reports across all users and workplaces!`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding dummy reports:", err);
    process.exit(1);
  }
};

seedReports();
