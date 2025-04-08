const AIModel = require("../models/Model");

async function saveToDB(models) {
  for (const model of models) {
    try {
      const existing = await AIModel.findOne({ name: model.name });
      if (!existing) {
        await AIModel.create(model);
        console.log("Saved:", model.name);
      }
    } catch (err) {
      console.error("Error saving:", model.name, err.message);
    }
  }
}

module.exports = saveToDB;
