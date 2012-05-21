/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , mongoq = require('mongoq')
  , _ = require('underscore')._
  , Backbone = require('backbone')
  , requirejs = require('requirejs')
  , http = require('http');

var Models = require('./models/CodeHeroServer');

var db = mongoq('node-mongo-herochallenge');

var app = express();

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  // app.use(express.staticCache({maxLength: 1024 * 1024 * 4}));
  app.use(express.static(__dirname + '/public'));
  app.use(allowCrossDomain);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var checkAdminUser = express.basicAuth('admin', 'admin');

app.get('/', routes.index);
app.get('/scoreboard', routes.scoreboard);
app.get('/admin', checkAdminUser, routes.admin);
app.post('/admin/api/codeheroes', checkAdminUser, function(req, res) {
  console.log("Body is: ", req.body);
  var query = req.body.query;
  
  // sanitize data
  if (query.limit) {
    query.limit = parseInt(query.limit);
  }
  if (query.skip) {
    query.skip = parseInt(query.skip);
  }
  if (query.criteria && query.criteria.email) {
    query.criteria.email = new RegExp(query.criteria.email);
  }
  console.log("Query is: ", query.criteria);

  db.collection('codeheroes').find(query.criteria).skip(query.skip || 0).limit(query.limit || 0).toArray().done(function(scores) {
    res.json(scores);
  });
});
app.post('/admin/api/savewin', checkAdminUser, function(req, res) {
  var userId = req.body.userId;
  console.log("Did win: " + req.body.didWin);
  var score = (req.body.didWin == 'true' ? 1 : 0);

  var BSON = mongoq.BSON;


  console.log("Updating user ID: " + userId + " with score: " + score);
  // find user
  db.collection('codeheroes').update({
    _id: BSON.ObjectID(userId)
  }, {
    $set: {
      playedPainGame: true,
      painGameScore: score
    }
  }, false, false);
  return res.json({
    success: true
  });
});

function getRealIp(req) {
  var realIp = req.header('X-Forwarded-For', null);
  if (realIp == null) {
    realIp = req.connection.remoteAddress;
  }
  return realIp; 
}
function getUserAgent(req) {
  return req.header('User-Agent');
}
function getReferer(req) {
  return req.header('Referer');
}

app.get('/admin/api/codewinners', checkAdminUser, function(req, res) {
  var baseCriteria = {
    playedPainGame: true,
    painGameScore: 1
  };

  db.collection('codeheroes').find(baseCriteria).skip(0).limit(0).toArray().done(function(winners) {
    res.json(winners);
  });
});
app.post('/api/scoreboard', function(req, res) {  
  // var query = req.body.query || {};
  
  // sanitize data
  var query = {};
  if (req.body.limit) {
    query.limit = parseInt(req.body.limit);
  }
  if (req.body.skip) {
    query.skip = parseInt(req.body.skip);
  }

  var baseCriteria = {
    playedPainGame: true,
    painGameScore: 1
  };
  db.collection('codeheroes').find(baseCriteria).skip(query.skip || 0).limit(query.limit || 0).toArray().done(function(scores) {
    db.collection('codeheroes').find(baseCriteria).count().done(function (count) {
      res.json({
        scores: scores,
        totalUsers: count
      });
    })
  });
});

// request code challenge
app.post('/api/codechallenge', function(req, res) {
  var db = mongoq('node-mongo-herochallenge');

  console.log("Req body: ", req.body);
  var insertObj = {
    ip: getRealIp(req),
    referer: getReferer(req),
    useragent: getUserAgent(req),
    email: req.body.email
  };
  db.collection('codechallenge').insert(insertObj, function(err, dbModel) {
    res.json(insertObj);
  });

});

// add codehero
app.post('/api/codeheroes', function(req, res) {

  var codehero = new Models.CodeHeroServer();
  console.log("Body is: ", req.body);
  console.log("Codehero now has attributes", codehero.attributes);

  console.log("Validation results: ", codehero.validate(codehero.attributes));
  
  var validSaveAttrs = ['email', 'nickname', 'nicknameIsTwitterAccount', 
      'aknowledgeGameRisk', 'receiveJobOffers'];
  var validSaveObj = {
    ip: getRealIp(req),
    useragent: getUserAgent(req),
    referer: getReferer(req)
  };
  for (var i = 0; i < validSaveAttrs.length; i++) {
    var attr = validSaveAttrs[i];
    console.log("Setting " + attr + " to: " + req.body[attr]);
    validSaveObj[attr] = req.body[attr];
  }
  codehero.set(validSaveObj);

  console.log("Codehero now has attributes", codehero.attributes);

  codehero.save(null, function (error, model) {
    console.log("Got results: ", error, model);
    res.json(model);
  });
  /*
  db.collection('codeheroes').insert(codehero, {safe: true}).done(function(codehero) {
    res.json(codehero, 201);
  })
*/
});

// List codeheroes
app.get('/api/codeheroes', function(req, res) {
  db.collection('codeheroes').find().skip(req.query.skip || 0).limit(req.query.limit || 0).toArray().done(function(scores) {
    res.json(scores);
  });
});

http.createServer(app).listen(3000);

console.log("Express server listening on port 3000");
