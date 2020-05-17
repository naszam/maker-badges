/// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;


/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren
/// @notice InsigniaDAO to check for activities on maker ecosystem and keep track of redeemers
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin library is used for secure contract development

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";

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

contract InsigniaDAO is Ownable, AccessControl, Pausable, BaseRelayRecipient {

  /// Libraries
  using SafeMath for uint256;
  using EnumerableSet for EnumerableSet.AddressSet;

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  bytes32[] public roots;

  EnumerableSet.AddressSet private redeemers;

  /// Events
  event redeemerChecked(address guy);

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

        /// OpenGSN TruestedForwarder on Kovan
        trustedForwarder = 0x6453D37248Ab2C16eBd1A8f782a2CBC65860E60B;
  }

  /// @notice Fallback function
  /// @dev Added not payable to revert transactions not matching any other function which send value
  fallback() external {
    revert();
  }

  /// @notice OpenGSN _msgSender()
  /// @dev override _msgSender() in OZ Context.sol and BaseRelayRecipient.sol
  /// @return msg.sender after relay call
  function _msgSender() internal override(Context, BaseRelayRecipient) view returns (address payable) {
            return BaseRelayRecipient._msgSender();
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

  /// @notice Check Redeemer
  /// @dev Keep track of the hash of the caller if successful
  /// @return True if the caller successfully checked for activities on MakerDAO
  function checkRedeemer(uint256 id) public whenNotPaused returns (bool) {
    require(_dai(_msgSender()) == 1 ether ||chief.votes(_msgSender()) != 0x00 || flipper.bids(id).guy == _msgSender() , "The caller has not done any actvitiy on MakerDAO");
    redeemers.add(address(uint160(uint256(keccak256(abi.encodePacked(_msgSender()))))));
    emit redeemerChecked(_msgSender());
    return true;
  }

  /// @notice Check if guy is a redeemer
  /// @dev Verify if the hash of guy address exists
  /// @param guy Address to verify
  /// @return True if guy is a redeemer
  function verify(address guy) public view whenNotPaused returns (bool) {
    require(redeemers.contains(address(uint160(uint256(keccak256(abi.encodePacked(guy)))))), "The address is not a redeemer");
    return true;
  }

  /// @notice Pause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function pause() public {
    require(hasRole(PAUSER_ROLE, _msgSender()), "InsigniaDAO: must have pauser role to pause");
    _pause();
  }

  /// @notice Unpause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function unpause() public {
        require(hasRole(PAUSER_ROLE, _msgSender()), "InsigniaDAO: must have pauser role to unpause");
        _unpause();
    }

}
