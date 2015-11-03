var SDC = require('sdc-clients');
var vasync = require('vasync');

/*
 * XXX: todo
 * - getMetadata
 * - listMetadata
 * - getJob
 * - listJobs
 * - listRoleTags
 * - listSnapshots - missing from node-sdc-clients, surely should exist?
 * - ping
 */

function VMAPI(config){
	var self = this;

	self.datacenters = [];

	Object.keys(config.datacenters).forEach(function(datacenter){
		self.datacenters[datacenter] = 
			new SDC.VMAPI(config.datacenters[datacenter].vmapi);
	});
};

VMAPI.prototype.getVm = function(params, options, callback){
	if(typeof(options) === 'function'){
		callback = options;
		options = undefined;
	}

	var self = this;

	var tasks = [];

	Object.keys(self.datacenters).forEach(function(d){
		tasks.push(function(callback){
			self.datacenters[d].getVm(params, options, function(err, vm){
				if(vm){
					vm.datacenter = d;
				}

				/*
				 * XXX: Should we close our connections here, or should the
				 * consumer? Will the consumer ever need to re-use a
				 * connection?
				 */
				self.datacenters[d].client.close();

				callback(err, vm);
			});
		});
	});

	vasync.parallel({
		funcs: tasks,
	}, function(err, results){
		/* 
		 * XXX: need a better way of properly returning the single
		 * result, which is what vmapi.getVm actually gives us
		 */
		var vm = results.successes[0];

		callback(err, vm)
	});
};

VMAPI.prototype.listVms = function(params, options, callback){
	if(typeof(params) === 'function'){
		callback = params;
		params = {};
	} else if(typeof(options) === 'function'){
		callback = options;
		options = undefined;
	}

	var self = this;

	var tasks = [];
	var datacenters = [];
	if(params.datacenters){
		datacenters = datacenters.concat(params.datacenters);
		/*
		 * We delete params.datacenters because vmapi#listVms doesn't
		 * expect the value.
		 */
		delete params.datacenters;
	} else {
		datacenters = Object.keys(self.datacenters)
	}

	datacenters.forEach(function(d){
		tasks.push(function(callback){
			self.datacenters[d].listVms(params, options, function(err, vms){
				if(vms){
					vms.map(function(vm){
						vm.datacenter = d;
					})
				}
				self.datacenters[d].client.close();

				callback(err, vms);
			});
		});
	});

	vasync.parallel({
		funcs: tasks,
	}, function(err, results){
		var vms = [].concat.apply([], results.successes);

		callback(err, vms);
	});
};

VMAPI.prototype.ping = function(callback){
	var self = this;

	var tasks = [];

	Object.keys(self.datacenters).forEach(function(d){
		tasks.push(function(callback){
			self.datacenters[d].ping(function(err, res){
				if(res){
					res.datacenter = d;
				}
				self.datacenters[d].client.close()
				callback(err, res);
			});
		});
	});

	vasync.parallel({
		funcs: tasks,
	}, function(err, results){
		/*
		 * XXX: Should we return a list of the errors as the 
		 * second arg here? err enough?
		 */
		callback(err, results.successes);
	});
};

module.exports = VMAPI;