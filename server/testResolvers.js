const TestResolvers = require('@pdftron/collab-server/tests/resolvers');
const resolvers = require('./resolvers');

const { db } = resolvers;

const runTestResolvers = async () => {
  const errorMessages = await TestResolvers(resolvers);
  if (errorMessages.length) {
    console.log('error messages', errorMessages);
  } else {
    console.log('Pass all tests!');
  }
  db.close();
};

runTestResolvers();
