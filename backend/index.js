const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
require("dotenv").config();
const secret = process.env.SECRET_KEY || "guest";
const adminUsername = process.env.APP_ADMIN_USERNAME || "admin";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const app = express();

const corsOptions = {
  credentials: true,
  origin: [frontendUrl],
};

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));

const dbData = {
  host: process.env.MONGO_HOST || "localhost",
  port: process.env.MONGO_PORT || 27017,
  database: process.env.MONGO_DATABASE || "projekt-zespolowy-mongo",
};

mongoose.set("strictQuery", false);

const Game = require("./models/Game");
const gameRouter = require("./routes/Game");
app.use("/games", gameRouter);
const Score = require("./models/Score");
const scoreRouter = require("./routes/Score");
app.use("/scores", scoreRouter);
const User = require("./models/User");
const userRouter = require("./routes/User");
app.use("/users", userRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("ban-message", (msg) => {
    console.log(`banned user with id: ${msg}`);
    socket.broadcast.emit("ban-check", msg);
  });
});

mongoose
  .connect(`mongodb://${dbData.host}:${dbData.port}/${dbData.database}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async (res) => {
    console.log(`Connected to database: ${res.connections[0].name}`);

    const appHost = process.env.APP_HOST || "localhost";
    const appPort = process.env.APP_PORT || 5000;
    const adminCheck = await User.findOne({ username: adminUsername });
    await (adminCheck ? console.log("Admin account found") : createAdmin());

    server.listen(appPort, () => {
      console.log(`Server available from: http://${appHost}:${appPort}`);
    });
  })
  .catch((err) => {
    console.error("Error while connecting: ", err);
  });

const createAdmin = async () => {
  console.log("Creating admin account");
  const adminPassword = process.env.APP_ADMIN_PASSWORD || "Guest123!";
  const adminEmail =
    process.env.APP_ADMIN_EMAIL || "ServiceAdminEmail@example.com";
  const admin = new User({
    username: adminUsername,
    email: adminEmail,
    password: adminPassword,
    role: "admin",
    disabled: false,
  });
  await admin.save((err) => {
    if (err) console.log(err);
    else {
      console.log("Admin created");
      createTestUsers();
    }
  });
  await gameChecks();
  setTimeout(() => runCreateData(), 10000);
};

const gameChecks = async () => {
  const geoCheck = await Game.findOne({ name: "geozgadywacz" });
  geoCheck
    ? console.log("Geozgadywacz found")
    : createGame("geozgadywacz", "desc", "amount");
  const hangmanCheck = await Game.findOne({ name: "hangman" });
  hangmanCheck
    ? console.log("Hangman found")
    : createGame("hangman", "desc", "amount");
  const mineSweeperCheck = await Game.findOne({ name: "minesweeper" });
  mineSweeperCheck
    ? console.log("MineSweeper found")
    : createGame("minesweeper", "asc", "amount");
  const tetrisCheck = await Game.findOne({ name: "tetris" });
  tetrisCheck
    ? console.log("Tetris found")
    : createGame("tetris", "desc", "amount");
  const wordleCheck = await Game.findOne({ name: "wordle" });
  wordleCheck
    ? console.log("Wordle found")
    : createGame("wordle", "desc", "amount");
  const checkersCheck = await Game.findOne({ name: "checkers" });
  checkersCheck
    ? console.log("Checkers found")
    : createGame("checkers", "desc", "amount");
};

const createGame = async (name, order, elementToCompare) => {
  console.log(`Creating game: ${name}`);
  const game = new Game({
    name: name,
    elementToCompare: elementToCompare,
    order: order,
    status: "active",
  });
  game.save((err) => {
    if (err) console.log(err);
    else console.log(`Game ${name} created`);
  });
};

const runCreateData = async () => {
  const filename = "dataCheck.txt";
  fs.open(filename, "r", function (err, fd) {
    if (err) {
      fs.writeFile(filename, "", async function (err) {
          createScores();
          createUsers();
      });
    }
  });
};

