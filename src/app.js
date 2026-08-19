const express = require('express');
const app = express();

// stream morgan's request logs into winston instead of console
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));


app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", require("./routes"));

app.use(require("./middlewares/error.middleware"));

module.exports = app;