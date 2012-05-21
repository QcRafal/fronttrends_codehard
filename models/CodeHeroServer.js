var server = false;
if (typeof exports !== 'undefined') {
  server = true;
}

(function(exports){
  if (server) {
    var _ = require('underscore')._
      , Backbone = require('backbone')
      , mongoq = require('mongoq')
      , Models = require('../public/js/models/CodeHero');
  }

  var db = mongoq('node-mongo-herochallenge');

  exports.CodeHeroServer = Models.CodeHero.extend({
    defaults: {
      painGameScore: 0,
      playedPainGame: false
    },

    //  Document Public API
    //  -------------------
    initialize : function() {},  // called on subclasses

    // Refresh the contents of this document from the database
    fetch : function(callback) {
      var self = this;
      
      self._withCollection(function(err, collection) {
        if (err) { return callback(err); }
        
        collection.findOne({ _id: self.id }, function(err, dbModel) {
          if (!dbModel) {
            err = 'Could not find id ' + self.id;
          } else if(!err) {
            self.set(dbModel);            
          }
          callback(err, self);
        });      
      });
    },

    save: function(attrs, callback) {
      var self = this,
          options = {
              error: function(model, error, options) {
                  callback(error, model);
              }
          };
  
      // options.error configures the callback
      if (attrs) {
        if (!this.set(attrs, options)) return;
      } else {
        if (self.validate) {
            var error = self.validate(self.attributes, options);
            if (error) {
              callback(error, self);
            }
        }
      }
      
      self._withCollection(function(err, collection) {
        if (err) { 
          return callback(err); 
        }
        
        if (self.isNew()) {
          collection.insert(self.attributes, function(err, dbModel) {
            if(!err) { self.set(dbModel[0]); }          
            callback(err, self);
          });
        } else {
          collection.update({ _id: self.id }, self.attributes, function(err) {
            callback(err, self);
          });
        }
      });
    },
    // Remove this document from the database 
    destroy : function(callback) {
      var self = this;

      self._withCollection(function(err, collection) {
        if (err) { return callback(err); }
        
        collection.remove({ _id: self.id }, callback);
      });
    },

    //  Private API functions
    //  ---------------------

    // Request the Database collection associated with this Document
    _withCollection : function(callback) {
      callback(null, db.collection('codeheroes'));
    }

  });

})(typeof exports === 'undefined' ? this['CodeHeroServer'] = {}: exports);