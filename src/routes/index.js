const fs = require('fs');
const path = require('path');
const router = require('express').Router();

fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.routes.js'))
  .forEach(file => {
    router.use(require(path.join(__dirname, file)));
  });

module.exports = router;