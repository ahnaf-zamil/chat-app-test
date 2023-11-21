const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

module.exports = {
  app,
  server,
  io,
};
