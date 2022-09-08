const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const jwt = require("jsonwebtoken");

module.exports = {
  register: async (req, res) => {
    // do validations ...

    const validatedValues = req.body;
    console.log("req.body: ", req.body);

    // checks for unique email and username
    try {
      const user = await userModel.findOne({
        username: validatedValues.username,
      });
      if (user) {
        return res.status(409).json({ error: "user exists" });
      }
      const email = await userModel.findOne({ email: validatedValues.email });
      if (email) {
        return res
          .status(409)
          .json({ error: "email already registered, please use another" });
      }
    } catch (err) {
      return res.status(500).json({ error: "failed to get user" });
    }

    // hashing password and putting req object into user variable
    const passHash = await bcrypt.hash(req.body.password, 10);
    const user = { ...req.body, password: passHash };

    // creating user in db
    try {
      await userModel.create(user);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "failed to register user" });
    }

    return res.status(200).json("User successfully created");
  },

  login: async (req, res) => {
    // do validations ...

    const validatedValues = req.body;
    let errMsg = "username or password is incorrect";
    let user = null;

    // checking if username submitted is present in db
    try {
      user = await userModel.findOne({ username: validatedValues.username });
      if (!user) {
        return res.status(401).json({ error: errMsg });
      }
    } catch (err) {
      return res.status(500).json({ error: "failed to get user" });
    }

    // checking if password matches
    const isPasswordOk = await bcrypt.compare(req.body.password, user.password);

    if (!isPasswordOk) {
      return res.status(401).json({ error: errMsg });
    }

    // generate JWT and return as response
    const userData = {
      email: user.email,
      username: user.username,
    };
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: userData,
      },
      process.env.JWT_SECRET
    );

    return res.json({ token });
  },

  // example route for BE route authorization via JWT
  authExample: async (req, res) => {
    res.json(res.locals.userAuth);
  },
};
