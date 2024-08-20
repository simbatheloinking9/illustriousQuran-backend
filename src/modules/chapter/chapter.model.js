const mongoose = require("mongoose");
const chapterSchema = new mongoose.Schema({
  chapter: {
    type: String,
    required: true,
  },
  totalVerses: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  nameTranslation: {
    type: String,
  },
  arabicName: {
    type: String,
    required: true,
  },
  revelationPlace: {
    type: String,
    enum: ["madinah", "makkah"],
  },
  revelationOrder: {
    type: Number,
  },
  summary: {
    source: { type: String },
    text: { type: String },
  },
});

module.exports = mongoose.model("Chapter", chapterSchema);
