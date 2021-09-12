// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "../MakerBadges.sol";

interface Hevm {
    function warp(uint256) external;

    function store(
        address,
        bytes32,
        bytes32
    ) external;

    function load(address, bytes32) external;
}

contract MakerBadgesEchidnaTest is MakerBadges {
    /// @dev Senders
    address internal multisig = address(0x41414141);
    address internal user = address(0x42424242);
    address internal attacker = address(0x43434343);

    /// @dev MetaTx
    MinimalForwarder forwarder = new MinimalForwarder();

    /// @dev Hevm
    Hevm hevm;

    // CHEAT_CODE = 0x7109709ECfa91a80626fF3989D68f67F5b1DD12D
    bytes20 constant CHEAT_CODE = bytes20(uint160(uint256(keccak256("hevm cheat code"))));

    constructor() MakerBadges(forwarder, multisig) {
        hevm = Hevm(address(CHEAT_CODE));

        // Set TokenIds
        hevm.store(address(this), keccak256(abi.encode(user, uint256(5))), bytes32(uint256(42))); // user     tokenid = 42
        hevm.store(address(this), keccak256(abi.encode(attacker, uint256(5))), bytes32(uint256(24))); // attacker tokenid = 24

        // Set Balances
        hevm.store(address(this), keccak256(abi.encode(multisig, uint256(6))), bytes32(uint256(0))); // multisig balance = 0
        hevm.store(address(this), keccak256(abi.encode(user, uint256(6))), bytes32(uint256(1))); // user balance = 1
        hevm.store(address(this), keccak256(abi.encode(attacker, uint256(6))), bytes32(uint256(1))); // attacker balance = 1
    }

    function cmpStr(string memory a, string memory b) internal view returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function echidna_default_admin_constant() public returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, multisig);
    }

    function echidna_admin_constant() public returns (bool) {
        return hasRole(ADMIN_ROLE, multisig);
    }

    function echidna_templater_constant() public returns (bool) {
        return hasRole(TEMPLATER_ROLE, multisig);
    }

    function echidna_pauser_constant() public returns (bool) {
        return hasRole(PAUSER_ROLE, multisig);
    }

    function user_balance_constant() public returns (bool) {
        return balanceOf(user) == 1;
    }

    function transfer_disabled() public returns (bool) {
        try this.transferFrom(msg.sender, user, 24) {} catch Error(string memory errmsg) {
            return cmpStr(errmsg, "MakerBadges/token-transfer-disabled");
        } catch {
            assert(false); // echidna will fail if other revert cases are caught
        }
    }
}
