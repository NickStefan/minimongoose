# MiniMongoose

 - Reuse your mongoose schemas in the browser
 - Run mongoose queries in the browser (limit, skip, populate, .exec etc) against your backend
 - Built in caching layer prevents duplication of both "in flight" and previous queries

After reading a lot about Relay, I wondered if it would be possile to do something similar with just mongoose. At first, I just commented out the monogdb driver in mongoose. The browserify build (debug: false), was in the multiple megabytes! MiniMongoose is my attemp to support mongoose schemas and queries in a much smaller library.

When minified, it's around 500kb. A huge amount of that is simply from `require('mongoose').Schema`. Re-implimenting just the Schema methods needed for this library would get it much closer to Relay's 200kb minified. It would also be much smaller if it did not depend on jquery for ajax.

### Use

`$ npm install minimongoose`

~~~js
/* pre compiled to es5 */
var MiniMongoose = require('minimongoose').MiniMongoose;

var Schema = MiniMongoose.Schema;

/* 
define your api end point that will receive payloads
*/

var MnM = new MiniMongoose({
    resourcePrefix: '/api/'
});

var car = new Schema({
    brand: {type: Schema.ObjectId, ref: 'Brand'}
});

// load the schemas
MnM.model('Brand', {});

MnM.model('Car', car);

MnM.models.Car
.find({name:'Mustang'})
.populate('brand')
.lean()
.exec(function(err, results){
    document.querySelector('.results')
    .innerHTML = JSON.stringify(results, null, 4);
});
~~~

### One big difference from Mongoose:

 The queries return Immutable Ordered maps (using _id as the map keys).

 If you don't like that, it's easily corrected with `toJS()`.

~~~js
MnM.models.Car
.find()
.limit(3)
.populate('brand')
.exec(function(err, cars){
  console.log( cars.toJS() );
  /* 
  {
    "562d869b32c4e3e31af61599": {
        "_id": "562d869b32c4e3e31af61599",
        "updated_at": "2015-10-26T01:49:15.665Z",
        "brand": {
            "_id": "562d869b32c4e3e31af61595",
            "updated_at": "2015-10-26T01:49:15.658Z",
            "name": "Ford",
            "__v": 0
        },
        "name": "Mustang",
        "__v": 0
    }
  }
  */
});
~~~

The immutable implimentation actually speeds up the querying and populating of larger collections.

### Example APP

Once you've cloned the git repo down:
`$ npm install && cd example && npm install && node server.js`
vist localhost:3000


### Server API
You can define your own `/api/` route, but here's what the example app uses.

It expects a payload of:
~~~js
{
  modelName:'Car',
  op: 'find',
  match: '{name: \'Mustang\' }',
  fields: ...
  skip: ...
  limit: ...
  sort: ...
}
~~~

~~~js

var express = require('express');
var router = express.Router();

function mongoMongooseMediator(req, res, cb){
  var params = req.body;
  var model = req.db[params.modelName];
  var query = model[params.operation](JSON.parse(params.match));

  if (params.fields){
    query = query.select(params.fields);
  }
  if (params.sort){
    query = query.sort(params.sort);
  }
  if (params.limit){
    query = query.limit(params.limit);
  }
  if (params.skip){
    query = query.skip(params.skip);
  }
  query.lean().exec(cb);
}

router.post('/', function(req, res) {
  var modelName = req.body.modelName;
  mongoMongooseMediator(req, res, function(err, results){
    res.send(JSON.stringify({
      modelName: modelName,
      results: results
    }));
  });
});

module.exports = router;

~~~


### es6

~~~js
/* if you want the es6 files, in order to do your own external aliasing for libraries like jquery etc */ 
import MiniMongoose from 'minimongoose/src/mini-mongoose';
~~~

### Road map
 - get the minified size down closer to 200kb.
 - fill in other mongoose methods besides find, findOne, and count (such as findAndModify).

I've stubbed out where `findOneAndModify` and the other mongoose methods would go, but for now a lot of them are no-ops (see `src/client-db/collection` and `src/model`).
I mainly focused on the `find` API and making the mquery api work nicely.