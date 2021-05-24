const server = require("./app/app");
const devPort = 3306;
// Start server on this port
server.listen(process.env.PORT || devPort, () => {
  console.log(`listening at ${devPort} `);
});
