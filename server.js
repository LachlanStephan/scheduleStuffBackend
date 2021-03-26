const app = require("./app/app");
const port = 5000;
// Start server on this port
app.listen(port, () => {
  console.log(`listening at ${port} `);
});
