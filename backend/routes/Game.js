const express = require("express");
const gameRouter = express.Router();
const Score = require("../models/Score");
const Game = require("../models/Game");
const passport = require("passport");
const JWT = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;
const fs = require("fs");
const { cwd } = require("process");
require("dotenv").config();
const PATH = process.env.APP_PATH || "../frontend"; // DOCKER WYMAGA /usr/src/app

async function createJSFileWithContent(
  fileName,
  fileFormat,
  content,
  folderPath
) {
  const filePath = `${folderPath}/${fileName}.${fileFormat}`;
  fs.writeFile(filePath, content, (err) => {
    if (err) throw err;
    console.log(
      `${fileName}.${fileFormat} created successfully at ${folderPath}`
    );
  });
}

async function deleteFile(path, name, format) {
  try {
    await unlinkFilePromise(`${path}/${name}.${format}`);
    console.log(`${name}.${format} deleted successfully at ${path}`);
  } catch (err) {
    console.error(`Error deleting ${name}.${format}: ${err.message}`);
  }
}

gameRouter.post("/", (req, res) => {
  Game.findOne({ name: req.body.name }, (err) => {
    if (err)
      res.status(500).json({
        message: {
          msgBody: `Game name is already in use, error: ${err}`,
          msgError: true,
        },
      });
    else {
      const gameData = req.body;
      gameData.name = gameData.name.toLowerCase();
      const newGame = new Game(gameData);
      newGame.save((err, result) => {
        if (err) {
          res.status(400).json({
            message: {
              msgBody: `Error while creating game, error: ${err}`,
              msgError: true,
            },
          });
        } else
          res.status(201).json({
            message: {
              msgBody: "Game has been created",
              msgError: false,
              id: result._id,
            },
          });
      });
    }
  });
});

gameRouter.get("/", async (_req, res) => {
  try {
    const result = await Game.find({});
    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({
      message: {
        msgBody: `Error while fetching games, error:${error}`,
        msgError: true,
      },
    });
  }
});

gameRouter.get("/byPage/:pageNumber", async (req, res) => {
  const pageNumber = req.params.pageNumber - 1;
  try {
    const result = await Game.find({})
      .skip(pageNumber * 20)
      .limit(20);
    res.status(200).send(result);
  } catch (error) {
    res.status(404).json({
      message: { msgBody: "Error while fetching games", msgError: true },
    });
  }
});

gameRouter.get(
  "/myGames",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = JWT.decode(req.cookies.access_token).sub;
      const result = await Game.aggregate([
        { $match: { author: ObjectId(userId) } },
      ]);
      res.status(200).send(result);
    } catch (err) {
      res.status(500).json({
        message: { msgBody: "Error while fetching games", msgError: true },
      });
    }
  }
);

gameRouter.get("/pages", async (_req, res) => {
  try {
    const pageNumber = 1;
    const result = await Game.find({});
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

gameRouter.get("/byUser/:userId", async (req, res) => {
  try {
    const id = req.params.userId;
    const result = await Game.find({ author: id });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({
      message: {
        msgBody: `Error while fetching game with id: ${req.params.gameId}`,
        msgError: true,
      },
    });
  }
});

gameRouter.get("/:gameId", async (req, res) => {
  try {
    const id = req.params.gameId;
    const result = await Game.findById(id);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({
      message: {
        msgBody: `Error while fetching game with id: ${req.params.gameId}`,
        msgError: true,
      },
    });
  }
});

gameRouter.put("/:gameId", async (req, res) => {
  try {
    const id = req.params.gameId;
    const body = req.body;
    const game = await Game.findById(id);
    if (body.status !== "active" && game.status === "active") {
      deleteFile(`${PATH}/src/pages/games`, game.name, "js").catch(
        (err) => {
          res.send(err);
        }
      );
      deleteFile(
        `${PATH}/src/styles/games`,
        game.name,
        "module.scss"
      ).catch((err) => {
        res.send(err);
      });
    }
    if (body.status === "active" && game.status !== "active") {
      createJSFileWithContent(
        body.name,
        "js",
        body.files.find((file) => file.fileName.includes(".js")).content,
        `${PATH}/src/pages/games`
      );
      if (body.files.find((file) => file.fileName.includes(".scss"))) {
        createJSFileWithContent(
          body.name,
          "module.scss",
          body.files.find((file) => file.fileName.includes(".scss")).content,
          `${PATH}/src/styles/games`
        );
      }
    }
    const result = await Game.findByIdAndUpdate(id, body);
    res.status(200).send(result);
  } catch (error) {
    console.error(`Error processing the request: ${error.message}`);
    res
      .status(409)
      .send(
        error.message ===
          "Cannot read properties of undefined (reading 'includes')"
          ? "wrong file types, only .js and .scss files are accepted"
          : "Something went wrong"
      );
  }
});

gameRouter.delete("/:gameId", async (req, res) => {
  try {
    const gameId = req.params.gameId;
    await Promise.all([
      Game.deleteOne({ _id: ObjectId(gameId) }),
      Score.deleteMany({ game: ObjectId(gameId) }),
    ]).then(() => {
      res.status(200).json({
        message: {
          msgBody: "Game has been deleted",
          msgError: false,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      message: {
        msgBody: `Error while deleting game with id: ${req.params.gameId}, error: ${error}`,
        msgError: true,
      },
    });
  }
});

module.exports = gameRouter;
