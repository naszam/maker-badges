pragma solidity 0.6.7;
pragma experimental ABIEncoderV2;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren
/// @notice BadgePaymaster
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin v3.0 library is used for secure contract development

import "@opengsn/gsn/contracts/utils/GSNTypes.sol";
import "@opengsn/gsn/contracts/BasePaymaster.sol";

contract BadgePaymaster is BasePaymaster {

using GSNTypes for GSNTypes.RelayRequest;
using GSNTypes for GSNTypes.GasData;

constructor() public {
}

/// Functions

//return the payer of this request.
// for account-based target, this is the target account.
function getPayer(GSNTypes.RelayRequest calldata relayRequest) external pure returns (address) {
    return relayRequest.target;
}

function acceptRelayedCall(
    GSNTypes.RelayRequest calldata relayRequest,
    bytes calldata approvalData,
    uint256 maxPossibleGas
)
external
override
view
returns (bytes memory context) {

          (approvalData);
          address payer = this.getPayer(relayRequest);
          uint256 ethMaxCharge = relayHub.calculateCharge(maxPossibleGas, relayRequest.gasData);

          return abi.encode(payer);

}

function preRelayedCall(bytes calldata context) external override relayHubOnly returns (bytes32) {

        return bytes32(0);
}

function postRelayedCall(
    bytes calldata context,
    bool success,
    bytes32 preRetVal,
    uint256 gasUseWithoutPost,
    GSNTypes.GasData calldata gasData
) external override relayHubOnly {
    (success, preRetVal);

    uint256 ethActualCharge;
    uint256 justPost;

    relayHub.depositFor{value: ethActualCharge}(address(this));
}

}
