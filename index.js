const express = require("express");
const app = express();

//const connectDB = require('./config/db');
//Connect Database through Atlas
//connectDB();

app.use(express.json({ extended: false }));

//connecting mongodb locally
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb://127.0.0.1:27017/capstone-project",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (error, res) => {
    if (error) {
      throw error;
    } else {
      console.log("Server has been connected to mongodb LOCAL");
    }
  }
);

// Define Routes
app.use("/users", require("./Controller/users"));
app.use("/auth", require("./Controller/auth"));
app.use("/profile", require("./Controller/profile"));
//app.use('/posts', require('./Controller/posts'));

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server started working on ${PORT}`));
