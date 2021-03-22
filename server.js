const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiSpec = require('./docs/api/swagger.json');

const app = express();

app.use(cors({ origin: true, credentials: true }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/api/v1/swagger', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(apiSpec);
});

app.get('/api/v1/entities/:id', (req, res) => {
  const data = {
    title: 'Hello',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
});

app.listen(9902, () => console.log('App listening on port 9902!'));
