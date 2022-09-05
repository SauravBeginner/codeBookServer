const router = require("express").Router();
const verify = require("./verifyToken");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const user = require("../model/User");
const { json } = require("express");
const Post = require("../model/Post");

//UPDATE
router.put("/update/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      console.log(updatedUser);
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json(`You can only update your account`);
  }
});

//DELETE
router.delete("/delete/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      console.log(`User Deleted!`);
      res.status(200).json(`User Deleted!`);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json(`You can only update your account`);
  }
});

//GET
router.get("/find/:id", verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, createdAt, ...info } = user._doc;
    console.log(user);
    res.status(200).json({ ...info });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get One user
router.get("/finduser", verify, async (req, res) => {
  try {
    const cuser = await User.findById(req.user.id);
    const { password, updatedAt, createdAt, ...info } = cuser._doc;
    console.log(cuser);
    res.status(200).json({ ...info });
  } catch (err) {
    res.status(500).json(err);
  }
});

//find one  User
router.get("/findone/:id", verify, async (req, res) => {
  try {
    const cuser = await User.findById(req.params.id);
    const users = await User.findById(req.user.id);

    // console.log(cuser._id);
    // console.log(users._id);
    if (req.params.id == req.user.id) {
      const { password, updatedAt, createdAt, ...info } = cuser._doc;
      console.log(`Posted`);
      res.status(200).json({ ...info });
    } else {
      res.status(403).json({ err: `You can only Post from your account` });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//FOLLOW A USER
router.put("/follow/:id", verify, async (req, res) => {
  if (req.user.id !== req.params.id) {
    try {
      const followingUser = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.id);

      if (!followingUser.followers.includes(req.user.id)) {
        await currentUser.updateOne({
          $push: { followings: req.params.id },
        });
        await followingUser.updateOne({
          $push: { followers: req.user.id },
        });

        res.status(200).json(`User has been followed!`);
      } else {
        console.log(`You already followed this user!`);
        res.status(403).json(`You already followed this user!`);
      }
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    console.log(`You can not follow yourself!`);
    res.status(403).json(`You can not follow yourself!`);
  }
});

//UNFOLLOW A USER
router.put("/unfollow/:id", verify, async (req, res) => {
  if (req.user.id !== req.params.id) {
    try {
      const unFollowingUser = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.id);

      if (unFollowingUser.followers.includes(req.user.id)) {
        await currentUser.updateOne({
          $pull: { followings: req.params.id },
        });
        await unFollowingUser.updateOne({
          $pull: { followers: req.user.id },
        });

        res.status(200).json(`User has been unfollowed!`);
      } else {
        console.log(`You don't follow this user!`);
        res.status(403).json(`You already followed this user!`);
      }
    } catch (err) {
      res.staus(403).json(err);
    }
  } else {
    console.log(`You can not follow yourself!`);
    res.status(403).json(`You can not follow yourself!`);
  }
});

//Friends

router.get("/friends", verify, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const friends = await Promise.all(
      currentUser.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );

    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    console.log(friendList);
    res.status(200).json(friendList);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
