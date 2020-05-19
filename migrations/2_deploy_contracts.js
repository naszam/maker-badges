var InsigniaDAO = artifacts.require("InsigniaDAO");
var BadgeFactory = artifacts.require("BadgeFactory");
var BadgePaymaster = artifacts.require("BadgePaymaster");

module.exports = function(deployer) { 
	deployer.deploy(InsigniaDAO).then(function() {
		return deployer.deploy(BadgeFactory, InsigniaDAO.address);
	});
	deployer.deploy(BadgePaymaster);
};
