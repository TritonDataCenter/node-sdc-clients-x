# node-sdc-clients-x

This is a node_module intended to create some form of cross-datacenter layer over the existing [node-sdc-clients](https://github.com/joyent/node-sdc-clients) library, which in turn could be used to aid operators of Triton write tooling for their deployments. It attempts to be as thin as possible over node-sdc-clients, intending to work exactly the same as node-sdc-clients. 

The goal here is to be able to use this module as a drop in replacement for node-sdc-clients and get cross-datacenter API interogation with little extra effort. 

As it stands, this is mostly a POC intended to simply feel out whether this is even a good idea or not. 

## Design Issues

In its current form this module isn't very DRY. In order to support a node-sdc-clients interface, we reuse too much of the endpoints parameter validation. For example:

node-sdc-clients.VMAPI.listVms: https://github.com/joyent/node-sdc-clients/blob/master/lib/vmapi.js#L164
node-sdc-clients-x.VMAPI.listVms: https://github.com/chudley/node-sdc-clients-x/blob/master/lib/vmapi.js#L68

There might be another way of doing this, but this is the only way I know of to give the module the same interface as what exists in node-sdc-clients. 