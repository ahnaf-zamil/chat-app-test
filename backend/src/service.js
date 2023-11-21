const { OpenAI } = require("openai");
const { v4: uuidv4 } = require("uuid");
const {
  SessionModel,
  MessagesModel,
  AgentsModel,
  AgentsSessionRelation,
  sequelize,
} = require("./model");
const { getConfig, writeConfig } = require("./util");
const { redirectMsgToAgent } = require("./agent");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const sessionTimeoutMiliseconds = 1000 * 60 * 30; // 5 mins

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
  // Doing this so agent can also see AI message
  await redirectMsgToAgent(resp, socket, "ai");
};

const timeoutSession = async (sessionId) => {
  const existingSession = await SessionModel.findOne({
    where: { id: sessionId },
  });
  const expiry = parseInt(existingSession.expiresAt);
  if (new Date().getTime() >= expiry) {
    // Session has expired, destroy agent session and session objects from DB
    await AgentsSessionRelation.destroy({
      where: { sessionId: existingSession.id },
    });
    await existingSession.destroy();
    return true;
  }
};

module.exports = {
  // Session and message functions
  handleNewUserMessage: async (content, socket) => {
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

    // Let AI reply to the message if live agent is disabled
    const conf = getConfig();
    // Even if live agent is disabled, still forward the message to an agent so they can respond later
    // AI will only respond if the sendAIMessage function is run, but msg will be sent to agent regardless
    await redirectMsgToAgent(content, socket);
    if (!conf.redirect_to_live_agent) {
      await sendAIMessage(content, socket);
    }

    setTimeout(
      () =>
        timeoutSession(socket.sessionId).then((success) => {
          if (success) {
            socket.to(`session:${socket.sessionId}`).emit("session_timeout");
          }
        }),
      sessionTimeoutMiliseconds
    );
  },
  handleNewAgentMessage: async (socket, sessionId, content) => {
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
      creator: "agent", // User
    });
    await newMsg.save();

    socket.to(`session:${sessionId}`).emit("agent_reply", content);
    setTimeout(
      () =>
        timeoutSession(sessionId).then((success) => {
          if (success) {
            socket.to(`session:${sessionId}`).emit("session_timeout");
          }
        }),
      sessionTimeoutMiliseconds
    );
  },
  createNewSession: async (req) => {
    const newSession = SessionModel.build({
      name: req.body.username,
      email: req.body.email,
      id: uuidv4(),
      expiresAt: new Date().getTime() + sessionTimeoutMiliseconds, // 5 minutes from creation
    });
    await newSession.save();

    // Time out session if user doesnt send msg, just to save resources
    setTimeout(() => timeoutSession(newSession.id), sessionTimeoutMiliseconds);
    return newSession;
  },

  // Settings functions
  getSettings: async () => {
    const conf = getConfig();
    return conf;
  },
  setSettings: async (req) => {
    writeConfig({ redirect_to_live_agent: req.body.redirect_to_live_agent });
  },

  // Agent functions
  getAgentInbox: async (agentId) => {
    const [res, _] = await sequelize.query(
      `select * from public."Sessions" as s where s.id in (select a_s."sessionId" from public."AgentSessions" as a_s where a_s."agentId" = ?) ORDER BY s."createdAt" DESC;`,
      { raw: true, replacements: [agentId] }
    );
    return res;
  },
  getAgent: async (req) => {
    const agent = await AgentsModel.findOne({
      where: { username: req.body.username, password: req.body.password },
    });
    return agent;
  },

  // Message functions
  getMsgForSession: async (session_id) => {
    const msg = await MessagesModel.findAll({
      where: { sessionId: session_id },
      order: [["createdAt", "DESC"]],
    });
    return msg;
  },
};
