const express = require("express");
const userRouter = express.Router();
const passport = require("passport");
const passportConfig = require("../passport");
const JWT = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const passwordValidator = require('password-validator');

require("dotenv").config();
const secret = process.env.SECRET_KEY || "guest";
const issuer = process.env.ISSUER || "kkolodziejski"
const schema = new passwordValidator();

schema
.is().min(8)
.has().uppercase()
.has().digits(1)
.has().symbols(1)
.has().not().spaces(); 

const signToken = (userID) => {
  return JWT.sign(
    {
      iss: issuer,
      sub: userID,
    },
    secret,
    { expiresIn: "5h" }
  );
};

userRouter.post("/register", async (req, res) => {
  const { username, email, password, adminKey } = req.body;
  if (!schema.validate(password)) {
    res.status(406).json({
      message: {
        msgBody: "Password too weak",
        msgError: true,
      },
    });
  } else {
  const foundByUsername = await User.findOne({ username: username });
  const foundByEmail = await User.findOne({ email: email });
  const secretMatch = adminKey === secret;
  const role = secretMatch ? "admin" : "user";
  if (foundByUsername && foundByEmail) {
    res.status(406).json({
      message: {
        msgBody: "Username and email are already in use",
        msgError: true,
      },
    });
  } else if (foundByUsername) {
    res.status(406).json({
      message: { msgBody: "Username already in use", msgError: true },
    });
  } else if (foundByEmail) {
    res.status(406).json({
      message: { msgBody: "Email already in use", msgError: true },
    });
  } else {
    const newUser = new User({
      username,
      email,
      password,
      role: role,
      disabled: false,
    });
    newUser.save((err) => {
      if (err)
        res.status(400).json({
          message: {
            msgBody: `${err}`,
            msgError: true,
          },
        });
      else
        res.status(201).json({
          message: { msgBody: "Account has been created", msgError: false },
        });
    });
  }}
});

userRouter.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    if (req.isAuthenticated()) {
      const { _id, username, role, disabled } = req.user;
      if (disabled === true) {
        res.status(403).json({
          message: {
            msgBody: "Your account has been disabled.",
            msgError: false,
          },
        });
      } else {
        const expireTime = new Date(new Date().getTime() + 300 * 60 * 1000);
        const tokenData = {
          isAuthenticated: true,
          username: username,
          id: _id,
          role: role,
        };
        const token = signToken(tokenData);
        res.cookie("access_token", token, {
          httpOnly: true,
          sameSite: true,
          expires: expireTime,
        });
        res.status(200).json({
          isAuthenticated: true,
          user: { username: username, role: role, id: _id },
          jwt: token,
        });
      }
    }
  }
);

userRouter.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (_req, res) => {
    res.clearCookie("access_token");
    res.status(200).json({
      message: { msgBody: "Logout successful", msgError: false },
    });
  }
);

userRouter.get("/pages", async (_req, res) => {
  try {
    const pageNumber = 1;
    const result = await User.find({});
    const foundPages = Math.ceil(result.length / 20);
    res
      .status(200)
      .json({ size: pageNumber > foundPages ? pageNumber : foundPages });
  } catch (error) {
    res.status(500).json({
      message: { msgBody: "Error while fetching pages", msgError: true },
    });
  }
});

userRouter.get("/byPage/:pageNumber", async (req, res) => {
  const pageNumber = req.params.pageNumber - 1;
  try {
    const result = await User.find({})
      .skip(pageNumber * 20)
      .limit(20);
    res.status(200).send(result);
  } catch (error) {
    res.status(404).json({
      message: { msgBody: "Error while fetching users", msgError: true },
    });
  }
});

userRouter.get("/byId/:userId", async (req, res) => {
  try {
    const id = req.params.userId;
    const result = await User.findById(id);
    res.status(200).send(result);
  } catch (error) {
    res.status(404).json({
      message: {
        msgBody: `Error while fetching user with id: ${req.params.userId}`,
        msgError: true,
      },
    });
  }
});

userRouter.put(
  "/updateEmail/:userId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const password = req.body.password;
      const email = req.body.email;
      const foundByEmail = await User.findOne({ email: req.body.email });
      if (foundByEmail) {
        res.status(406).json({
          message: {
            msgBody: `Email already in use`,
            msgError: true,
          },
        });
      } else {
        const user = await User.findById(userId);
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          try {
            await User.findOneAndUpdate({ _id: userId }, { email: email });
            res.status(200).json({
              message: { msgBody: "Email has been updated", msgError: false },
            });
          } catch (error) {
            res.status(409).json({
              message: {
                msgBody: `Error during email change: ${error}`,
                msgError: true,
              },
            });
          }
        } else {
          res.status(406).json({
            message: {
              msgBody: `Passwords are not matching`,
              msgError: true,
            },
          });
        }
      }
    } catch (error) {
      res.status(401).json({
        message: {
          msgBody: `You need to be signed in.`,
          msgError: true,
        },
      });
    }
  }
);

userRouter.put(
  "/updatePassword/:userId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userId = req.params.userId;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    if (!schema.validate(newPassword)) {
      res.status(406).json({
        message: {
          msgBody: "Password too weak",
          msgError: true,
        },
      });
    } else {
    const user = await User.findById(userId);
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (passwordMatch) {
      try {
        await User.findOneAndUpdate({ _id: userId }, { password: newPassword });
        res.status(200).json({
          message: { msgBody: "Password has been updated", msgError: false },
        });
      } catch (error) {
        res.status(409).json({
          message: {
            msgBody: `Error during password change: ${error}`,
            msgError: true,
          },
        });
      }
    } else {
      res.status(406).json({
        message: {
          msgBody: `Passwords are not matching`,
          msgError: true,
        },
      });
    }
  }}
);

userRouter.put(
  "/toggleAccount/:userId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userId = req.params.userId;
    try {
      const foundUser = await User.findById(userId);
      if (foundUser.role === "admin") {
        res.status(403).json({
          message: {
            msgBody: "Admin accounts cannot be disabled",
            msgError: false,
          },
        });
      } else {
        await User.findOneAndUpdate(
          { _id: userId },
          { disabled: !foundUser.disabled }
        );
        if (foundUser.disabled == true) {
          res.status(200).json({
            message: { msgBody: "User has been unbanned", msgError: false },
          });
        } else {
          res.status(200).json({
            message: { msgBody: "User has been banned", msgError: false },
          });
        }
      }
    } catch (error) {
      res.status(409).json({
        message: {
          msgBody: `Error while disabling user: ${error}`,
          msgError: true,
        },
      });
    }
  }
);

module.exports = userRouter;
