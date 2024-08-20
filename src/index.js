// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const db = require("./db/db");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// // const fetch = require('node-fetch');
// // express middle ware
// const app = express();


// //setting up the port for server dynamically
// app.use(bodyParser.urlencoded({ extended: true }));
// //setting up the statc assets directory like images stylesheets scripts etc
// const pubDirPath = path.join(__dirname, "/public");
// app.use(express.static(pubDirPath));
// app.use(express.json());
// app.use(cors());
// ///setting up the view engine for advanced templating
// //app.set('view engine','hbs')
// // view engine setup
// app.set("views", path.join(__dirname, "/views"));
// app.engine("html", require("ejs").renderFile);
// app.set("view engine", "html");
// // PORT setup
// const PORT = process.env.PORT || 3000;

// // main
// app.get("/", (req, res) => {
//   res.render("index");
// });

// //import Routes and Files here
// const errorController = require("./middleware/error.controller");
// const quraanRoutes = require("./modules/quraan/quraan.routes");
// const userRoutes = require("./modules/user/user.routes");
// const chapterRoutes = require("./modules/chapter/chapter.routes");

// //use the import
// app.use(quraanRoutes);
// app.use(userRoutes);
// app.use(chapterRoutes);
// app.use(errorController);

// app.use(express.json());

// // Server Startup
// app.listen(PORT, (err) => {
//   if (err) {
//     console.log(err);
//     return;
//   }

//   console.log(`Server Running on PORT ${PORT}`);
// });

const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("./db/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Express app
const app = express();

// Initialize Gemini AI model
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Setting up the static assets directory like images, stylesheets, scripts, etc.
const pubDirPath = path.join(__dirname, "/public");
app.use(express.static(pubDirPath));

// View engine setup
app.set("views", path.join(__dirname, "/views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// PORT setup
const PORT = process.env.PORT || 3000;

// Import Routes and Files here
const errorController = require("./middleware/error.controller");
const quraanRoutes = require("./modules/quraan/quraan.routes");
const userRoutes = require("./modules/user/user.routes");
const chapterRoutes = require("./modules/chapter/chapter.routes");

// Use the imports
app.use(quraanRoutes);
app.use(userRoutes);
app.use(chapterRoutes);
app.use(errorController);

// Summarization Endpoint
app.post("/summarize", async (req, res) => {
  const surahName = req.body.surahName;
  const text = req.body.text;
  const language = req.body.language;

  const lang = {en: "English", ur: "Urdu", fr: "Persian", hi: "Hindi"};
  const Language = lang[language];

  console.log("Surah Name:", surahName);
  console.log("Language:", Language);
  console.log("Text:", text);

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    // Prepare prompt for summarization
    const prompt = `Please provide a concise summary of the following text, focusing on the main theme and key details. Ensure the summary is plain text with no special formatting. Begin the summary by mentioning the name of the Surah, ${surahName}, the text is related to.\n\nText: ${text} Please summarize the text in ${Language} language.`;

    // Directly summarize the provided text
    const result = await model.generateContent(prompt);
    const response =  result.response;
    const summary =  response.text();

    console.log("Summary:", summary);
    return res.json({ summary });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server Running on PORT ${PORT}`);
});
