const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Post = require('../Model/Post');
const User = require('../Model/User');
const Profile = require('../Model/Profile');




// Create a post
   

router.post('/',[auth,
    [
      check('text', 'Text is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');  //as i don't want to send  password back so using (-password)

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Route to GET all the posts

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });   // as we want to get the most recent post that is why using .sort({date: -1}), if we want to get oldest post first we can use ({date:1})
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});




//  Route  To  get post  posted by a specific user using his/her user_id 

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check for ObjectId format and post
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {
      return res.status(404).json({ msg: 'Post not found' });       //this line is not working in Postman 
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});






// Route To DELETE  posts posted by user using his/her user_id.


router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {             // Check for ObjectId format and post
      return res.status(404).json({ msg: 'Post not found' });
    }

 
    if (post.user.toString() !== req.user.id) {                         //here, Checking  user is original writer of a POsts
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post Deleted' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});



//   Route to like a post by a user using his/her User_id

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);             //fetching posts from a user using his/her user_id
 

    // now,Checking if the post has already been liked 
    if (post.likes.some(like => like.user.toString() === req.user.id))    // comparing current user to  the user that is loggedin      
    {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });    //if the user has not already liked a post then we want to take that post-likes and add onto it.
                                                   // I'm going to do unshift which just puts it on the beginning and then
    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});





//   Route to like a post by a user using his/her User_id

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (!post.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // remove the like
    post.likes = post.likes.filter(
      ({ user }) => user.toString() !== req.user.id);

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});





//adding cooment on a POST 

router.post('/comment/:id',
  [
    auth,
    [
      check('text', 'Text is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {text: req.body.text,name: user.name,avatar: user.avatar,user: req.user.id};

      post.comments.unshift(newComment);    //using unshift to added to the beginning

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);






//to  DELETE comments using post_id and comment_id  --->
//we need to find post by _id and then we need to know which comment to delete.



router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); 

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Making sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // Checking user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = post.comments.filter( ({ id }) => id !== req.params.comment_id);

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;