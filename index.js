const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");

const bodyParser = require("body-parser");
const cors = require("cors");
const expreessFileUpload = require("express-fileupload");

const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useUnifiedTopology: true,
  })
  .then(console.log(`Database connected!`))
  .catch((err) => {
    console.log(err);
  });

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(helmet());
app.use(morgan("common"));

app.use(cors());
app.use(expreessFileUpload());

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
