pragma solidity 0.6.7;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren, Bryan Flynn
/// @notice BadgeRoles Access Management for Default Admin, Templater and Pauser Role
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

  /// Modifiers
  modifier onlyTemplater() {
      require(hasRole(TEMPLATER_ROLE, msg.sender), "Caller is not a template owner");
      _;
    }

  /// Functions

  /// @notice Pause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function pause() public {
    require(hasRole(PAUSER_ROLE, msg.sender), "BadgeFactory: must have pauser role to pause");
    _pause();
  }

  /// @notice Unpause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function unpause() public {
        require(hasRole(PAUSER_ROLE, msg.sender), "BadgeFactory: must have pauser role to unpause");
        _unpause();
    }


}
