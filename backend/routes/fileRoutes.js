const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  upload,
  uploadFile,
  getWorkplaceFiles,
  deleteFile,
  downloadFile,
} = require("../controllers/fileController");

const router = express.Router();

// All routes require authentication
router.use(protect);

// File routes
router.post("/upload", upload.single("file"), uploadFile);
router.get("/workplace/:workplaceId", getWorkplaceFiles);
router.delete("/:id", deleteFile);
router.get("/:id/download", downloadFile);

module.exports = router;
