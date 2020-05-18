/// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.8;

/// @title Non-transferable Badges for Maker Ecosystem Activity, issue #537
/// @author Nazzareno Massari, Scott Herren
/// @notice BadgeFactory to manage Templates and activate Non-transferable Badges for redeemers
/// @dev see https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effecs through TDD approach
/// @dev OpenZeppelin library is used for secure contract development

import "./BadgeRoles.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";


interface InsigniaDAO {

    function verify(address guy) external view returns (bool);
    function roots(uint256 templateId) external view returns (bytes32);

}

contract BadgeFactory is BadgeRoles, ERC721Burnable {

  /// Libraries
  using SafeMath for uint256;
  using Counters for Counters.Counter;
  using MerkleProof for bytes32[];

  Counters.Counter private _tokenIdTracker;

  InsigniaDAO internal insignia;

  /// Events
  event NewTemplate(uint256 templateId, string name, string description, string image);
  event BadgeActivated(address redeemer, uint256 tokenId, uint256 templateId, string tokenURI);

  struct BadgeTemplate {
    string name;
    string description;
    string image;
    address owner;
  }

  BadgeTemplate[] private templates;

  /// Supplies of each badge template
  mapping(uint256 => uint256) private _templateQuantities;
  mapping(uint256 => uint256) private _tokenTemplates;

  constructor(address insignia_)
    ERC721("InsigniaBadges", "BADGES")
    public
  {
    _setBaseURI("https://badges.makerdao.com/token/");
    insignia = InsigniaDAO(insignia_);

  }

  /// @notice Fallback function
  /// @dev Added not payable to revert transactions not matching any other function which send value
  fallback() external {
    revert();
  }

  /// @notice OpenGSN _msgSender()
  /// @dev override _msgSender() in OZ Context.sol and BadgeRoles.sol
  /// @return msg.sender after relay call
  function _msgSender() internal override(Context, BadgeRoles) view returns (address payable) {
            return BaseRelayRecipient._msgSender();
  }

  /// @notice Set the baseURI
  /// @dev Update the baseURI specified in the constructor
  /// @param baseURI New baseURI
  /// @return True if the new baseURI is set
  function setBaseURI(string memory baseURI) public onlyOwner returns (bool) {
    _setBaseURI(baseURI);
    return true;
  }

  /// @notice Mint new token with tokenURI
  /// @dev Use an auto-generated tokenId
  /// @dev automatically concatenate baseURI with tokenURI via abi.encodePacked
  /// @param to owner of the new token
  /// @param tokenURI an <ipfs-hash>.json filename
  /// @return True if the new token is minted
  function _mintWithTokenURI(address to, string memory tokenURI) internal returns (bool) {
    _mint(to, _tokenIdTracker.current());
    _setTokenURI(_tokenIdTracker.current(), tokenURI);
    _tokenIdTracker.increment();
    return true;
  }

  /// @notice Getter function for templates
  /// @dev Check if templateId exists
  /// @param templateId Template Id of the template to return
  /// @return name description image Of the specified templateId
  function getTemplate(uint256 templateId) public view whenNotPaused returns (string memory name, string memory description, string memory image) {
    require(templates.length > templateId, "No template with that id");
    BadgeTemplate memory template = templates[templateId];
    return (template.name, template.description, template.image);
  }


  /// Templates

  /// @notice Getter function for templates count
  /// @dev Return lenght of template array
  /// @return count The current number of templates
  function getTemplatesCount() public view whenNotPaused returns (uint256 count) {
    return templates.length;
  }

  /// @notice Create a new template
  /// @dev Access restricted to only Templaters
  /// @param name The name of the new template
  /// @param description A description of the new template
  /// @param image A filename of the new template
  /// @return _templateId The template Id
  function createTemplate(string memory name, string memory description, string memory image) public onlyTemplater whenNotPaused returns (uint256 _templateId) {

    BadgeTemplate memory _newTemplate = BadgeTemplate({
       name: name,
       owner: _msgSender(),
       description: description,
       image: image
    });
    templates.push(_newTemplate);
    _templateId = templates.length.sub(1);
    emit NewTemplate(_templateId, name, description, image);
    return _templateId;
  }

  // Badges

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
  function getBadgeTemplateQuantity(uint256 templateId) public view whenNotPaused returns (uint256) {
    require(templates.length > templateId, "No template with that id");
    return _templateQuantities[templateId];
  }

  /// @notice Activate Badge by redeemers
  /// @dev Verify if the caller is a redeemer
  /// @param proof Merkle Proof
  /// @param templateId Template Id
  /// @param tokenURI Token URI
  /// @return _tokenId Token Id of the new Badge
  function activateBadge(bytes32[] memory proof, uint256 templateId, string memory tokenURI) public whenNotPaused returns (uint256 _tokenId) {
    require(templates.length > templateId, "No template with that id");
    require(insignia.verify(_msgSender()) || proof.verify(insignia.roots(templateId), keccak256(abi.encodePacked(_msgSender()))), "Caller is not a redeemer");

    _mintWithTokenURI(_msgSender(), tokenURI);

    // Increase the quantities
    _tokenTemplates[_tokenId] = templateId;
    _templateQuantities[templateId] = _templateQuantities[templateId].add(1);
    emit BadgeActivated(_msgSender(),_tokenId, templateId, tokenURI);
    return _tokenId;
  }

  /// @notice Burn Badge
  /// @dev burn() Check if the caller is approved or owner of the Badge
  /// @param tokenId Token Id of the Badge to burn
  /// @return True if the Badge has been burned
  function burnBadge(uint256 tokenId) public whenNotPaused returns (bool){
    uint256 templateId = getBadgeTemplate(tokenId);
    burn(tokenId);
    _templateQuantities[templateId] = _templateQuantities[templateId].sub(1);
    return true;
  }

  /// @notice ERC721 _transfer() Disabled
  /// @dev _transfer() has been overriden
  /// @dev reverts on transferFrom() and safeTransferFrom()
  function _transfer(address from, address to, uint256 tokenId) internal override {
    require(!true, "ERC721: token transfer disabled");
    super._transfer(from, to, tokenId);
  }

}
