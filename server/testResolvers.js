const TestResolvers = require('@pdftron/collab-server/tests/resolvers');
const resolvers = require('./resolvers');

const runTestResolvers = async () => {
  const errorMessages = await TestResolvers(resolvers);
  console.log('error messages', errorMessages);
};

runTestResolvers();
