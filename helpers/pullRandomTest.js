const elasticsearch = require('elasticsearch');
// const faker = require('faker');
const configs = require('../config/config.js');
const logger = require('../database/queryLogger.js');

const client = new elasticsearch.Client({
  host: configs.elasticUri
});

/**
* @module
*/

/**
 * To be used with the assembling the query
 * @constant
*/
const INDEX_NAME = 'userslist';

/**
 * To be used with the assembling the query
 * @constant
*/
const USER_TYPE = 'User';

/**
 * The size of the user array to be returned with batch query requests
 * @constant
*/
const QUERY_SIZE = 50;

/**
 * Pulls a random user from the database
 * @function
 * @instance
 * @returns {Object} A user object
 */
let getRandomUserByNumID = () => {
  return new Promise((resolve, reject) => {
    getCount().then((count) => {
      let ranNum = Math.floor(Math.random() * count);
      return queryByNumericalId(ranNum);
    }).then((data) => {
      console.dir(data);
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * Query DB by generated numerical ID
 * @function
 * @param {number} numericalID A generated numerical ID for the user
 * @returns {Object} A User object
 */
let queryByNumericalId = (numericalID) => {
  console.log('searching numID', numericalID);
  return new Promise((resolve, reject) => {
    client.search({
      index: INDEX_NAME,
      q: 'numericalID:' + numericalID
    }, function(err, res) {
      if (err) {
        reject(err);
      } else {
        sendLog(res.took, -3, res.hits.total, res.timed_out);
        resolve(appendId(res.hits.hits[0]));
      }
    });
  });
};

/**
 * Helper function to send log to ES
 */
let sendLog = (took, queryScore, hits, timedOut) => {
  logger.logQueryTime({
    took: took,
    queryScore: queryScore,
    hits: hits,
    timedOut: timedOut
  });
}

/**
 * Helper function to get current count of users
 */
let getCount = () => {
  return new Promise((resolve, reject) => {
    client.search({
      index: INDEX_NAME
    }, function (err, res) {
      if (err) {
        reject(err);
      } else {
        console.log(res.hits.total);
        resolve(res.hits.total);
      }
    });
  });
};

/*
 * Helper function to append ID to user object
 */
let appendId = (obj) => {
  let result = obj._source;
  result.id = obj._id;
  return result;
};


//test
for (var i = 0; i < 5; i++) {
  getRandomUserByNumID();
}

// getCount();
