const { AgentsModel, AgentsSessionRelation, sequelize } = require("./model");

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
  }

  return assignedSession;
};

module.exports = {
  assignAgentToSession,
  redirectMsgToAgent: async (content, socket) => {
    const assignedSession = await assignAgentToSession(socket);

    // Now that an agent has been assigned a session or an assigned session already exists, dispatch the message to him
    // If agent is online, he should get a popup. Else, when he loads it, it should be fetched
    socket.server_io
      .to(`agent:${assignedSession.agentId}`)
      .emit("msg", { sessionId: assignedSession.sessionId, content });
  },
};
