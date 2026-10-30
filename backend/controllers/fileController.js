const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const WorkplaceFile = require("../models/WorkplaceFile");
const Workplace = require("../models/Workplace");

// Configure Cloudinary if available
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Configure multer for in-memory file handling
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

// Upload file to workspace
const uploadFile = async (req, res) => {
  try {
    const { workplaceId, description } = req.body;

    if (!req.file || !workplaceId) {
      return res.status(400).json({
        success: false,
        message: "File and workplace ID are required",
      });
    }

    const workplace = await Workplace.findById(workplaceId);

    if (!workplace) {
      return res.status(404).json({
        success: false,
        message: "Workplace not found",
      });
    }

    // Determine file type
    let fileType = "other";
    if (req.file.mimetype.startsWith("image/")) fileType = "image";
    else if (req.file.mimetype.startsWith("video/")) fileType = "video";
    else if (req.file.mimetype.startsWith("audio/")) fileType = "audio";
    else if (
      req.file.mimetype.includes("pdf") ||
      req.file.mimetype.includes("document") ||
      req.file.mimetype.includes("text")
    )
      fileType = "document";

    let fileUrl = "";
    let publicId = `file_${Date.now()}`;

    // Upload to Cloudinary if configured, otherwise fallback to Data URI for direct DB storage
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "skillbridge/workplace-files",
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        fileUrl = result.secure_url;
        publicId = result.public_id;
      } catch (cloudErr) {
        console.warn("Cloudinary upload fallback to data URI:", cloudErr.message);
        fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      }
    } else {
      fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // Create WorkplaceFile record in MongoDB
    const workplaceFile = await WorkplaceFile.create({
      workplace: workplaceId,
      uploadedBy: req.user._id,
      fileName: req.file.originalname,
      fileUrl,
      publicId,
      fileType,
      fileSize: req.file.size,
      description: description || req.file.originalname,
    });

    // Add file reference to workplace
    if (!workplace.files) workplace.files = [];
    workplace.files.push(workplaceFile._id);
    await workplace.save();

    const populated = await WorkplaceFile.findById(workplaceFile._id).populate(
      "uploadedBy",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "File uploaded and stored in MongoDB successfully",
      file: populated,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Get all files in a workplace
const getWorkplaceFiles = async (req, res) => {
  try {
    const { workplaceId } = req.params;

    const files = await WorkplaceFile.find({ workplace: workplaceId })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await WorkplaceFile.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    await WorkplaceFile.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "File deleted successfully from MongoDB",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete file error" });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await WorkplaceFile.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Download file error" });
  }
};

module.exports = {
  upload,
  uploadFile,
  getWorkplaceFiles,
  deleteFile,
  downloadFile,
};
