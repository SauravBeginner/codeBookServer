const express = require("express");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const obj = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    };
    const registeredUser = await User.create(obj);
    console.log(registeredUser);
    res.status(200).json(registeredUser);
  } catch (err) {
    console.log(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log(`User Not Found!`);
      res.status(401).json({ err: `User Not Found!` });
    } else {
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        console.log(`Invalid Password!`);
        res.status(401).json({ err: `Invalid Password!` });
      } else {
        const accessToken = jwt.sign(
          {
            id: user._id,
            isAdmin: user.isAdmin,
          },
          process.env.SECRET_KEY,
          {
            expiresIn: "5d",
          }
        );
        const { password, ...info } = user._doc;

        console.log({ ...info, accessToken });
        res.status(200).json({ ...info, accessToken });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
