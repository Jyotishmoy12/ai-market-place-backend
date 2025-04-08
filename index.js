const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const modelRoutes = require("./routes/models");
const setupCron = require("./cron");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    setupCron(); // Start the hourly fetch job
  })
  .catch(err => console.error("Mongo error:", err));

app.use("/api/models", modelRoutes);

app.listen(5000, () => console.log("🚀 Server on http://localhost:5000"));
