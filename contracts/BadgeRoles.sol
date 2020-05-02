
pragma solidity 0.6.6;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren, Bryan Flynn
/// @notice BadgeRoles Access Management for Minter Role
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin v3.0 library is used for secure contract development

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract BadgeRoles is Ownable, AccessControl, Pausable {

  // Roles
  bytes32 public constant TEMPLATER_ROLE = keccak256("TEMPLATER_ROLE");
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");


  constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, owner());

        _setupRole(TEMPLATER_ROLE, owner());
        _setupRole(PAUSER_ROLE, owner());
  }

  // Modifiers
  modifier onlyTemplater() {
      require(isTemplater(msg.sender), "Caller is not a template owner");
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

  /// @notice Check if the address is a Templater
  /// @dev Used in onlyMinter() modifier
  /// @param account Address to check
  /// @return True if the account is a Templater
  function isTemplater(address account) public view returns (bool) {
    return hasRole(TEMPLATER_ROLE, account);
  }

  /// @notice Add a new Templater
  /// @dev Access restricted only for Admins
  /// @param account Address of the new Templater
  /// @return True if the account address is added as Templater
  function addTemplater(address account) public onlyAdmin returns (bool){
    grantRole(TEMPLATER_ROLE, account);
    return true;
  }

  /// @notice Remove a Templater
  /// @dev Access restricted only for Admins
  /// @param account Templater address to remove
  /// @return True if the account address if removed as Templater
  function removeMinter(address account) public onlyAdmin returns (bool){
    revokeRole(TEMPLATER_ROLE, account);
    return true;
  }

}
