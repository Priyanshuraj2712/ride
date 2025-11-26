const mongoose = require("mongoose");
const Driver = require("../models/Driver");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected. Rebuilding indexes...");
  await Driver.syncIndexes();
  console.log("Done!");
  process.exit();
});