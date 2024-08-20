const mongoose = require("mongoose");
const masterSchema = new mongoose.Schema({
  chapter: { type: Number, required: true },
  verse: { type: Number, required: true },
  // language: { type: String, default: "en", enum: ["en", "ar", "ru"] },
  text: {
    simple: { type: String, required: true },
    simpleClean: { type: String },
    simplePlain: { type: String },
    simpleMinimal: { type: String },
    uthmani: { type: String },
    uthmaniMinimal: { type: String },
  },
  translations: [
    {
      language: {
        type: String,
        default: "en",
        enum: ["en", "ar", "ru", "ur", "fa", "de", "id"],
      },
      author: { type: String, required: true },
      translation: { type: String, required: true },
    },
  ],
});

module.exports = master = mongoose.model("master", masterSchema);
