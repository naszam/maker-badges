pragma solidity 0.6.6;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren, Bryan Flynn
/// @notice BadgeRoles access management for Minter Role
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin library is used for secure contract development

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BadgeRoles is Ownable, AccessControl {

  // Create a new role identifier for the minter role
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, owner());
  }

  // Modifiers
  modifier onlyMinter() {
      require(isMinter(msg.sender), "Caller is not a minter");
      _;
    }

  modifier onlyAdmin() {
    require(isAdmin(msg.sender), "Caller is not an admin");
    _;
  }

  // Functions
  function isAdmin(address account) public view returns (bool) {
      return hasRole(DEFAULT_ADMIN_ROLE, account);
  }

  function isMinter(address account) public view returns (bool) {
    return hasRole(MINTER_ROLE, account);
  }

  function addMinter(address account) public onlyAdmin returns (bool){
    grantRole(MINTER_ROLE, account);
    return true;
  }

  function removeMinter(address account) public onlyAdmin returns (bool){
    revokeRole(MINTER_ROLE, account);
    return true;
  }

}
