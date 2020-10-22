const CollabServer = require('@pdftron/collab-server');
const dotenv = require('dotenv');

dotenv.config();
const port = 3000;
const resolvers = require('./resolvers');

const corsOption = {
  origin: true,
  credentials: true,
};

const server = new CollabServer({
  resolvers,
  corsOption,
  logLevel: CollabServer.LogLevels.DEBUG,
});

server.start(port);
