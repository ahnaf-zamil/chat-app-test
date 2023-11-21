const services = require("./service");

module.exports = {
  createRoutes: (app) => {
    // REST methods
    app.post("/create_session", async (req, res) => {
      const s = await services.createNewSession(req);

      return res.send({ id: s.id });
    });

    app.get("/get_session/:sessionId", async (req, res) => {
      const s = await services.getSession(req.params.sessionId);
      return res.send(s);
    });

    app.post("/get_agent_credentials", async (req, res) => {
      const a = await services.getAgent(req);
      if (!a) {
        res.status(401);
        return res.send({ error: "Invalid agent credentials" });
      }
      return res.send({ id: a.id });
    });

    app.get("/settings", async (req, res) => {
      res.send(await services.getSettings());
    });

    app.post("/settings", async (req, res) => {
      await services.setSettings(req);
      res.send({});
    });

    app.post("/get_agent_inbox", async (req, res) => {
      const inbox = await services.getAgentInbox(req.body.agentId);
      res.send(inbox);
    });

    app.get("/messages/:session_id", async (req, res) => {
      const msg = await services.getMsgForSession(req.params.session_id);
      res.send(msg);
    });
  },
};
