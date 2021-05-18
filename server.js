const server = require("./app/app");
const port = 5000;
// Start server on this port
server.listen(port, () => {
  console.log(`listening at ${port} `);
});
