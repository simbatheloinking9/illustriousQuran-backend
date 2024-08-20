const mongoose = require("mongoose");
mongoose
  .connect('mongodb+srv://hassanqari9:Ag2Gb90Xm8uP7nzZ@cluster0.rvpznxs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(process.env.MONGO_URI);
    console.log("Connected to MongoDB server");
  })
  .catch((err) => {
    console.log(err);
  });

// process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scripture'