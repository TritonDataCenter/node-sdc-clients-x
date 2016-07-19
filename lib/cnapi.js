var SDC = require('sdc-clients');
var vasync = require('vasync');

/*
 * XXX: todo
 * - getBootParams
 * - listServers
 * - getTask
 * - getVm
 * - waitlistTicketGet
 * - capacity
 * - listPlatforms
 * - ping
 */

function CNAPI(config){
	var self = this;

	self.datacenters = [];

	Object.keys(config.datacenters).forEach(function(datacenter){
		self.datacenters[datacenter] =
			new SDC.CNAPI(config.datacenters[datacenter].cnapi);
	});
};

CNAPI.prototype.getServer = function(uuid, options, callback){
	if (typeof(options) === 'function'){
		callback = options;
		options = undefined;
	}

	var self = this;

	var tasks = [];

	Object.keys(self.datacenters).forEach(function(d){
		tasks.push(function(callback){
			self.datacenters[d].getServer(uuid, options, function(err, server){
				if(server){
					server.datacenter = d;
				}
				self.datacenters[d].client.close();
				callback(err, server);
			});
		});
	});

	vasync.parallel({
		funcs: tasks,
	}, function(err, results){
		callback(err, results.successes[0])
	});
};

CNAPI.prototype.listServers = function(params, options, callback){
	if (typeof(options) === 'function'){
		callback = options;
		options = undefined;
	}

	var self = this;

	var tasks = [];

	Object.keys(self.datacenters).forEach(function(d){
		tasks.push(function(callback){
			self.datacenters[d].listServers(params, options, function(err, servers){
				if(servers){
					servers.map(function(server){
						server.datacenter = d;
					})
				}
				self.datacenters[d].client.close();
				callback(err, servers);
			});
		});
	});

	vasync.parallel({
		funcs: tasks,
	}, function(err, results){
		var servers = [].concat.apply([], results.successes);
		callback(err, servers)
	});
};

module.exports = CNAPI;
