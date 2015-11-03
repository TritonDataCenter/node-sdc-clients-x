var restify = require('restify');
var vasync = require('vasync');

function WORKFLOW(config){
	var self = this;

	self.datacenters = [];

	Object.keys(config.datacenters).forEach(function(datacenter){
		self.datacenters[datacenter] = 
			new restify.createJsonClient(config.datacenters[datacenter].workflow);
	});
};

WORKFLOW.prototype.getJob = function(uuid, options, callback){
	if (typeof(options) === 'function'){
		callback = options;
		options = undefined;
	}

	var self = this;

	var tasks = [];

	Object.keys(self.datacenters).forEach(function(d){
		tasks.push(function(callback){
			self.datacenters[d].get("/jobs/" + uuid, function(err, req, res, job){
				if(job){
					job.datacenter = d;
				}
				callback(err, job);
			});
		});
	});

	vasync.parallel({
		funcs: tasks,
	}, function(err, results){
		callback(err, results.successes[0])
	});
};

module.exports = WORKFLOW;