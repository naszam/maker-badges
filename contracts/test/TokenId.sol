// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.4;

contract TokenId {
    constructor() {}

    // --- Math ---
    function toUint96(uint256 x) internal pure returns (uint96 z) {
        require((z = uint96(x)) == x, "MakerBadges/uint96-overflow");
    }

    // --- Strings ---
    function cmpStr(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    // --- Targets ---
    function getTokenId(address redeemer, uint256 templateId) external pure returns (uint256 _id) {
        bytes memory _tokenIdBytes = abi.encodePacked(redeemer, toUint96(templateId));
        assembly {
            _id := mload(add(_tokenIdBytes, add(0x20, 0)))
        }
    }

    function unpackTokenId(uint256 id) internal pure returns (address redeemer, uint256 templateId) {
        assembly {
            redeemer := shr(96, and(id, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000))
            templateId := and(id, 0x0000000000000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF)
        }
    }

    // --- Fuzz ---
    function badge(address redeemer, uint256 templateId) public view {
        try this.getTokenId(redeemer, templateId) returns (uint256 tokenId) {
            (address redeemer2, uint256 templateId2) = unpackTokenId(tokenId);
            assert(redeemer == redeemer2);
            assert(templateId == templateId2);
        } catch Error(string memory errmsg) {
            assert(templateId > type(uint96).max && cmpStr(errmsg, "MakerBadges/uint96-overflow"));
        } catch {
            assert(false); // echidna will fail if other revert cases are caught
        }
    }
}
