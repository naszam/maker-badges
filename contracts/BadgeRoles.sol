/// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

/// @title Non-transferable Badges for Maker Ecosystem Activity, CDIP 18, 29
/// @author Nazzareno Massari @naszam
/// @notice BadgeRoles Access Management for Default Admin, Templater and Pauser Role
/// @dev See https://github.com/makerdao/community/issues/537
/// @dev See https://github.com/makerdao/community/issues/721
/// @dev All function calls are currently implemented without side effects through TDD approach
/// @dev OpenZeppelin Library is used for secure contract development

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract BadgeRoles is AccessControlEnumerable, Pausable, ERC2771Context {
    /// @dev Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEMPLATER_ROLE = keccak256("TEMPLATER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor(MinimalForwarder forwarder, address multisig) ERC2771Context(address(forwarder)) {
        require(multisig != address(0), "MakerBadges: multisig is the zero address");

        _setupRole(DEFAULT_ADMIN_ROLE, multisig);

        _setupRole(ADMIN_ROLE, multisig);
        _setupRole(TEMPLATER_ROLE, multisig);
        _setupRole(PAUSER_ROLE, multisig);
    }

    /// @dev Functions

    /// @notice Add a new Admin
    /// @dev Access restricted only to Default Admin
    /// @param account Address of the new Admin
    /// @return True if account is added as Admin
    function addAdmin(address account) external returns (bool) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "MakerBadges: caller is not the default admin");
        require(account != address(0), "MakerBadges: account is the zero address");
        grantRole(ADMIN_ROLE, account);
        return true;
    }

    /// @notice Remove an Admin
    /// @dev Access restricted only to Default Admin
    /// @param account Address of the Admin
    /// @return True if account is removed as Admin
    function removeAdmin(address account) external returns (bool) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "MakerBadges: caller is not the default admin");
        revokeRole(ADMIN_ROLE, account);
        return true;
    }

    /// @notice Add a new Templater
    /// @dev Access restricted only to Default Admin
    /// @param account Address of the new Templater
    /// @return True if account is added as Templater
    function addTemplater(address account) external returns (bool) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "MakerBadges: caller is not the default admin");
        require(account != address(0), "MakerBadges: account is the zero address");
        grantRole(TEMPLATER_ROLE, account);
        return true;
    }

    /// @notice Remove a Templater
    /// @dev Access restricted only to Default Admin
    /// @param account Address of the Templater
    /// @return True if account is removed as Templater
    function removeTemplater(address account) external returns (bool) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "MakerBadges: caller is not the default admin");
        revokeRole(TEMPLATER_ROLE, account);
        return true;
    }

    /// @notice Pause all the functions
    /// @dev the caller must have the 'PAUSER_ROLE'
    function pause() external {
        require(hasRole(PAUSER_ROLE, _msgSender()), "MakerBadges: must have pauser role to pause");
        _pause();
    }

    /// @notice Unpause all the functions
    /// @dev the caller must have the 'PAUSER_ROLE'
    function unpause() external {
        require(hasRole(PAUSER_ROLE, _msgSender()), "MakerBadges: must have pauser role to unpause");
        _unpause();
    }

    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address sender) {
        return super._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }
}
