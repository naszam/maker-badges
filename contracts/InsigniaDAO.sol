pragma solidity 0.6.6;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren, Bryan Flynn
/// @notice InsigniaDAO to check for activities on maker system and activate badges
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin library is used for secure contract development

import "@openzeppelin/contracts/math/SafeMath.sol";

interface PotLike {

    function pie(address guy) external view returns (uint256);
    function chi() external view returns (uint256);

}

contract InsigniaDAO {

using SafeMath for uint256;

mapping (address => uint256) public badges;

// Events
event BadgeActivated(address guy, uint256 badgeId);

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

function balanceOf(address guy) public view returns (uint256) {
   uint256 slice = pot.pie(guy);
   uint256 chi = pot.chi();
   return wmul(slice, chi);
}

function dsrChallange(uint256 badgeId) public returns (bool) {
   uint256 balance = balanceOf(msg.sender);
   require(balance == 1, "The caller has not accrued 1 Dai interest");
   badges[msg.sender]= badgeId;
   emit BadgeActivated(msg.sender, badgeId);
   return true;
}



}
