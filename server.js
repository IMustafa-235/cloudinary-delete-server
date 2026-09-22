const express = require("express");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cloudinary delete server is running",
  });
});

app.post("/delete-image", async (req, res) => {
  try {
    const { publicId, resourceType } = req.body;

    console.log("Delete request:", publicId);

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: "publicId missing",
      });
    }
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: "upload",
      invalidate: true,
    });

    console.log("Cloudinary result:", result);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
app.get("/signed-download-url", (req, res) => {
  try {
    const { publicId, resourceType, fileName } = req.query;

    console.log("Signed URL request:", {
      publicId,
      resourceType,
      fileName,
    });

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: "publicId missing",
      });
    }

    const safeFileName = fileName
      ? fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
      : "file";

    const format = safeFileName.includes(".")
      ? safeFileName.split(".").pop()
      : undefined;

    const url = cloudinary.utils.private_download_url(
      publicId,
      format,
      {
        resource_type: resourceType || "raw",
        type: "upload",
      }
    );

    console.log("Generated download URL:", url);

    return res.status(200).json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("Signed download URL error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});