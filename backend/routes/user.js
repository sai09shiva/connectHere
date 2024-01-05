const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
const requireLogin = require("../middlewares/requireLogin");
//ti get users with given name
router.post("/users",requireLogin,async(req,res)=>{
  const searchTerm = req.body.sub;
  console.log(searchTerm);
  const regex = new RegExp(searchTerm, 'i');
  try{
    const users= await USER.find({ name: regex },{ _id: 1, name: 1, Photo: 1 });
    console.log(users);
    return res.status(200).json(users);
  } catch(err){
    return res.status(500).json({ error: "Internal server error" });
  }
})
// to get user profile
router.get("/user/:id", async(req, res) => {
    // USER.findOne({ _id: req.params.id })
    //   .select("-password")
    //   .then(user => {
    //     if (!user) {
    //       return res.status(404).json({ error: "User not found" });
    //     }
  
    //     POST.find({ postedBy: req.params.id })
    //       .populate("postedBy", "_id")
    //       .exec()
    //       .then(posts => {
    //         res.status(200).json({ user, posts });
    //       })
    //       .catch(err => {
    //         return res.status(422).json({ error: err });
    //       });
    //   })
    //   .catch(err => {
    //     return res.status(500).json({ error: "Internal server error" });
    //   });
      try {
        const user = await USER.findOne({ _id: req.params.id }).select("-password");
    
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
    
        const posts = await POST.find({ postedBy: req.params.id })
          .populate("postedBy", "_id")
          .exec();
    
        res.status(200).json({ user, posts });
      } catch (err) {
        if (err.name === 'CastError') {
          return res.status(400).json({ error: "Invalid user ID format" });
        }
        return res.status(500).json({ error: "Internal server error" });
      }
  });
  
// to follow user
router.put("/follow", requireLogin, async(req, res) => {
    try {
        // Update the user being followed
        const followedUser = await USER.findByIdAndUpdate(
          req.body.followId,
          {
            $push: { followers: req.user._id }
          },
          { new: true }
        );
    
        // Update the follower
        const followingUser = await USER.findByIdAndUpdate(
          req.user._id,
          {
            $push: { following: req.body.followId }
          },
          { new: true }
        );
    
        res.json({ followedUser, followingUser });
      } catch (err) {
        res.status(422).json({ error: err.message });
      }
})

// to unfollow user
router.put("/unfollow", requireLogin, async(req, res) => {
    try {
        // Update the user being unfollowed
        const unfollowedUser = await USER.findByIdAndUpdate(
          req.body.unfollowId,
          {
            $pull: { followers: req.user._id }
          },
          { new: true }
        );
    
        // Update the follower
        const unfollowingUser = await USER.findByIdAndUpdate(
          req.user._id,
          {
            $pull: { following: req.body.unfollowId }
          },
          { new: true }
        );
    
        res.json({ unfollowedUser, unfollowingUser });
      } catch (err) {
        res.status(422).json({ error: err.message });
      }
})

// to upload profile pic
router.put("/uploadProfilePic", requireLogin,async(req, res) => {
    try{
        const result= await USER.findByIdAndUpdate(req.user._id, {$set: { Photo: req.body.pic }}, {new: true}).exec();
        res.json(result);
    }catch(err){
        return res.status(422).json({ error: err})
    }

})

module.exports = router;
