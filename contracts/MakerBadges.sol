/// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;


/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari
/// @notice MakerBadges to check for activities on maker ecosystem and keep track of redeemers
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin library is used for secure contract development

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";

interface PotLike {

    function pie(address guy) external view returns (uint256);
    function chi() external view returns (uint256);
    function rho() external view returns (uint256);
    function drip() external view returns (uint256);

}

interface DSChiefLike {
  function votes(address) external view returns (bytes32);
}

interface  FlipperLike {
  struct Bid {
    uint256 bid;
    uint256 lot;
    address guy;  // high bidder
    uint48  tic;  // expiry time
    uint48  end;
    address usr;
    address gal;
    uint256 tab;
}
  function bids(uint256) external view returns (Bid memory);
}

contract MakerBadges is Ownable, AccessControl, Pausable {

  /// Libraries
  using SafeMath for uint256;
  using EnumerableSet for EnumerableSet.AddressSet;

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  bytes32[] public roots;

  mapping (uint256 => EnumerableSet.AddressSet) private redeemers;

  /// Events
  event PotChecked(address guy);
  event DSChiefChecked(address guy);
  event FlipperChecked(address guy);

  /// Data
  PotLike  internal pot;
  DSChiefLike internal chief;
  FlipperLike internal flipper;

  /// Math
  uint256 constant RAY = 10 ** 27;

  function rmul(uint256 x, uint256 y) internal view whenNotPaused returns (uint256 z) {
          // always rounds down
          z = x.mul(y) / RAY;
  }

  constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, owner());

        _setupRole(PAUSER_ROLE, owner());

        /// MCD_POT Kovan Address https://kovan.etherscan.io/address/0xea190dbdc7adf265260ec4da6e9675fd4f5a78bb#code
			  pot = PotLike(0xEA190DBDC7adF265260ec4dA6e9675Fd4f5A78bb);

        /// MCD_ADM Kovan Address https://kovan.etherscan.io/address/0xbBFFC76e94B34F72D96D054b31f6424249c1337d#code
        chief = DSChiefLike(0xbBFFC76e94B34F72D96D054b31f6424249c1337d);
        /// MCD_FLIP_ETH_A Kovan Address https://kovan.etherscan.io/address/0xB40139Ea36D35d0C9F6a2e62601B616F1FfbBD1b#code
        flipper = FlipperLike(0xB40139Ea36D35d0C9F6a2e62601B616F1FfbBD1b);

  }

  /// @notice Fallback function
  /// @dev Added not payable to revert transactions not matching any other function which send value
  fallback() external {
    revert();
  }

  /// @notice Set Merkle Tree Root Hashes array
  /// @dev Called by owner to update roots for different address batches by templateId
  /// @param rootHashes Root hashes of the Merkle Trees by templateId
  /// @return True if successfully updated
  function setRootHashes(bytes32[] memory rootHashes) public onlyOwner whenNotPaused returns (bool) {
    roots = rootHashes;
    return true;
  }

  /// @notice Return the accrued interest of guy on Pot
  /// @dev Based on Chai dai() function
  /// @param guy Address to check
  /// @return wad Accrued interest of guy
  function _dai(address guy) internal view whenNotPaused returns (uint256 wad) {
    uint256 slice = pot.pie(guy);
    uint256 chi = (now > pot.rho()) ? pot.drip() : pot.chi();
    wad = rmul(slice, chi);
  }

  /// @notice Pot Challenge
  /// @dev Keep track of the hash of the caller if successful
  /// @return True if the caller successfully checked for activity on Pot
  function potChallenge(uint256 templateId) public whenNotPaused returns (bool) {
    require(_dai(msg.sender) >= 1 ether, "Caller has not accrued 1 or more Dai interest on Pot");
    if (!redeemers[templateId].contains(msg.sender)) {
    redeemers[templateId].add(msg.sender);
    }
    emit PotChecked(msg.sender);
    return true;
  }

  /// @notice DSChief Challenge
  /// @dev Keep track of the hash of the caller if successful
  /// @return True if the caller successfully checked for activity on DSChief
  function chiefChallenge(uint256 templateId) public whenNotPaused returns (bool) {
    require(chief.votes(msg.sender) != 0x00, "Caller is not voting in a Governance Poll");
    if (!redeemers[templateId].contains(msg.sender)) {
    redeemers[templateId].add(msg.sender);
    }
    emit DSChiefChecked(msg.sender);
    return true;
  }

  /// @notice Flipper Challenge
  /// @dev Keep track of the hash of the caller if successful
  /// @return True if the caller successfully checked for activity on Flipper
  function flipperChallenge(uint256 templateId, uint256 bidId) public whenNotPaused returns (bool) {
    require(flipper.bids(bidId).guy == msg.sender, "Caller is not the high bidder in the current Bid in Collateral Auctions");
    if (!redeemers[templateId].contains(msg.sender)) {
    redeemers[templateId].add(msg.sender);
    }
    emit FlipperChecked(msg.sender);
    return true;
  }

  /// @notice Check if guy is a redeemer
  /// @dev Verify if the hash of guy address exists
  /// @param guy Address to verify
  /// @return True if guy is a redeemer
  function verify(uint256 templateId, address guy) public view whenNotPaused returns (bool) {
    return redeemers[templateId].contains(guy);
  }

  /// @notice Pause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function pause() public {
    require(hasRole(PAUSER_ROLE, msg.sender), "InsigniaDAO: must have pauser role to pause");
    _pause();
  }

  /// @notice Unpause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function unpause() public {
        require(hasRole(PAUSER_ROLE, msg.sender), "InsigniaDAO: must have pauser role to unpause");
        _unpause();
    }

}
