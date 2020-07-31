const express = require("express");
const vacationLogic = require("../business-logic/vacation-logic");
const router = express.Router();
const multer = require("multer");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const fs = require("fs");
const uuid = require("uuid");
const verifyLoggedIn = require("../middleware/verify-logged-in");
const verifyAdminLoggedIn = require("../middleware/verify-admin-logged-in");

let socket;
let imageNewName;

const upload = multer();

// only reg users can go in
router.get("/all", verifyLoggedIn, async (request, response) => {
  try {
    const allVacations = await vacationLogic.getAllVacations();
    response.json(allVacations);

    socketServer.sockets.emit(
      "we-got-a-change-from-server",
      await vacationLogic.getAllVacations()
    );
  } catch (error) {
    response.status(500).send(error);
  }
});

// only reg users can go in
router.post("/new-follower", verifyLoggedIn, async (request, response) => {
  try {
    const vacation = request.body;
    const newFollower = await vacationLogic.newFollower(vacation);
    socketServer.sockets.emit(
      "we-got-a-change-from-server",
      await vacationLogic.getAllVacations()
    );
    response.json(newFollower);
  } catch (error) {
    response.status(500).send(error);
  }
});

router.post("/remove-follower", verifyLoggedIn, async (request, response) => {
  try {
    const vacation = request.body;
    await vacationLogic.removedFollower(vacation);
    socketServer.sockets.emit(
      "we-got-a-change-from-server",
      await vacationLogic.getAllVacations()
    );
  } catch (error) {
    response.status(500).send(error);
  }
});

// only admin can access

router.post("/new-vacation", verifyAdminLoggedIn, async (request, response) => {
  try {
    const vacations = request.body;
    imageNewName = uuid.v4();
    vacations.imageName = imageNewName + ".jpg";
    const addedVacation = await vacationLogic.addVacation(vacations);
    socketServer.sockets.emit(
      "we-got-a-change-from-server",
      await vacationLogic.getAllVacations()
    );
    response.status(200).json(addedVacation);
  } catch (err) {
    response.status(500);
  }
});

router.delete("/remove/:id", verifyAdminLoggedIn, async (request, response) => {
  try {
    const id = +request.params.id;
    await vacationLogic.deleteVacation(id);
    socketServer.sockets.emit(
      "we-got-a-change-from-server",
      await vacationLogic.getAllVacations()
    );

    response.sendStatus(204);
  } catch (err) {
    response.status(500).send(err);
  }
});

router.patch(
  "/update-vacation",
  verifyAdminLoggedIn,
  async (request, response) => {
    try {
      const vacations = request.body;
      imageNewName = uuid.v4();
      vacations.imageName = imageNewName + ".jpg";
      const updatedVacation = await vacationLogic.updateVacation(vacations);
      socketServer.sockets.emit(
        "we-got-a-change-from-server",
        await vacationLogic.getAllVacations()
      );
      response.status(200).json(updatedVacation);
    } catch (err) {
      response.status(500).send(err);
    }
  }
);

router.patch(
  "/update-image",
  upload.single("file"),
  async (request, response) => {
    try {
      const { file } = request;
      if (file.detectedFileExtension != ".jpg")
        next(new Error("invalid format"));
      const fileName = `${imageNewName}${file.detectedFileExtension}`;

      await pipeline(
        file.stream,
        fs.createWriteStream(
          `${__dirname}/../../client/public/images/${fileName}`
        )
      );

      socketServer.sockets.emit(
        "we-got-a-change-from-server",
        await vacationLogic.getAllVacations()
      );
      response.status(200).json(updatedVacation);
    } catch (err) {
      response.status(500).send(err);
    }
  }
);

router.post("/new-image", upload.single("file"), async (request, response) => {
  try {
    const { file } = request;
    if (file.detectedFileExtension != ".jpg") next(new Error("invalid format"));
    const fileName = `${imageNewName}${file.detectedFileExtension}`;
    await pipeline(
      file.stream,
      fs.createWriteStream(
        `${__dirname}/../../client/public/images/${fileName}`
      )
    );
    socketServer.sockets.emit(
      "we-got-a-change-from-server",
      await vacationLogic.getAllVacations()
    );
    response.status(200);
  } catch (err) {
    response.status(500).send(err);
  }
});

module.exports = router;
