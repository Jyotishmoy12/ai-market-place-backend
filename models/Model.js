const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  source: String,
  type: String,
  createdAt: Date,
  tags: [String],
  links: {
    demo: String,
    docs: String,
    repo: String,
  }
});

module.exports = mongoose.model("AIModel", modelSchema);
