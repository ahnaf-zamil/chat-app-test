const { OpenAI } = require("openai");
const { v4: uuidv4 } = require("uuid");
const { SessionModel, MessagesModel } = require("./model");
const { getConfig } = require("./util");
const { redirectMsgToAgent } = require("./agent");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const sessionTimeoutMiliseconds = 1000 * 60 * 5; // 5 mins

const sendAIMessage = async (content, socket) => {
  const gptResp = await openai.chat.completions.create({
    messages: [{ role: "user", content }],
    model: "gpt-3.5-turbo",
  });
  const resp = gptResp.choices[0].message.content;

  // Store AI response in DB for later retrieval
  const newReplyMsg = MessagesModel.build({
    content: resp,
    sessionId: socket.sessionId,
    createdAt: new Date().getTime(),
    creator: "ai", // AI
  });
  await newReplyMsg.save();

  socket.to(`session:${socket.sessionId}`).emit("agent_reply", resp);
};

const timeoutSession = async (socket) => {
  const existingSession = await SessionModel.findOne({
    where: { id: socket.sessionId },
  });
  const expiry = parseInt(existingSession.expiresAt);
  if (new Date().getTime() >= expiry) {
    // Session has expired
    await existingSession.destroy();
    socket.to(`session:${socket.sessionId}`).emit("session_timeout");
  }
};

module.exports = {
  handleNewMessage: async (content, socket) => {
    const sessionId = socket.sessionId;

    // Check to see if session is alive or not
    const existingSession = await SessionModel.findOne({
      where: { id: sessionId },
    });
    if (!existingSession) {
      // Invalid session
      console.log(`Invalid session ${sessionId}`);
      return;
    }

    await existingSession.update({
      expiresAt: new Date().getTime() + sessionTimeoutMiliseconds,
    }); // Reset session expiry

    // Create msg and save in DB
    const newMsg = MessagesModel.build({
      content,
      sessionId: sessionId,
      createdAt: new Date().getTime(),
      creator: "user", // User
    });
    await newMsg.save();

    // Send either AI message or let agent handle it
    const conf = getConfig();
    if (conf.redirect_to_live_agent) {
      // Redirect to live agent
      await redirectMsgToAgent(content, socket);
    } else {
      await sendAIMessage(content, socket);
    }

    // After sending msg, wait for session timeout
    setTimeout(() => timeoutSession(socket), sessionTimeoutMiliseconds);
  },
  createNewSession: async (req) => {
    const newSession = SessionModel.build({
      name: req.body.username,
      email: req.body.email,
      id: uuidv4(),
      expiresAt: new Date().getTime() + sessionTimeoutMiliseconds, // 5 minutes from creation
    });
    await newSession.save();
    return newSession;
  },
};
