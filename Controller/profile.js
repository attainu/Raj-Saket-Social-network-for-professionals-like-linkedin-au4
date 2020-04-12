const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {check,validationResult } = require('express-validator');

const Profile = require('../Model/Profile');
const User = require('../Model/User');

router.get('/me',auth,async(req,res) => {
    try{
       const profile = await (await Profile.findOne({ user: req.user.id })).populate('user',['name','avatar']);

       if(!profile){
           return res.status(400).json({ msg:'There is no profile for this User'})
       }

       res.json(profile);
      }  catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');   
    }
});

router.get('/user/:user_id', async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);

        if(!profile)
         return res.status(400).json({ msg: 'there is no profile for this User'});

        res.json(profile);
    } catch (err){
        console.error(err.message);
        if(err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'there is no profile for this User'})
        }

        res.status(500).send('Server Error');
    }
});
module.exports = router;