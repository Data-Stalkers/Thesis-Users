const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database/index.js');
const app = express();

const port = 3000;

// ==== MIDDLEWARE ====

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// ==== ROUTES ====

//Request for a particular user
app.get('/user', (req, res) => {
  let query = req.query.query || '';
  if (typeof req.query.query !== 'object' && req.query.query !== undefined) {
    query = JSON.parse(req.query.query);
  }
  if (query.query) {
    if (query.query.length === 1) {
      //lookup by location
      console.log('Got a location lookup for Zone', query.query);
      db.queryByLocation({
        location: query.query,
        genderFilter: query.gender,
        userFilter: query.filter
      }).then((data) => {
        res.contentType('application/json');
        res.status(200).send(data);
      }).catch((err) => {
        res.status(500).send('An error occured', err);
      });
    } else {
      //lookup by ID
      console.log('Got an ID lookup or ID', query.query);
      db.queryById(query.query).then((data) => {
        res.contentType('application/json');
        res.status(200).send(data);
      }).catch((err) => {
        res.status(500).send('An error occured', err);
      });
    }
  } else {
    //No query. Look up random
    console.log('Random lookup requested');
    db.getRandomUserByNumID().then((data) => {
      res.contentType('application/json');
      res.status(200).send(data);
    }).catch((err) => {
      res.status(500).send('An error occured', err);
    });

  }
});

//Posting a new user. Not to be implemented for MVP
app.post('/user', (req, res) => {
  res.status(200).send('Membership by manual admin input only');
});

//Request for a list of users
app.get('/userlist', (req, res) => {
  res.contentType('application/json');
});

// ==== SERVER ====
app.listen(port, function() {
  console.log(`listening on port ${port}`);
});
