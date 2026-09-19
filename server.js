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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});