require("dotenv").config();
const { server, io, app } = require("./socket");

const { sequelize } = require("./model");
const routes = require("./routes");
const services = require("./service");

const PORT = process.env.PORT || 5000;

// Socket methods
io.on("connection", (socket) => {
  // Adding client socket to room
  const sessionId = socket.handshake.query["sessionId"];
  if (sessionId) {
    socket.on("user_msg", (content) => {
      // Handle user message send
      services.handleNewUserMessage(content, socket);
    });

    socket.sessionId = sessionId;
    socket.join(`session:${sessionId}`);
  } else {
    // If connecting socket is an agent, add it to agent room so it can receive user messages
    const agentId = socket.handshake.query["agentId"];

    console.log("Agent", agentId, "connected");
    socket.join(`agent:${agentId}`);
    socket.on("agent_msg", (data) => {
      services.handleNewAgentMessage(socket, data.sessionId, data.content);
    });
  }
  socket.server_io = io;
});

routes.createRoutes(app);

server.listen(PORT, async () => {
  console.log("Listening on port", PORT);
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
