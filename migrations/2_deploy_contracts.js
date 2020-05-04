var InsigniaDAO = artifacts.require("InsigniaDAO");
var BadgeFactory = artifacts.require("BadgeFactory");

module.exports = function(deployer) { 
	deployer.deploy(InsigniaDAO).then(function() {
		return deployer.deploy(BadgeFactory, InsigniaDAO.address);
	});
};
