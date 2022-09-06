const router = require("express").Router();
const Post = require("../model/Post");
const User = require("../model/User");
const verify = require("./verifyToken");

// Create a Post
router.post("/", verify, async (req, res) => {
  try {
    const obj = {
      userId: req.user.id,
      desc: req.body.desc,
      img: req.body.img,
      likes: req.body.likes,
    };
    const savedPost = await Post.create(obj);
    res.status(200).json(savedPost);
    console.log(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a Post
router.put("/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.user.id) {
      await post.updateOne({ $set: req.body });
      res.status(200).json(`The post has been updated`);
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete a Post
router.delete("/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.user.id) {
      await post.deleteOne();
      res.status(200).json(`The post has been updated`);
    } else {
      res.status(403).json(`you can update only your post`);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Like / Dislike a Post

router.put("/:id/like", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) {
      await post.updateOne({ $push: { likes: req.user.id } });
      // res.status(200).json(`The post has been liked`);
      res.status(200).json(post.likes);
    } else {
      await post.updateOne({ $pull: { likes: req.user.id } });
      // res.status(200).json(`The post has been disliked`);
      res.status(200).json(post.likes);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a Post

router.get("/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//timeline

router.get("/timeline/all", verify, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const userPosts = await Post.find({ userId: currentUser._id });

    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );

    const timeline = userPosts.concat(...friendPosts);
    res.status(200).json(timeline);
  } catch (err) {
    res.status(500).json(err);
  }
});

//profile

router.get("/profile/:id", verify, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const userPosts = await Post.find({ userId: currentUser._id });
    console.log(userPosts);
    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
