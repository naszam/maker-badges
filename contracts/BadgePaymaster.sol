/// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren
/// @notice BadgePaymaster
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin v3.0 library is used for secure contract development

import "@opengsn/gsn/contracts/BasePaymaster.sol";

contract BadgePaymaster is BasePaymaster {

constructor() public {
}

/// Functions

mapping(address => bool) public whitelist;

function addToWhitelist(address _address) onlyOwner external {
    whitelist[_address] = true;
}

function acceptRelayedCall(
    GSNTypes.RelayRequest calldata relayRequest,
    bytes calldata,
    uint256
)
override
external
view
returns (bytes memory){
    require(whitelist[relayRequest.relayData.senderAddress], "not whitelisted");
    return "";
}

function preRelayedCall(bytes calldata) override external returns (bytes32){
    return 0;
}

function postRelayedCall(
    bytes calldata,
    bool,
    bytes32,
    uint256,
    GSNTypes.GasData calldata
)
override
external {

}

}
