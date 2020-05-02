pragma solidity 0.6.6;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren, Bryan Flynn
/// @notice InsigniaDAO to check for activities on maker system and activate badges
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin library is used for secure contract development

import "./BadgeFactory.sol";

interface PotLike {

    function pie(address guy) external view returns (uint256);
    function chi() external view returns (uint256);

}

contract InsigniaDAO is BadgeFactory {

using SafeMath for uint256;
using Address for address;


// Events
event BadgeActivated(address guy, uint256 templateId, string tokenURI);

// Data
PotLike  private pot;


// Math

uint constant WAD = 10 ** 18;

function wmul(uint x, uint y) internal pure returns (uint z) {
        // always rounds down
        z = x.mul(y) / WAD;
    }

constructor() public {

      // MCD_POT Kovan Address https://changelog.makerdao.com/releases/kovan/1.0.5/contracts.json
			pot = PotLike(0xEA190DBDC7adF265260ec4dA6e9675Fd4f5A78bb);
	}

function balance(address guy) public view returns (uint256) {
   uint256 slice = pot.pie(guy);
   uint256 chi = pot.chi();
   return wmul(slice, chi);
}

function dsrChallange(uint256 templateId, string memory tokenURI) public returns (bool) {
   uint256 interest = balance(msg.sender);
   require(interest == 1, "The caller has not accrued 1 Dai interest");
   _activateBadge(msg.sender, templateId, tokenURI);
   emit BadgeActivated(msg.sender, templateId, tokenURI);
   return true;
}



}
