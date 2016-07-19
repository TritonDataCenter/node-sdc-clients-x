var VMAPI = require('./vmapi');
var NAPI = require('./napi');
var CNAPI = require('./cnapi');
var WORKFLOW = require('./workflow');
var UFDS = require('./ufds');
var vasync = require('vasync');

module.exports = function SDC(config){
	return {
		vmapi: new VMAPI(config),
		napi: new NAPI(config),
		cnapi: new CNAPI(config),
		workflow: new WORKFLOW(config),
        ufds: new UFDS(config),
		health: function(callback){
			var self = this;

			var tasks = [];

			this.vmapi.ping(function(err, health){
				callback(err, health);
			});
		},
	}
}
