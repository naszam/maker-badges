// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;
import "../BadgeRoles.sol";

contract BadgeRolesEchidnaTest {
    BadgeRoles internal roles;

    /// @dev Constructor args
    MinimalForwarder internal forwarder;
    address internal constant multisig = address(0x41414141);

    /// @dev Roles
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEMPLATER_ROLE = keccak256("TEMPLATER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor() {
        roles = new BadgeRoles(forwarder, multisig);
    }

    function echidna_default_admin_constant() external view returns (bool) {
        return roles.hasRole(DEFAULT_ADMIN_ROLE, multisig);
    }

    function echidna_admin_constant() external view returns (bool) {
        return roles.hasRole(ADMIN_ROLE, multisig);
    }

    function echidna_templater_constant() external view returns (bool) {
        return roles.hasRole(TEMPLATER_ROLE, multisig);
    }

    function echidna_pauser_constant() external view returns (bool) {
        return roles.hasRole(PAUSER_ROLE, multisig);
    }
}
