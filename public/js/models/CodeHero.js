(function () {
  var server = false,
    Models;
	if (typeof exports !== 'undefined') {
		Models = exports;
		server = true;
		var _ = require('underscore')._
				, Backbone = require('backbone');
	} else {
		Models = this.Models = {};
		Backbone = window.Backbone;
	}


	Models.CodeHero = Backbone.Model.extend({
		urlRoot: '/api/codeheroes',
		idAttribute: "_id",
		validate: function(attrs) {
			if (!attrs.aknowledgeGameRisk) {
				return 'You need to accept the terms to feel the pain';
			}
		}
	});

})()