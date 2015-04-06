var express = require("express"),
    app = express();

app.use(express.static(__dirname + "/../web"));

app.listen(80);

console.info("Server ready on port 80.");