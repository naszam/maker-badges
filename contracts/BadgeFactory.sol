/// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.12;

/// @title Non-transferable Badges for Maker Ecosystem Activity, CDIP 18
/// @author Nazzareno Massari @naszam
/// @notice BadgeFactory to manage Templates and activate Non-transferable Badges by redeemers
/// @dev See https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effects through TDD approach
/// @dev OpenZeppelin library is used for secure contract development

import "./BadgeRoles.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";


interface MakerBadgesLike {
    function verify(uint256 templateId, address guy) external view returns (bool);
    function roots(uint256 templateId) external view returns (bytes32);
}


contract BadgeFactory is BadgeRoles, ERC721 {

    /// @dev Libraries
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    using MerkleProof for bytes32[];

    MakerBadgesLike internal immutable maker;

    Counters.Counter private _tokenIdTracker;

    struct BadgeTemplate {
        string name;
        string description;
        string image;
        address owner;
    }

    BadgeTemplate[] private templates;

    /// @dev Supplies of each badge template
    mapping(uint256 => uint256) private _templateQuantities;
    mapping(uint256 => uint256) private _tokenTemplates;

    mapping(uint256 => mapping (address => uint256)) public redeemed;

    /// @dev Events
    event NewTemplate(uint256 templateId, string name, string description, string image);
    event BadgeActivated(address redeemer, uint256 templateId, string tokenURI);

    constructor(address forwarder_, address maker_)
        public
        ERC721("MakerBadges", "MAKER")
        BadgeRoles(forwarder_)
    {
        _setBaseURI("https://badges.makerdao.com/token/");
        maker = MakerBadgesLike(maker_);
    }

    /// @notice Fallback function
    /// @dev Added not payable to revert transactions not matching any other function which send value
    fallback() external {
        revert();
    }

    /// @notice Set the baseURI
    /// @dev Update the baseURI specified in the constructor
    /// @param baseURI New baseURI
    /// @return True if the new baseURI is set
    function setBaseURI(string calldata baseURI) external onlyOwner returns (bool) {
        _setBaseURI(baseURI);
        return true;
    }

    /// @dev Templates

    /// @notice Create a new template
    /// @dev Access restricted to only Templaters
    /// @param name The name of the new template
    /// @param description A description of the new template
    /// @param image A filename of the new template
    /// @return True If the new Template is Created
    function createTemplate(string calldata name, string calldata description, string calldata image)
        external
        onlyTemplater
        whenNotPaused
        returns (bool)
   {
        BadgeTemplate memory _newTemplate = BadgeTemplate({
            name: name,
            owner: msg.sender,
            description: description,
            image: image
        });
        templates.push(_newTemplate);
        uint256 _templateId = templates.length.sub(1);
        emit NewTemplate(_templateId, name, description, image);
        return true;
    }

    /// @notice Getter function for templates
    /// @dev Check if templateId exists
    /// @param templateId Template Id of the template to return
    /// @return name description image Of the specified templateId
    function getTemplate(uint256 templateId)
        external
        view
        whenNotPaused
        returns (string memory name, string memory description, string memory image)
    {
        require(templates.length > templateId, "No template with that id");
        BadgeTemplate memory template = templates[templateId];
        return (template.name, template.description, template.image);
    }

    /// @notice Getter function for templates count
    /// @dev Return lenght of template array
    /// @return count The current number of templates
    function getTemplatesCount() external view whenNotPaused returns (uint256 count) {
        return templates.length;
    }

    /// @dev Badges

    /// @notice Activate Badge by redeemers
    /// @dev Verify if the caller is a redeemer
    /// @param proof Merkle Proof
    /// @param templateId Template Id
    /// @param tokenURI Token URI
    /// @return True If the new Badge is Activated
    function activateBadge(bytes32[] calldata proof, uint256 templateId, string calldata tokenURI)
        external
        whenNotPaused
        returns (bool)
    {
        require(templates.length > templateId, "No template with that id");
        require(redeemed[templateId][msg.sender] == 0, "Badge already activated!");
        require(
            maker.verify(templateId, msg.sender) || proof.verify(maker.roots(templateId), keccak256(abi.encodePacked(msg.sender))),
            "Caller is not a redeemer"
        );

        /// @dev Increase the quantities
        _tokenTemplates[_tokenIdTracker.current()] = templateId;
        _templateQuantities[templateId] = _templateQuantities[templateId].add(1);
        redeemed[templateId][msg.sender] = 1;

        require(_mintWithTokenURI(msg.sender, tokenURI), "ERC721: Token not minted");

        emit BadgeActivated(msg.sender, templateId, tokenURI);
        return true;
    }

    /// @notice Getter function for templateId associated with the tokenId
    /// @dev Check if the tokenId exists
    /// @param tokenId Token Id of the Badge
    /// @return Template Id associated with the tokenId
    function getBadgeTemplate(uint256 tokenId) public view whenNotPaused returns (uint256) {
        require(_exists(tokenId), "ERC721: No token with that id");
        return _tokenTemplates[tokenId];
    }

    /// @notice Getter function for number of badges associated with templateId
    /// @dev Check if the template Id exists
    /// @param templateId Template Id
    /// @return Quantity of Badges associated with templateId
    function getBadgeTemplateQuantity(uint256 templateId) external view whenNotPaused returns (uint256) {
        require(templates.length > templateId, "No template with that id");
        return _templateQuantities[templateId];
    }

    /// @notice OpenGSN _msgSender()
    /// @dev override _msgSender() in OZ Context.sol and BaseRelayRecipient.sol
    /// @return _msgSender() after relay call
    function _msgSender() internal view override(Context, BadgeRoles) returns (address payable) {
          return BaseRelayRecipient._msgSender();
    }

    /// @notice ERC721 _transfer() Disabled
    /// @dev _transfer() has been overriden
    /// @dev reverts on transferFrom() and safeTransferFrom()
    function _transfer(address from, address to, uint256 tokenId) internal override {
        require(false, "ERC721: token transfer disabled");
        super._transfer(from, to, tokenId);
    }

    /// @notice Mint new token with tokenURI
    /// @dev Use an auto-generated tokenId
    /// @dev automatically concatenate baseURI with tokenURI via abi.encodePacked
    /// @param to owner of the new token
    /// @param tokenURI an <ipfs-hash>.json filename
    /// @return True if the new token is minted
    function _mintWithTokenURI(address to, string calldata tokenURI) private returns (bool) {
        _mint(to, _tokenIdTracker.current());
        _setTokenURI(_tokenIdTracker.current(), tokenURI);
        _tokenIdTracker.increment();
        return true;
    }
}
