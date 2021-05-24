const server = require("./app/app");
const devPort = 8889;
// Start server on this port
server.listen(process.env.PORT || devPort, () => {
  console.log(`listening at ${devPort} `);
});
