const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_URI);

module.exports = {
  sequelize,
  SessionModel: sequelize.define("Session", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    expiresAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }),
  MessagesModel: sequelize.define("Messages", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    creator: {
      type: DataTypes.STRING, // Tells you who sent the message. Can be: ai, agent, user
      allowNull: false,
    },
  }),
  AgentsModel: sequelize.define("Agents", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING, // Not going to hash passwords for this implementation
      allowNull: false,
    },
  }),
  AgentsSessionRelation: sequelize.define("AgentSession", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    agentId: {
      type: DataTypes.INTEGER,
    },
    sessionId: {
      type: DataTypes.STRING,
    },
  }),
};
