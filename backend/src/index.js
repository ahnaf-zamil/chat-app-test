require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const { sequelize } = require("./model");
const services = require("./service");

app.use(express.json());

// Socket methods
io.on("connection", (socket) => {
  // Adding client socket to room
  const sessionId = socket.handshake.query["sessionId"];
  socket.sessionId = sessionId;
  socket.server_io = io;
  socket.join(`session:${sessionId}`);

  socket.on("msg", (content) => {
    // Handle message send
    services.handleNewMessage(content, socket);
  });
});

// REST methods
app.post("/create_session", async (req, res) => {
  const s = await services.createNewSession(req);
  return res.send({ id: s.id });
});

app.post("/get_agent_credentials", async (req, res) => {
  const a = await services.getAgent(req);
  if (!a) {
    res.status(401);
    return res.send({ error: "Invalid agent credentials" });
  }
  return res.send({ id: a.id });
});

server.listen(5000, async () => {
  console.log("Listening on port 5000");
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
