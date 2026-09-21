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
    const { publicId } = req.body;

    console.log("Delete request:", publicId);

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: "publicId missing",
      });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
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

    const url = cloudinary.url(publicId, {
      resource_type: resourceType || "raw",
      type: "upload",
      sign_url: true,
      secure: true,
      flags: `attachment:${safeFileName}`,
    });

    console.log("Generated download URL:", url);

    return res.status(200).json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("Signed URL error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
app.get("/download-file", async (req, res) => {
  try {
    const { publicId, resourceType, fileName } = req.query;

    console.log("Download request:", {
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

    const url = cloudinary.url(publicId, {
      resource_type: resourceType || "raw",
      type: "upload",
      secure: true,
    });

    console.log("Fetching Cloudinary file:", url);

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "File download failed from Cloudinary",
      });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"`
    );

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    const contentLength = response.headers.get("content-length");

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    const arrayBuffer = await response.arrayBuffer();

    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("File download error:", error);

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