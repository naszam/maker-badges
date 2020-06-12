/// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.9;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari
/// @notice BadgeRoles Access Management for Default Admin, Templater and Pauser Role
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effects through TDD approach
/// @dev OpenZeppelin v3.0 library is used for secure contract development

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";


contract BadgeRoles is Ownable, AccessControl, Pausable {

  /// @dev Roles
  bytes32 public constant TEMPLATER_ROLE = keccak256("TEMPLATER_ROLE");
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, owner());

        _setupRole(TEMPLATER_ROLE, owner());
        _setupRole(PAUSER_ROLE, owner());

  }

  /// @dev Modifiers
  modifier onlyAdmin() {
      require(isAdmin(msg.sender), "Caller is not an admin");
      _;
    }

  modifier onlyTemplater() {
      require(isTemplater(msg.sender), "Caller is not a template owner");
      _;
    }

  /// @dev Functions

  /// @notice Check if guy is an Admin
  /// @dev Used in onlyAdmin() modifier
  /// @param guy Address to check
  /// @return True If the guy is an Admin
  function isAdmin(address guy) public view returns (bool) {
    return hasRole(DEFAULT_ADMIN_ROLE, guy);
  }

  /// @notice Check if guy is a Templater
  /// @dev Used in onlyTemplater() modifier
  /// @param guy Address to check
  /// @return True If the guy is a Templater
  function isTemplater(address guy) public view returns (bool) {
    return hasRole(TEMPLATER_ROLE, guy);
  }

  /// @notice Add a new Templater
  /// @dev Access restricted only for Admins
  /// @param guy Address of the new Templater
  /// @return True if the guy address is added as Templater
  function addTemplater(address guy) external onlyAdmin returns (bool) {
    require(!isTemplater(guy), "guy is already a templater");
    grantRole(TEMPLATER_ROLE, guy);
    return true;
  }

  /// @notice Remove a Templater
  /// @dev Access restricted only for Admins
  /// @param guy Address of the Templater
  /// @return True if the guy address is removed as Templater
  function removeTemplater(address guy) external onlyAdmin returns (bool) {
    require(isTemplater(guy), "guy is not a templater");
    revokeRole(TEMPLATER_ROLE, guy);
    return true;
  }
  /// @notice Pause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function pause() external {
    require(hasRole(PAUSER_ROLE, msg.sender), "BadgeFactory: must have pauser role to pause");
    _pause();
  }

  /// @notice Unpause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function unpause() external {
        require(hasRole(PAUSER_ROLE, msg.sender), "BadgeFactory: must have pauser role to unpause");
        _unpause();
    }


}
