# 🚀 SkillBridge AI
> **Next-Generation AI-Driven Freelance Marketplace & Collaborative Digital Workplace**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev/)
[![Socket.io](https://img.shields.io/badge/RealTime-Socket.io-black.svg)](https://socket.io/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama3-purple.svg)](https://groq.com/)
[![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS%20v4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Core Workflows](#-core-workflows)
- [API Highlights](#-api-highlights)
- [Security & Governance](#-security--governance)

---

## 🌟 Project Overview

**SkillBridge AI** is a comprehensive, full-cycle platform engineered to bridge the gaps in traditional freelancing marketplaces. Conventional platforms (such as Upwork or Fiverr) typically stop at job postings and proposal bidding, leaving parties to navigate external, scattered tools for execution and payments.

SkillBridge AI combines three critical capabilities into a single unified platform:
1. **AI Copilot & Hiring Assistant:** Leverages Google Gemini and Groq LLMs for automated proposal generation, project scope refinement, budget estimation, and skill-gap identification.
2. **Post-Hiring Digital Workplace:** Replaces disjointed tools (Slack, Trello, Google Drive) with built-in real-time chat, Kanban task boards, and cloud file management.
3. **Milestone Escrow & Payment Governance:** Protects both clients and freelancers by securing milestone funds in platform escrow, releasing payouts upon verified deliverable approval, and providing administrative dispute mediation.

---

## 🚀 Key Features

### 1. 🤖 Intelligent AI Copilot
- **AI Proposal Generator:** Automatically analyzes project requirements against a freelancer's skill set to craft personalized, high-converting cover letters.
- **AI Project Scope Optimizer:** Assists clients in refining raw project thoughts into well-structured technical scopes and deliverable lists.
- **AI Budget Estimator:** Analyzes complexity, duration, and market rates to recommend realistic pricing tiers (Fixed vs. Hourly).
- **AI Profile Skill-Gap Audit:** Scans freelancer profiles and highlights recommended skills to boost hireability.
- **24/7 AI Platform Assistant:** Natural language assistant embedded to help users navigate platform features.

### 2. 💼 Marketplace & Matchmaking
- **Role-Based Workflows:** Distinct, customized dashboards for **Clients**, **Freelancers**, and **Admins**.
- **Flexible Postings:** Support for fixed-price, hourly, and negotiable project postings with skill tags and max proposal limits.
- **Showcase & Portfolios:** Freelancers showcase live projects, repositories, and media deliverables.
- **Intelligent Discovery:** Multi-parameter search across technologies, categories, experience levels, and ratings.

### 3. 🏢 Collaborative Digital Workplace
- **Task Management Board:** Create, assign, and track project tasks across `To Do`, `In Progress`, and `Done` states with priority tags and deadlines.
- **Real-Time Workspace Chat:** Socket.io-powered messaging with typing indicators, online/offline presence, and chat persistence.
- **Milestone & Deliverable Tracker:** Visual timeline tracking project completion percentage with direct file submission and review.
- **Cloud File Vault:** Multi-format file attachments and asset management integrated with **Cloudinary**.

### 4. 💳 Milestone Escrow & Payments
- **Escrow Fund Protection:** Client deposits funds upfront into platform escrow; capital remains secure while work is completed.
- **Incremental Release:** Payments release milestone-by-milestone upon client verification.
- **Automated Invoicing:** Generates unique invoices (`INV-...`) with full timestamps and status history.
- **Admin Force-Release:** Administrators can audit workplace deliverables and force-release escrow funds if clients become unresponsive.

### 5. 🛡️ Governance & Moderation Center
- Comprehensive audit metrics: user growth, transaction volume, active workspaces, and platform risk.
- Moderation suite for community feed posts, comments, reviews, and portfolio showcases.
- Account suspension and role management controls.

---

## 🏗️ System Architecture

```
                  ┌────────────────────────────────────────┐
                  │    React 18 + Vite + Tailwind CSS      │
                  │   (Redux Toolkit, Context, Router)     │
                  └───────────────────┬────────────────────┘
                                      │
                         REST APIs / WebSocket Events
                                      │
                  ┌───────────────────▼────────────────────┐
                  │          Node.js + Express.js          │
                  │       (JWT Auth, RBAC, Middleware)     │
                  └───────┬───────────┬────────────┬───────┘
                          │           │            │
            Socket.io Real-time       │     AI Integrations
                          │           │            │
        ┌─────────────────▼┐   ┌──────▼──────┐   ┌─▼──────────────────┐
        │  WebSockets Hub  │   │   MongoDB   │   │  Google Gemini 1.5 │
        │ (Presence, Chat) │   │ (Atlas/Local│   │  & Groq Llama-3    │
        └──────────────────┘   └─────────────┘   └────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 8, Tailwind CSS v4, Redux Toolkit, Framer Motion, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js (v5), Socket.io (v4), Nodemailer, Morgan |
| **Database** | MongoDB Atlas & Local MongoDB (with automated multi-tier failover via Mongoose) |
| **Cloud Storage** | Cloudinary (Files, avatars, deliverables) |
| **AI Models** | Google Gemini API (`@google/generative-ai`), Groq SDK (`groq-sdk`) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing, 6-digit OTP verification |

---

## 📁 Project Structure

```
skillbridge-ai/
├── backend/
│   ├── ai/                 # AI service & prompt engineering (Gemini/Groq)
│   ├── config/             # Database connection & DNS failover handlers
│   ├── controllers/        # Express route controllers (Auth, Projects, Payments, etc.)
│   ├── middleware/         # JWT protection & role authorization
│   ├── models/             # Mongoose schemas (User, Project, Milestone, Payment, Workplace...)
│   ├── routes/             # RESTful API endpoints
│   ├── services/           # Email (SMTP) & automated AI reporting
│   ├── sockets/            # Socket.io handlers (chat, presence, typing)
│   ├── utils/              # Data seeders, screenshot utilities, metrics
│   ├── .env.example        # Environment variable template
│   ├── package.json
│   └── server.js           # Server entry point & socket initialization
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI widgets, modals, and managers
│   │   ├── context/        # Auth and socket state contexts
│   │   ├── layouts/        # AppLayout (navbars, sidebar, search modal)
│   │   ├── pages/          # Main application views (Dashboard, Marketplace, Workplace...)
│   │   ├── routes/         # Protected and public routing definitions
│   │   ├── services/       # Axios API client & socket listeners
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore              # Ignores sensitive keys, .env, and node_modules
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/skillbridge-ai.git
   cd skillbridge-ai
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🔐 Environment Configuration

Create a `.env` file inside the `backend/` directory using `backend/.env.example` as a reference:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Email configuration (for OTP verification)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Cloudinary (File and asset uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Generative AI APIs
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

> **Security Note:** Never commit your active `.env` file to source control. It is already included in `.gitignore`.

---

## 🚦 Running the Application

### Development Mode

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   *Runs at:* `http://localhost:5000`

2. **Start Frontend Client (in a separate terminal):**
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs at:* `http://localhost:5173`

---

## 🔄 Core Workflows

### 1. Proposal & Smart Matchmaking
1. **Client** publishes a project with budget ranges and required tech stack.
2. **AI Optimizer** refines and structures the brief.
3. **Freelancers** discover the listing and trigger the **AI Proposal Assistant** to generate tailored cover letters.
4. **Client** reviews proposals, compares profiles, and awards the contract.

### 2. Workplace Execution & Escrow
1. A private **Digital Workplace** is automatically provisioned for the project.
2. The **Client** deposits the milestone budget into **Platform Escrow**.
3. Team coordinates via real-time **Socket.io Chat** and manages progress on the **Task Board**.
4. Freelancer submits completed deliverables to the milestone.
5. Client verifies work and approves release: funds transition from `pending` to `completed`.

---

## 📜 API Highlights

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new account with role selection |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `GET` | `/api/projects` | Fetch filtered marketplace projects |
| `POST` | `/api/projects` | Create a new project (Client/Admin only) |
| `POST` | `/api/ai/proposal` | Generate AI-tailored proposal |
| `POST` | `/api/ai/optimize-description`| AI technical requirement refinement |
| `GET` | `/api/workplaces/:id` | Fetch full digital workspace context |
| `POST` | `/api/payments` | Create milestone payment / escrow deposit |
| `PUT` | `/api/admin/payments/:id/release` | Admin force-release escrow funds |

---

## 📄 License
This project is licensed under the **MIT License**.