const createTestUsers = async () => {
  console.log("Creating test accounts");
  const testUsers = ["PrisonMike", "Humdinger", "PlayerTwo"];
  const userPassword = process.env.APP_ADMIN_PASSWORD || "Guest123!";
      const user0 = new User({
        username: testUsers[0],
        email: testUsers[0] + "@mail.com",
        password: userPassword,
        role: "user",
        disabled: false,
      });
      user0.save((err) => {
        if (err) console.log(err);
      });
      const user1 = new User({
        username: testUsers[1],
        email: testUsers[1] + "@mail.com",
        password: userPassword,
        role: "user",
        disabled: false,
      });
      user1.save((err) => {
        if (err) console.log(err);
      });
      const user2 = new User({
        username: testUsers[2],
        email: testUsers[2] + "@mail.com",
        password: userPassword,
        role: "user",
        disabled: false,
      });
      user2.save((err) => {
        if (err) console.log(err);
      });
    console.log("Test accounts created");
};

const createUsers = async () => {
  console.log("Creating user accounts");
  const elements = [
    "Bubble",
    "Sweet",
    "Shim",
    "Hot",
    "Dog",
    "Mike",
    "Whizz",
    "Fizz",
    "Fast",
    "Pass",
    "Rubble",
    "Chase",
    "Sky",
    "Rocky",
    "Marsh",
    "Zuma",
  ];
  for (let i = 0; i < 30; i++) {
    const username = elements[i % 16] + elements[(i * 3) % 16] + i;
    const userPassword = process.env.APP_ADMIN_PASSWORD || "Guest123!";
    const userEmail = username + "@mail.com";
    const user = new User({
      username: username,
      email: userEmail,
      password: userPassword,
      role: "user",
      disabled: false,
    });
    user.save((err) => {
      if (err) console.log(err);
    });
  }
  console.log("Users created");
};

const createScores = async () => {
  console.log("Creating scores");
  const adminTemp = await User.find({ username: adminUsername });
  const mikeTemp = await User.find({ username: "PrisonMike" });
  const mayorTemp = await User.find({ username: "Humdinger" });
  const playerTemp = await User.find({ username: "PlayerTwo" });
  const wordleTemp = await Game.find({ name: "wordle" });
  const tetrisTemp = await Game.find({ name: "tetris" });
  const hangmanTemp = await Game.find({ name: "hangman" });
  const geozgadywaczTemp = await Game.find({
    name: "geozgadywacz",
  });
  const admin = adminTemp[0]._id.toString();
  const mike = mikeTemp[0]._id.toString();
  const mayor = mayorTemp[0]._id.toString();
  const player = playerTemp[0]._id.toString();
  const wordle = wordleTemp[0]._id.toString();
  const tetris = tetrisTemp[0]._id.toString();
  const hangman = hangmanTemp[0]._id.toString();
  const geozgadywacz = geozgadywaczTemp[0]._id.toString();
  const date1 = new Date("August 17, 2023 03:00:00");
  const date2 = new Date("August 18, 2023 07:01:00");
  const date3 = new Date("August 19, 2023 09:20:00");
  const date4 = new Date("August 20, 2023 09:20:00");
  const date5 = new Date("August 21, 2023 09:20:00");
  const date6 = new Date("August 22, 2023 09:20:00");
  const userIds = [admin, mike, mayor, player];
  const gameIds = [wordle, tetris, hangman, geozgadywacz];
  const dates = [date1, date2, date3, date4, date5, date6];
  for (let i = 0; i < 67; i++) {
    const newScore = new Score({
      amount: `${((i % 8) + 1) * 100}`,
      private: false,
      date: dates[(i * 7) % 6],
      game: gameIds[(i * 3) % 4],
      player: userIds[(i * 5) % 4],
    });
    newScore.save((err) => {
      if (err) console.log(err);
    });
  }
  for (let i = 0; i < 15; i++) {
    const privateScore = new Score({
      amount: `${((i % 9) + 1) * 100}`,
      private: true,
      date: dates[(i * 4) % 3],
      game: gameIds[(i * 7) % 4],
      player: userIds[(i * 8) % 4],
    });
    privateScore.save((err) => {
      if (err) console.log(err);
    });
  }
  for (let j = 0; j < 12; j++) {
    const newScore = new Score({
      amount: `${((j % 4) + 1) * 100}`,
      private: false,
      date: dates[(j * 3) % 6],
      game: gameIds[j % 4],
      player: userIds[(j * 5) % 4],
    });
    newScore.save((err) => {
      if (err) console.log(err);
    });
  }
  console.log("Scores created");
};
