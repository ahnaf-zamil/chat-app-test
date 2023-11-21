const { AgentsSessionRelation, sequelize, SessionModel } = require("./model");

const assignAgentToSession = async (socket) => {
  // Check if an agent has been assigned to this session or not
  let assignedSession = await AgentsSessionRelation.findOne({
    where: { sessionId: socket.sessionId },
  });
  if (assignedSession) {
    // If an agent has this session assigned to him, then no need to do anything
    return assignedSession;
  } else {
    // Else, assign this session to an agent who has lowest burden (i.e no sessions assigned to him)
    const [res, _] = await sequelize.query(
      `select ag.id from public."Agents" as ag where ag.id not in (SELECT a_s."agentId" FROM public."AgentSessions" AS a_s GROUP BY  a_s."agentId" ORDER BY COUNT(*) ASC)`,
      { raw: true }
    );
    console.log(res);
    if (res[0]) {
      // If an agent with no assigned sessions is found, assign this session to him
      assignedSession = await AgentsSessionRelation.build({
        sessionId: socket.sessionId,
        agentId: res[0].id,
      }).save();
    } else {
      // If not, find the agent with the lowest amount of sessions assigned
      const [results, _] = await sequelize.query(
        `SELECT a_s."agentId" FROM public."AgentSessions" AS a_s GROUP BY  a_s."agentId" ORDER BY COUNT(*) ASC;`,
        { raw: true }
      );
      const designatedAgentId = results[0].agentId;
      assignedSession = await AgentsSessionRelation.build({
        sessionId: socket.sessionId,
        agentId: designatedAgentId,
      }).save();
    }

    // Now dispatch the session creation data to the agent
    const sessionData = await SessionModel.findOne({
      where: { id: socket.sessionId },
    });
    socket
      .to(`agent:${assignedSession.agentId}`)
      .emit("session_created", sessionData);
  }

  return assignedSession;
};

module.exports = {
  assignAgentToSession,
  redirectMsgToAgent: async (content, socket, sender = "user") => {
    const assignedSession = await assignAgentToSession(socket);

    // Now that an agent has been assigned a session or an assigned session already exists, dispatch the message to him
    // If agent is online, he should get a popup. Else, when he loads it, it should be fetched
    socket.to(`agent:${assignedSession.agentId}`).emit("user_msg", {
      sessionId: assignedSession.sessionId,
      content,
      creator: sender,
    });

    return assignedSession.agentId;
  },
};
