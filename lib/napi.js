var SDC = require('sdc-clients');
var vasync = require('vasync');

function NAPI(config){
	var self = this;

	self.datacenters = [];

	Object.keys(config.datacenters).forEach(function(datacenter){
		self.datacenters[datacenter] =
			new SDC.NAPI(config.datacenters[datacenter].napi);
	});
};

NAPI.prototype.searchIPs = function(ipAddr, params, options, callback){
	if(typeof(options) === 'function'){
		callback = options;
		options = undefined;
	}

	var self = this;

	var tasks = [];

	Object.keys(self.datacenters).forEach(function(d){
		tasks.push(function(callback){
			self.datacenters[d].searchIPs(ipAddr, params, options, function(err, ips){
				if(ips){
					ips.map(function(ip){
						ip.datacenter = d;
					})
				}

				/*
				 * XXX: Should we close our connections here, or should the
				 * consumer? Will the consumer ever need to re-use a
				 * connection?
				 */
				//self.datacenters[d].client.close();

				callback(err, ips);
			});
		});
	});

	vasync.parallel({
		funcs: tasks,
	}, function(err, results){
		var ips = [].concat.apply([], results.successes);

		callback(err, ips)
	});
};

module.exports = NAPI;
