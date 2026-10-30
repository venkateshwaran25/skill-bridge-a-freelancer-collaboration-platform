const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const httpGet = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on("error", reject);
  });
};

const run = async () => {
  let chromeProc = null;
  try {
    console.log("Connecting to DB to fetch freelancer1 user...");
    await connectDB();
    const user = await User.findOne({ email: "freelancer1@skillbridge.ai" });
    if (!user) {
      throw new Error("freelancer1@skillbridge.ai not found in DB");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "skillbridge_secret_123",
      { expiresIn: "7d" }
    );
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    console.log("Starting Chrome with remote debugging on port 9222...");
    const os = require("os");
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const tempProfile = path.join(os.tmpdir(), "sb_chrome_reports_profile");
    if (!fs.existsSync(tempProfile)) {
      fs.mkdirSync(tempProfile, { recursive: true });
    }

    chromeProc = spawn(chromePath, [
      "--headless=new",
      "--remote-debugging-port=9222",
      `--user-data-dir=${tempProfile}`,
      "--window-size=1280,950",
      "--disable-gpu",
      "--no-sandbox",
      "http://localhost:5173/reports",
    ]);

    await sleep(2500);

    console.log("Querying Chrome debugging endpoints...");
    const targets = await httpGet("http://127.0.0.1:9222/json");
    console.log(`Found ${targets.length} browser targets`);

    const pageTarget = targets.find((t) => t.type === "page") || targets[0];
    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error("No page target with webSocketDebuggerUrl found");
    }

    console.log("Connecting WebSocket to CDP:", pageTarget.webSocketDebuggerUrl);
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();

    ws.on("message", (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    });

    const sendCDP = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, (res) => {
          if (res.error) reject(new Error(res.error.message));
          else resolve(res.result);
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise((resolve) => ws.on("open", resolve));
    console.log("WebSocket connected! Enabling Page and Runtime...");

    await sendCDP("Page.enable");
    await sendCDP("Runtime.enable");

    // Set localStorage with auth credentials
    console.log("Injecting auth credentials into localStorage...");
    await sendCDP("Runtime.evaluate", {
      expression: `
        localStorage.setItem('skillbridge_token', '${token}');
        localStorage.setItem('skillbridge_user', JSON.stringify(${JSON.stringify(userData)}));
      `,
    });

    // Navigate cleanly to http://localhost:5173/reports
    console.log("Navigating to http://localhost:5173/reports...");
    await sendCDP("Page.navigate", { url: "http://localhost:5173/reports" });

    // Wait for the reports page and API to load
    console.log("Waiting 3.5s for reports cards to load...");
    await sleep(3500);

    // Capture list view screenshot
    console.log("Capturing reports overview screenshot...");
    const listResult = await sendCDP("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });

    const artifactDir = "C:\\Users\\venka\\.gemini\\antigravity-ide\\brain\\02d55996-37be-4c3e-8153-21b46a88918e";
    const overviewArtifact = path.join(artifactDir, "reports_section_overview.png");
    const overviewLocal = path.join(__dirname, "../../reports_section_overview.png");

    fs.writeFileSync(overviewArtifact, Buffer.from(listResult.data, "base64"));
    fs.writeFileSync(overviewLocal, Buffer.from(listResult.data, "base64"));
    console.log("Saved overview screenshot to:", overviewArtifact);

    // Click 'View Full Report' on the first card
    console.log("Clicking 'View Full Report'...");
    await sendCDP("Runtime.evaluate", {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const viewBtn = btns.find(b => b.textContent.includes('View Full Report'));
        if (viewBtn) viewBtn.click();
      `,
    });

    await sleep(1500);

    console.log("Capturing detailed report screenshot...");
    const detailResult = await sendCDP("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });

    const detailArtifact = path.join(artifactDir, "reports_section_detail.png");
    const detailLocal = path.join(__dirname, "../../reports_section_detail.png");

    fs.writeFileSync(detailArtifact, Buffer.from(detailResult.data, "base64"));
    fs.writeFileSync(detailLocal, Buffer.from(detailResult.data, "base64"));
    console.log("Saved detail screenshot to:", detailArtifact);

    ws.close();
    console.log("ALL SCREENSHOTS CAPTURED SUCCESSFULLY!");
  } catch (err) {
    console.error("Screenshot capture error:", err);
  } finally {
    if (chromeProc) {
      chromeProc.kill();
    }
    process.exit(0);
  }
};

run();
