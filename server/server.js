const CollabServer = require('@pdftron/collab-server');
const dotenv = require('dotenv');

dotenv.config();
const port = 3000;
const resolvers = require('./resolvers');

const corsOption = {
  origin: true,
  credentials: true,
};

const permissions = {
  [CollabServer.Permissions.Entities.DOCUMENT]: {
    [CollabServer.Permissions.Actions.READ]: CollabServer.Permissions.Roles.ANY,
    [CollabServer.Permissions.Actions.ADD]: CollabServer.Permissions.Roles.ANY,
    [CollabServer.Permissions.Actions.EDIT]: CollabServer.Permissions.Roles.ANY
  },
  [CollabServer.Permissions.Entities.ANNOTATION]: {
    [CollabServer.Permissions.Actions.READ]: CollabServer.Permissions.Roles.ANY,
    [CollabServer.Permissions.Actions.ADD]: CollabServer.Permissions.Roles.ANY
  }
};

const server = new CollabServer({
  resolvers,
  corsOption,
  permissions,
  logLevel: CollabServer.LogLevels.DEBUG,
});

server.start(port);
