pragma solidity 0.6.6;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren, Bryan Flynn
/// @notice BadgeRoles Access Management for Minter Role
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin v3.0 library is used for secure contract development

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

  /// @notice Check if the address is an Admin
  /// @dev Used in onlyAdmin() modifier
  /// @param account Address to check
  /// @return True if the account is an Admin
  function isAdmin(address account) public view returns (bool) {
      return hasRole(DEFAULT_ADMIN_ROLE, account);
  }

  /// @notice Check if the address is a Minter
  /// @dev Used in onlyMinter() modifier
  /// @param account Address to check
  /// @return True if the account is a Minter
  function isMinter(address account) public view returns (bool) {
    return hasRole(MINTER_ROLE, account);
  }

  /// @notice Add a new Minter
  /// @dev Access restricted only for Admins
  /// @param account Address of the new Minter
  /// @return True if the account address is added as Minter
  function addMinter(address account) public onlyAdmin returns (bool){
    grantRole(MINTER_ROLE, account);
    return true;
  }

  /// @notice Remove a Minter
  /// @dev Access restricted only for Admins
  /// @param account Minter address to remove
  /// @return True if the account address if removed as Minter
  function removeMinter(address account) public onlyAdmin returns (bool){
    revokeRole(MINTER_ROLE, account);
    return true;
  }

}
