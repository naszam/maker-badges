// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.9;

import "../MakerBadges.sol";

contract MakerBadgesEchidnaTest is MakerBadges {
    /// @dev Senders
    address internal constant multisig = address(0x41414141);
    address internal constant user = address(0x42424242);
    address internal constant attacker = address(0x43434343);

    /// @dev MetaTx
    MinimalForwarder forwarder = new MinimalForwarder();

    constructor() MakerBadges(forwarder, multisig) {}

    function echidna_default_admin_constant() public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, multisig);
    }

    function echidna_admin_constant() public view returns (bool) {
        return hasRole(ADMIN_ROLE, multisig);
    }

    function echidna_templater_constant() public view returns (bool) {
        return hasRole(TEMPLATER_ROLE, multisig);
    }
}
