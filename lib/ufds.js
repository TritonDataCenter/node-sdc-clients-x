var SDC = require('sdc-clients');
var vasync = require('vasync');

function UFDS(config){
    var self = this;

    self.datacenters = [];

    Object.keys(config.datacenters).forEach(function(datacenter){
        if(config.datacenters[datacenter].ufds){
            self.datacenters[datacenter] =
                new SDC.UFDS(config.datacenters[datacenter].ufds);
        }
    });
};

UFDS.prototype.getUserEx = function(options, callback){
    var self = this;

    var tasks = [];

    Object.keys(self.datacenters).forEach(function(d){
        tasks.push(function(callback){
            self.datacenters[d].getUserEx(options, function(err, user){
                callback(err, user);
            });
        });
    });

    vasync.parallel({
        funcs: tasks,
    }, function(err, results){
        if(err) {
            return callback(err);
        }
        var user = results.successes[0];
        callback(null, user)
    });
};

UFDS.prototype.listRoles = function(account, filter, callback){
    var self = this;

    var tasks = [];

    Object.keys(self.datacenters).forEach(function(d){
        tasks.push(function(callback){
            self.datacenters[d].listRoles(account, filter, function(err, roles){
                callback(err, roles);
            });
        });
    });

    vasync.parallel({
        funcs: tasks,
    }, function(err, results){
        if(err) {
            return callback(err);
        }
        var roles = results.successes[0];
        callback(null, roles)
    });
};

UFDS.prototype.search = function search(base, options, controls, cb) {
    var self = this;

    var tasks = [];

    Object.keys(self.datacenters).forEach(function(d){
        tasks.push(function(callback){
            self.datacenters[d].search(base, options, controls, function(err, res){
                callback(err, res);
            });
        });
    });

    vasync.parallel({
        funcs: tasks,
    }, function(err, results){
        if(err) {
            return callback(err);
        }
        var res = results.successes[0];
        callback(null, res)
    });
};

module.exports = UFDS;
