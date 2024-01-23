const express = require("express");
const scoreRouter = express.Router();
const Score = require("../models/Score");
const Game = require("../models/Game");
const passport = require("passport");
const JWT = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;

scoreRouter.post("/", async (req, res) => {
  let { amount, private, game, player } = req.body;
  const result = await Game.find({ name: game });
  console.log(result)
  console.log("TUTAJ")
  game = result[0]._id.toString();
  const date = new Date();
  const newScore = new Score({
    amount,
    private,
    date,
    game,
    player,
  });
  newScore.save((err) => {
    if (err) {
      res.status(400).json({
        message: {
          msgBody: `Error while creating score, error: ${err}`,
          msgError: true,
        },
      });
    }
    else {
      res
        .status(201)
        .json({ message: { msgBody: "Score created", msgError: false } });
}});
  
});

// scoreRouter.get("/", async (_req, res) => {
//   try {
//     const result = await Score.find({}).populate("game").populate("player");
//     res.status(200).send(result);
//   } catch (error) {
//     res.status(400).json({
//       message: { msgBody: "Error while fetching scores", msgError: true },
//     });
//   }
// });

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const sort = (data) => {
  const newData = [[], []];
  newData[1] = data[1];
  for (let i = 0; i <= data[0].length - 1; i++) {
    newData[0].push({});
    newData[0][i]._id = data[0][i]._id;
    newData[0][i].amount = JSON.parse(data[0][i].amount);
    newData[0][i].date = formatDate(data[0][i].date);
    newData[0][i].player = data[0][i].player;
  }
  let order = "";
  if (newData[1][0].order == "asc") {
    order = ">";
  } else if (newData[1][0].order == "desc") {
    order = "<";
  }
  return newData[0].sort(
    new Function(
      "return " +
        "function compare(result1, result2){if (result1." +
        newData[1][0].elementToCompare +
        order +
        " result2." +
        newData[1][0].elementToCompare +
        "){return 1}else{return -1} return 0;}"
    )()
  );
};

const addOrderNumber = (data) => {
  data = sort(data);
  let orderNumber = 1;
  data.forEach((item, index) => {
    orderNumber = index + 1;
    item.orderNumber = orderNumber;
    item.player = item.player.username;
  });

  return data;
};

scoreRouter.get("/scoreboard/:gameId", async (req, res) => {
  try {
    const gameId = req.params.gameId;
    await Promise.all(
      [
        Score.find(
          { game: gameId, private: false },
          { _id: 1, amount: 1, player: 1, date: 1 }
        ).populate("player", { _id: 0, username: 1 }),
        Game.find({ _id: gameId }, { _id: 0, elementToCompare: 1, order: 1 }),
      ],
      sort
    ).then((data) => {
      res.status(200).send(addOrderNumber(data));
    });
  } catch (error) {
    res.status(400).json({
      message: {
        msgBody: `Error while fetching scores with game id: ${req.params.gameId}, error: ${error}`,
      },
      msgError: true,
    });
  }
});

scoreRouter.get(
  "/myScores",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = JWT.decode(req.cookies.access_token).sub;
      const result = await Score.aggregate([
        { $match: { player: ObjectId(userId) } },
        {
          $lookup: {
            from: "games",
            localField: "game",
            foreignField: "_id",
            as: "game",
          },
        },
        { $set: { game: { $first: "$game.name" } } },
        { $project: { _id: 0, amount: 1, date: 1, game: 1 } },
      ]);
      res.status(200).send(result);
    } catch (error) {
      res.status(400).json({
        message: {
          msgBody: `Error while fetching user scores, error: ${error}`,
        },
        msgError: true,
      });
    }
  }
);

scoreRouter.get("/:gameId", async (req, res) => {
  try {
    const gameId = req.params.gameId;
    await Promise.all([
      Score.find(
        { game: gameId, private: false },
        { _id: 1, amount: 1, date: 1, player: 1 }
      ).populate("player", { _id: 0, username: 1 }),
    ]).then((data) => {
      res.status(200).send(data[0]);
    });
  } catch (error) {
    res.status(400).json({
      message: {
        msgBody: `Error while fetching scores with game id: ${req.params.gameId}, error: ${error}`,
      },
      msgError: true,
    });
  }
});

const groupDataByDay = (data) => {
  const groupedData = data.reduce((result, item) => {
    const date = new Date(item.date);
    const dayKey = date.toISOString().slice(0, 10);

    if (!result[dayKey]) {
      result[dayKey] = {
        count: 0,
        items: [],
      };
    }

    result[dayKey].count++;
    result[dayKey].items.push(item);

    return result;
  }, {});

  return groupedData;
};

scoreRouter.get("/byDay/:gameId", async (req, res) => {
  try {
    const gameId = req.params.gameId;
    await Promise.all([
      Score.find(
        { game: gameId, private: false },
        { _id: 1, amount: 1, date: 1, player: 1 }
      ).populate("player", { _id: 0, username: 1 }),
    ]).then((data) => {
      res.status(200).send(groupDataByDay(data[0]));
    });
  } catch (error) {
    res.status(400).json({
      message: {
        msgBody: `Error while fetching scores with game id: ${req.params.gameId}, error: ${error}`,
      },
      msgError: true,
    });
  }
});

module.exports = scoreRouter;
