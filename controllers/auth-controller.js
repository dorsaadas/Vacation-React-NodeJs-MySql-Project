const express = require("express");
const authLogic = require("../business-logic/auth-logic");
const User = require("../models/user");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/register", async (request, response) => {
  try {
    const userNames = await authLogic.getAllUsers();
    const user = new User(
      0, // userId
      request.body.firstName,
      request.body.lastName,
      request.body.username,
      request.body.password,
      0
    ); // isAdmin

    // if username already exist - return some error (400) to the client...
    if (!request.body.firstName) {
      return;
    }
    if (!request.body.lastName) {
      return;
    }
    if (!request.body.username) {
      return;
    }
    for (const user of userNames) {
      if (request.body.username === user.username) {
        response.status(400).send("User Name Already Exist");
        return;
      }
    }

    if (!request.body.password) {
      return;
    }

    const addedUser = await authLogic.register(user);

    const token = jwt.sign({ addedUser }, config.jwt.secretKey, {
      expiresIn: "3h",
    });

    response.status(201).json({ addedUser, token });
  } catch (err) {
    response.status(500).send(err);
  }
});

router.post("/login", async (request, response) => {
  try {
    const credentials = request.body;
    const user = await authLogic.login(credentials);
    if (!user) {
      response.status(401).send("Illegal username or password");
      return;
    }
    const token = jwt.sign({ user }, config.jwt.secretKey, { expiresIn: "3h" });

    response.json({ user, token });
  } catch (err) {
    response.status(500).send(err);
  }
});

router.post("/logout", (request, response) => {
  try {
    response.end();
  } catch (err) {
    response.status(500).send(err.message);
  }
});

module.exports = router;
