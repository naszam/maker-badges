/// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.0;
pragma experimental ABIEncoderV2;


/// @title Non-transferable Badges for Maker Ecosystem Activity, CDIP 18
/// @author Nazzareno Massari @naszam
/// @notice MakerBadges to check for activities on maker ecosystem and keep track of redeemers
/// @dev See https://github.com/makerdao/community/issues/537
/// @dev All function calls are currently implemented without side effects through TDD approach
/// @dev OpenZeppelin library is used for secure contract development

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";

interface ChaiLike {
    function dai(address usr) external returns (uint256);
}

interface DSChiefLike {
    function votes(address) external view returns (bytes32);
}


interface FlipperLike {
    struct Bid {
        uint256 bid;
        uint256 lot;
        address guy;
        uint48  tic;
        uint48  end;
        address usr;
        address gal;
        uint256 tab;
    }

    function bids(uint256) external view returns (Bid memory);
}


contract MakerBadges is Ownable, AccessControl, Pausable {

    /// @dev Libraries
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @dev Data
    ChaiLike  internal immutable chai;
    DSChiefLike internal immutable chief;
    FlipperLike internal immutable flipper;

    /// @dev Math
    uint256 constant RAY = 10 ** 27;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    bytes32[] public roots;

    mapping(uint256 => EnumerableSet.AddressSet) private redeemers;

    /// @dev Events
    event ChaiChecked(address usr);
    event DSChiefChecked(address guy);
    event FlipperChecked(address guy);

    constructor(address chai_, address chief_, address flipper_) {
        _setupRole(DEFAULT_ADMIN_ROLE, owner());

        _setupRole(ADMIN_ROLE, owner());
        _setupRole(PAUSER_ROLE, owner());

        /// @dev CHAI Address
        chai = ChaiLike(chai_);

        /// @dev MCD_ADM Address
        chief = DSChiefLike(chief_);

        /// @dev MCD_FLIP_ETH_A Address
        flipper = FlipperLike(flipper_);
    }

    /// @notice Fallback function
    /// @dev Added not payable to revert transactions not matching any other function which send value
    fallback() external {
        revert();
    }

    /// @dev Modifiers
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }


    /// @notice Set Merkle Tree Root Hashes array
    /// @dev Called by owner to update roots for different address batches by templateId
    /// @param rootHashes Root hashes of the Merkle Trees by templateId
    /// @return True if successfully updated
    function setRootHashes(bytes32[] calldata rootHashes) external onlyAdmin whenNotPaused returns (bool) {
        roots = rootHashes;
        return true;
    }

    /// @notice Chai Challenge
    /// @dev Keeps track of the address of the caller if successful
    /// @return True if the caller successfully checked for activity on Chai
    function chaiChallenge(uint256 templateId) external whenNotPaused returns (bool) {
        require(chai.dai(msg.sender) >= 1 ether, "Caller has not accrued 1 or more Dai interest on Pot");
        if (!redeemers[templateId].contains(msg.sender)) {
            require(redeemers[templateId].add(msg.sender));
        }
        emit ChaiChecked(msg.sender);
        return true;
    }


    /// @notice DSChief Challenge
    /// @dev Keeps track of the address of the caller if successful
    /// @return True if the caller successfully checked for activity on DSChief
    function chiefChallenge(uint256 templateId) external whenNotPaused returns (bool) {
        require(chief.votes(msg.sender) != 0x00, "Caller is not voting in an Executive Spell");
        if (!redeemers[templateId].contains(msg.sender)) {
            require(redeemers[templateId].add(msg.sender));
        }
        emit DSChiefChecked(msg.sender);
        return true;
    }

    /// @notice Flipper Challenge
    /// @dev Keeps track of the address of the caller if successful
    /// @dev guy, high bidder
    /// @return True if the caller successfully checked for activity on Flipper
    function flipperChallenge(uint256 templateId, uint256 bidId) external whenNotPaused returns (bool) {
        require(
            flipper.bids(bidId).guy == msg.sender,
            "Caller is not the high bidder in the current Bid in ETH Collateral Auctions"
        );
        if (!redeemers[templateId].contains(msg.sender)) {
            require(redeemers[templateId].add(msg.sender));
        }
        emit FlipperChecked(msg.sender);
        return true;
    }

    /// @notice Check if guy is a redeemer
    /// @dev Verify if the address of guy exists
    /// @param guy Address to verify
    /// @return True if guy is a redeemer
    function verify(uint256 templateId, address guy) external view whenNotPaused returns (bool) {
        return redeemers[templateId].contains(guy);
    }

    /// @notice Add a new Admin
    /// @dev Access restricted only for Default Admin
    /// @param account Address of the new Admin
    /// @return True if the account address is added as Admin
    function addAdmin(address account) external returns (bool) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not the default admin");
        require(!hasRole(ADMIN_ROLE, account), "Account is already an admin");
        grantRole(ADMIN_ROLE, account);
        return true;
    }

    /// @notice Remove an Admin
    /// @dev Access restricted only for Default Admin
    /// @param account Address of the Admin
    /// @return True if the account address is removed as Admin
    function removeAdmin(address account) external returns (bool) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not the default admin");
        require(hasRole(ADMIN_ROLE, account), "Account is not an admin");
        revokeRole(ADMIN_ROLE, account);
        return true;
    }

    /// @notice Pause all the functions
    /// @dev the caller must have the 'PAUSER_ROLE'
    function pause() external {
        require(hasRole(PAUSER_ROLE, msg.sender), "MakerBadges: must have pauser role to pause");
        _pause();
    }

    /// @notice Unpause all the functions
    /// @dev The caller must have the 'PAUSER_ROLE'
    function unpause() external {
        require(hasRole(PAUSER_ROLE, msg.sender), "MakerBadges: must have pauser role to unpause");
        _unpause();
    }
}
