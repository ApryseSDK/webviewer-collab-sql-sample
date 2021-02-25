const TestResolvers = require('@pdftron/collab-server/tests/resolvers')
const myResolvers = require('./server/resolvers');
(async () => {
  const errors = await TestResolvers(myResolvers);
  console.log(errors.filter(error => error.error.type !== 'resolver_missing'));
})()