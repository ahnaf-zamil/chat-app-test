const { AgentsModel, AgentsSessionRelation, sequelize } = require("./model");

module.exports = {
  redirectMsgToAgent: async (content, socket) => {
    // Check if an agent has been assigned to this session or not
    let assignedSession = await AgentsSessionRelation.findOne({
      where: { sessionId: socket.sessionId },
    });
    if (assignedSession) {
      // If an agent has this session assigned to him, then no need to do anything
      return;
    } else {
      // Else, assign this session to an agent who has lowest burden (i.e already assigned session count)
      const [results, _] = await sequelize.query(
        `SELECT a_s."agentId" FROM public."AgentSessions" AS a_s GROUP BY  a_s."agentId" ORDER BY COUNT(*) ASC;`,
        { raw: true }
      );
      if (results[0]) {
        // If an agent from lowest session count has been found
        const designatedAgentId = results[0].agentId;
        assignedSession = await AgentsSessionRelation.build({
          sessionId: socket.sessionId,
          agentId: designatedAgentId,
        }).save();
      } else {
        // If no records are returned, then an AgentSession record doesn't exist and we need to select a random agent
        const randomAgent = await AgentsModel.findOne({
          order: sequelize.random(),
        });
        assignedSession = await AgentsSessionRelation.build({
          sessionId: socket.sessionId,
          agentId: randomAgent.id,
        }).save();
      }
    }

    // Now that an agent has been assigned a session or an assigned session already exists, dispatch the message to him
    // If agent is online, he should get a popup. Else, when he loads it, it should be fetched
    socket.server_io
      .to(`agent:${assignedSession.agentId}`)
      .emit("msg", { sessionId: assignedSession.sessionId, content });
  },
};
