const express = require("express");
const router = express.Router();
const AIModel = require("../models/Model");
const fetchHuggingFaceModels = require("../scrapper/fetchHuggingFace");
const fetchReplicateModels = require("../scrapper/fetchReplicate"); // ✅ NEW
const saveToDB = require("../services/saveModels");

router.get("/", async (req, res) => {
  const { source, type, page = 1, limit = 12 } = req.query;
  const filter = {};
  if (source) filter.source = source;
  if (type) filter.type = type;

  const models = await AIModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json(models);
});

// ✅ Update fetch-now to support multiple sources
router.get("/fetch-now", async (req, res) => {
  try {
    console.log("⏳ Manual fetch of models triggered...");

    const hfModels = await fetchHuggingFaceModels(20);
    const replicateModels = await fetchReplicateModels(20);

    const allModels = [...hfModels, ...replicateModels];

    await saveToDB(allModels);

    res.json({
      success: true,
      message: `✅ Fetched and saved ${allModels.length} models (HF: ${hfModels.length}, Replicate: ${replicateModels.length})`,
    });
  } catch (error) {
    console.error("❌ Error in manual fetch:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Optional: same logic for POST
router.post("/fetch-now", async (req, res) => {
  try {
    console.log("⏳ Manual fetch via POST triggered...");

    const hfModels = await fetchHuggingFaceModels(20);
    const replicateModels = await fetchReplicateModels(20);

    const allModels = [...hfModels, ...replicateModels];

    await saveToDB(allModels);

    res.json({
      success: true,
      message: `✅ Fetched and saved ${allModels.length} models (HF: ${hfModels.length}, Replicate: ${replicateModels.length})`,
    });
  } catch (error) {
    console.error("❌ Error in manual fetch:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
