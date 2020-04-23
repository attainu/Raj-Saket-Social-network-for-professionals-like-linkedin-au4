const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//const config = require('config');
const { check, validationResult } = require("express-validator"); //using express-validator package for validation purpose

const User = require("../Model/User");

router.get("/", (req, res) => res.send("user route"));

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],

  async (req, res) => {
    console.log("details coming from users client->", req.body);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // if any of the above condition(name,email,passowrd) do not match,it is gonna give error 400 msg.
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exist" }] });
      }

      const avatar = gravatar.url(email, {
        s: "250",
        r: "pg",
        d: "mm",
      });

      user = new User({ name, email, avatar, password }); //create the user

      const salt = await bcrypt.genSalt(10); //hashing the password

      user.password = await bcrypt.hash(password, salt); //hash the password

      await user.save(); //saving the user in database

      const payload = {
        //getting the paylaod which includes user _id
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        //sign the token
        payload, //we can register user and get json webtoken back that has user _id payload
        "mysecrettoekn", //passing the secret
        { expiresIn: 360000 },
        (error, token) => {
          //here in callback we will get either error or TOKEN. Afetr we get token we will send it back to the client.
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error ->" + " " + err.message);
    }
  }
);

module.exports = router;
