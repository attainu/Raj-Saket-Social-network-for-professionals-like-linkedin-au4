const express = require("express");
const axios = require("axios");
const config = require("config");
const request = require("request");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
// bring in normalize to give us a proper url, regardless of what user entered
const normalize = require("normalize-url");

const Profile = require("../Model/Profile");
const User = require("../Model/User");
const Post = require("../Model/Post");

// Get current users profile

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    // we are  populate only from user document if profile exists
    res.json(profile.populate("user", ["name", "avatar"])); //here we are using populate method to add field of user like-(name and avatar).
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//     Create or update user profile Routes- with the same route we can create and edit the profile of a user.

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    //building profile field

    const profileFields = {
      user: req.user.id,
      company,
      location,
      website: website === "" ? "" : normalize(website, { forceHttps: true }),
      bio,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => " " + skill.trim()),
      status,
      githubusername,
    };

    // Build social object and add to profileFields
    const socialfields = { youtube, twitter, instagram, linkedin, facebook };

    for (const [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//      Get all profiles

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]); // as we also want to fetch name and avatar which are part of user model in Profile.
    // we will use populate method to populate data from user collection(field name,avatar)
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get profile by user_ID

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile)
      return res.status(400).json({ msg: "No Profile for this User" });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      //here this line is not working in postman
      return res.status(400).json({ msg: "No Profile for this User" });
    }
    res.status(500).send("Server Error");
  }
});

//     Delete profile, user ROUTES

router.delete("/", auth, async (req, res) => {
  try {
    // remove users posts
    await Post.deleteMany({ user: req.user.id });

    await Profile.findOneAndRemove({ user: req.user.id }); // Remove profile

    await User.findOneAndRemove({ _id: req.user.id }); // Remove user

    res.json({ msg: "User Deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//   ROUTE for  Adding  experience-in PROFILE

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required and needs to be from the past")
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      title,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = { title, company, location, from, to, current, description };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//      Delete experience from profile using experience_id

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });

    foundProfile.experience = foundProfile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

//    Add profile education in Profile

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required and needs to be from the past")
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//     Delete education from profile using education_id

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });
    foundProfile.education = foundProfile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );
    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

//    Get user repos from Github

// router.get("/github/:username", async (req, res) => {
//   try {
//     const uri = encodeURI(
//       `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
//     );
//     const headers = {
//       "user-agent": "node.js",
//       Authorization: `token ${config.get("githubToken")}`,
//     };

//     const gitHubResponse = await axios.get(uri, { headers });
//     return res.json(gitHubResponse.data);
//   } catch (err) {
//     console.error(err.message);
//     return res.status(404).json({ msg: "No Github profile found" });
//   }
// });

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        res.status(404).json({ msg: "No Github Profile found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
