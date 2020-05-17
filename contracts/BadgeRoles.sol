/// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.8;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren
/// @notice BadgeRoles Access Management for Default Admin, Templater and Pauser Role
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin v3.0 library is used for secure contract development

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";


contract BadgeRoles is Ownable, AccessControl, Pausable, BaseRelayRecipient {

  /// Roles
  bytes32 public constant TEMPLATER_ROLE = keccak256("TEMPLATER_ROLE");
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, owner());

        _setupRole(TEMPLATER_ROLE, owner());
        _setupRole(PAUSER_ROLE, owner());

        /// OpenGSN TruestedForwarder on Kovan
        trustedForwarder =  0x6453D37248Ab2C16eBd1A8f782a2CBC65860E60B;
  }

  /// Modifiers
  modifier onlyAdmin() {
      require(isAdmin(_msgSender()), "Caller is not an admin");
      _;
    }

  modifier onlyTemplater() {
      require(isTemplater(_msgSender()), "Caller is not a template owner");
      _;
    }

  /// Functions

  /// @notice OpenGSN _msgSender()
  /// @dev override _msgSender() in OZ Context.sol and BaseRelayRecipient
  /// @return msg.sender after relay call
  function _msgSender() internal override(Context, BaseRelayRecipient) virtual view returns (address payable) {
            return BaseRelayRecipient._msgSender();
  }

  function isAdmin(address guy) public view returns (bool) {
    return hasRole(DEFAULT_ADMIN_ROLE, guy);
  }

  function isTemplater(address guy) public view returns (bool) {
    return hasRole(TEMPLATER_ROLE, guy);
  }

  function addTemplater(address guy) public onlyAdmin returns (bool) {
    grantRole(TEMPLATER_ROLE, guy);
    return true;
  }

  /// @notice Pause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function pause() public {
    require(hasRole(PAUSER_ROLE, _msgSender()), "BadgeFactory: must have pauser role to pause");
    _pause();
  }

  /// @notice Unpause all the functions
  /// @dev the caller must have the 'PAUSER_ROLE'
  function unpause() public {
        require(hasRole(PAUSER_ROLE, _msgSender()), "BadgeFactory: must have pauser role to unpause");
        _unpause();
    }


}
