//
// ╔╦╗╔═╗╦╔═╔═╗╦═╗  ╔╗ ╔═╗╔╦╗╔═╗╔═╗╔═╗
// ║║║╠═╣╠╩╗║╣ ╠╦╝  ╠╩╗╠═╣ ║║║ ╦║╣ ╚═╗
// ╩ ╩╩ ╩╩ ╩╚═╝╩╚═  ╚═╝╩ ╩═╩╝╚═╝╚═╝╚═╝
//

/// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.9;

import "./BadgeRoles.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title Non-transferable Badges for Maker Ecosystem Activity, CDIP 18, 29, 38
/// @author Nazzareno Massari @naszam
/// @notice MakerBadges to manage Templates and activate Non-transferable MakerBadges by redeemers
/// @dev See https://github.com/makerdao/community/issues/537
/// @dev See https://github.com/makerdao/community/issues/721
/// @dev See https://github.com/makerdao/community/issues/1180
/// @dev All function calls are currently implemented without side effects through TDD approach
/// @dev OpenZeppelin Library is used for secure contract development
contract MakerBadges is BadgeRoles, ERC721URIStorage {
    /// @dev Libraries
    using MerkleProof for bytes32[];

    uint256 public templateIds;

    string public baseTokenURI;

    bytes32[] private roots;

    struct BadgeTemplate {
        string name;
        string description;
        string image;
    }

    mapping(uint256 => BadgeTemplate) public templates;
    mapping(uint256 => uint256) public templateQuantities;

    /// @dev Events
    event NewTemplate(uint256 indexed templateId, string name, string description, string image);
    event TemplateUpdated(uint256 indexed templateId, string name, string description, string image);
    event BadgeActivated(uint256 indexed tokenId, uint256 indexed templateId);

    /// @dev Errors
    error OverflowUint96();
    error OnlyDefAmin();
    error OnlyAdmin();
    error OnlyTemplater();
    error InvalidTemplateId();
    error OnlyRedeemer();
    error AlreadyClaimed();
    error InvalidTokenId();
    error TransferDisabled();

    constructor(MinimalForwarder forwarder, address multisig)
        ERC721("MakerBadges", "MAKER")
        BadgeRoles(forwarder, multisig)
    {
        baseTokenURI = "https://ipfs.io/ipfs/";
    }

    /// @notice Cast to uint96
    /// @dev Revert on overflow
    /// @param x Value to cast
    function toUint96(uint256 x) internal pure returns (uint96 z) {
        z = uint96(x);
        if (z != x) revert OverflowUint96();
    }

    /// @notice Set the baseURI
    /// @dev Update the baseURI specified in the constructor
    /// @param baseURI New baseURI
    function setBaseURI(string calldata baseURI) external {
        if (!hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) revert OnlyDefAdmin();
        baseTokenURI = baseURI;
    }

    /// @notice Set Merkle Tree Root Hashes array
    /// @dev Called by admin to update roots for different address batches by templateId
    /// @param _roots Root hashes of the Merkle Trees by templateId
    function setRootHashes(bytes32[] calldata _roots) external whenNotPaused {
        if (!hasRole(ADMIN_ROLE, _msgSender())) revert OnlyAdmin();
        roots = _roots;
    }

    /// @dev Templates

    /// @notice Create a new template
    /// @dev Access restricted to only Templaters
    /// @param name The name of the new template
    /// @param description A description of the new template
    /// @param image A filename of the new template
    function createTemplate(
        string calldata name,
        string calldata description,
        string calldata image
    ) external whenNotPaused {
        if (!hasRole(TEMPLATER_ROLE, _msgSender())) revert OnlyTemplater();

        uint256 id = templateIds++;

        templates[id].name = name;
        templates[id].description = description;
        templates[id].image = image;

        emit NewTemplate(id, name, description, image);
    }

    /// @notice Update a template
    /// @dev Access restricted to only Templaters
    /// @param templateId Template Id
    /// @param name The name of the template
    /// @param description The description of the template
    /// @param image The filename of the template
    function updateTemplate(
        uint256 templateId,
        string calldata name,
        string calldata description,
        string calldata image
    ) external whenNotPaused {
        if (!hasRole(TEMPLATER_ROLE, _msgSender())) revert OnlyTemplater();
        if (templateIds <= templateId) revert InvalidTemplateId();
        templates[templateId].name = name;
        templates[templateId].description = description;
        templates[templateId].image = image;
        emit TemplateUpdated(templateId, name, description, image);
    }

    /// @dev Badges

    /// @notice Activate Badge by redeemers
    /// @dev Verify if the caller is a redeemer
    /// @param proof Merkle Proof
    /// @param templateId Template Id
    /// @param tokenURI  Token URI
    /// @return True If the new Badge is Activated
    function activateBadge(
        bytes32[] calldata proof,
        uint256 templateId,
        string calldata tokenURI
    ) external whenNotPaused returns (bool) {
        if (templateIds <= templateId) revert InvalidTemplateId();
        if (!proof.verify(roots[templateId], keccak256(abi.encodePacked(_msgSender())))) revert OnlyRedeemer();

        uint256 _tokenId = _getTokenId(_msgSender(), templateId);

        /// @dev Increase the quantities
        templateQuantities[templateId] += 1;

        if (!_mintWithTokenURI(_msgSender(), _tokenId, tokenURI)) revert AlreadyClaimed();

        emit BadgeActivated(_tokenId, templateId);
        return true;
    }

    /// @notice Getter function for redeemer associated with the tokenId
    /// @dev Check if the tokenId exists
    /// @param tokenId Token Id of the Badge
    /// @return redeemer Redeemer address associated with the tokenId
    function getBadgeRedeemer(uint256 tokenId) external view returns (address redeemer) {
        if (!_exists(tokenId)) revert InvalidTokenId();
        (redeemer, ) = _unpackTokenId(tokenId);
    }

    /// @notice Getter function for templateId associated with the tokenId
    /// @dev Check if the tokenId exists
    /// @param tokenId Token Id of the Badge
    /// @return templateId Template Id associated with the tokenId
    function getBadgeTemplate(uint256 tokenId) external view returns (uint256 templateId) {
        if (!_exists(tokenId)) revert InvalidTokenId();
        (, templateId) = _unpackTokenId(tokenId);
    }

    /// @notice Getter function for tokenId associated with redeemer and templateId
    /// @dev Check if the templateId exists
    /// @dev Check if the tokenId exists
    /// @param redeemer Redeemer address
    /// @param templateId Template Id
    /// @return tokenId Token Id associated with the redeemer and templateId
    function getTokenId(address redeemer, uint256 templateId) external view returns (uint256 tokenId) {
        if (templateIds <= templateId) revert InvalidTemplateId();
        tokenId = _getTokenId(redeemer, templateId);
        if (!_exists(tokenId)) revert InvalidTokenId();
    }

    /// @notice ERC721 _transfer() Disabled
    /// @dev _transfer() has been overriden
    /// @dev reverts on transferFrom() and safeTransferFrom()
    function _transfer(
        address,
        address,
        uint256
    ) internal pure override {
        revert TransferDisabled();
    }

    /// @notice Generate tokenId
    /// @dev Augur twist by concatenate redeemer and templateId
    /// @param redeemer Redeemer Address
    /// @param templateId Template Id
    /// @param _tokenId Token Id
    function _getTokenId(address redeemer, uint256 templateId) private pure returns (uint256 _tokenId) {
        bytes memory _tokenIdBytes = abi.encodePacked(redeemer, toUint96(templateId));
        assembly {
            _tokenId := mload(add(_tokenIdBytes, add(0x20, 0)))
        }
    }

    /// @notice Unpack tokenId
    /// @param tokenId Token Id of the Badge
    /// @return redeemer Redeemer Address
    /// @return templateId Template Id
    function _unpackTokenId(uint256 tokenId) private pure returns (address redeemer, uint256 templateId) {
        assembly {
            redeemer := shr(96, and(tokenId, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000))
            templateId := and(tokenId, 0x0000000000000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF)
        }
    }

    /// @notice Mint new token with tokenURI
    /// @dev Automatically concatenate baseURI with tokenURI via abi.encodePacked
    /// @param to Owner of the new token
    /// @param tokenId Token Id of the Baddge
    /// @param tokenURI Token URI of the Badge
    /// @return True if the new token is minted
    function _mintWithTokenURI(
        address to,
        uint256 tokenId,
        string calldata tokenURI
    ) private returns (bool) {
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return true;
    }

    /// @notice Getter function for baseTokenURI
    /// @dev Override _baseURI()
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    /// @notice IERC165 supportsInterface
    /// @dev supportsInterface has been override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _msgSender() internal view override(Context, BadgeRoles) returns (address sender) {
        return super._msgSender();
    }

    function _msgData() internal view override(Context, BadgeRoles) returns (bytes calldata) {
        return super._msgData();
    }
}
