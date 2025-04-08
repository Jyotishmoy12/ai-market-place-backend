const cron = require("node-cron");
const fetchHuggingFaceModels = require("./scrapper/fetchHuggingFace");
const fetchReplicateModels = require("./scrapper/fetchReplicate");
const saveToDB = require("./services/saveModels");

function setupCron() {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("⏳ Running hourly model fetch...");
      
      // Fetch models from both sources
      const hfModels = await fetchHuggingFaceModels(20);
      const replicateModels = await fetchReplicateModels(20);
      
      // Combine all models
      const allModels = [...hfModels, ...replicateModels];
      
      // Save to database
      await saveToDB(allModels);
      
      console.log(`✅ Successfully saved ${allModels.length} models to database (HF: ${hfModels.length}, Replicate: ${replicateModels.length})`);
    } catch (error) {
      console.error("❌ Error in scheduled task:", error.message);
     
    }
  });
  
  console.log("🕒 Hourly model fetch scheduled for HuggingFace and Replicate");
}

module.exports = setupCron;