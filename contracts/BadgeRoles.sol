/// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title Non-transferable Badges for Maker Ecosystem Activity, CDIP 18, 29, 38
/// @author Nazzareno Massari @naszam
/// @notice BadgeRoles Access Management for Default Admin and Templater Roles

contract BadgeRoles is AccessControlEnumerable, ERC2771Context {
    /// @dev Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEMPLATER_ROLE = keccak256("TEMPLATER_ROLE");

    /// @dev Errors
    error OnlyDefAdmin();
    error ZeroAddress();
    error OnlyPauser();

    constructor(MinimalForwarder forwarder, address multisig) ERC2771Context(address(forwarder)) {
        require(multisig != address(0), "MakerBadges/invalid-multisig-address");

        _setupRole(DEFAULT_ADMIN_ROLE, multisig);

        _setupRole(ADMIN_ROLE, multisig);
        _setupRole(TEMPLATER_ROLE, multisig);
    }

    /// @dev Functions

    /// @notice Add a new Admin
    /// @dev Access restricted only to Default Admin
    /// @param account Address of the new Admin
    /// @return True if account is added as Admin
    function addAdmin(address account) external returns (bool) {
        if (!hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) revert OnlyDefAdmin();
        if (account == address(0)) revert ZeroAddress();
        grantRole(ADMIN_ROLE, account);
        return true;
    }

    /// @notice Remove an Admin
    /// @dev Access restricted only to Default Admin
    /// @param account Address of the Admin
    /// @return True if account is removed as Admin
    function removeAdmin(address account) external returns (bool) {
        if (!hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) revert OnlyDefAdmin();
        revokeRole(ADMIN_ROLE, account);
        return true;
    }

    /// @notice Add a new Templater
    /// @dev Access restricted only to Default Admin
    /// @param account Address of the new Templater
    /// @return True if account is added as Templater
    function addTemplater(address account) external returns (bool) {
        if (!hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) revert OnlyDefAdmin();
        if (account == address(0)) revert ZeroAddress();
        grantRole(TEMPLATER_ROLE, account);
        return true;
    }

    /// @notice Remove a Templater
    /// @dev Access restricted only to Default Admin
    /// @param account Address of the Templater
    /// @return True if account is removed as Templater
    function removeTemplater(address account) external returns (bool) {
        if (!hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) revert OnlyDefAdmin();
        revokeRole(TEMPLATER_ROLE, account);
        return true;
    }

    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address sender) {
        return super._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }
}
