/// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;


/// @title Non-transferable Badges for Maker Ecosystem Activity, CDIP 18, 29
/// @author Nazzareno Massari @naszam
/// @notice MakerBadges to check on-chain for activities on maker ecosystem and keep track of redeemers
/// @dev See https://github.com/makerdao/community/issues/537
/// @dev See https://github.com/makerdao/community/issues/721
/// @dev All function calls are currently implemented without side effects through TDD approach
/// @dev OpenZeppelin Library is used for secure contract development

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

interface VoteProxyLike {
    function cold() external view returns (address);
    function hot() external view returns (address);
}

contract MakerBadges is AccessControl, Pausable {

    /// @dev Libraries
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @dev Data
    ChaiLike  internal immutable chai;
    DSChiefLike internal immutable chief;
    FlipperLike internal immutable flipper;
    VoteProxyLike internal proxy;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    bytes32[] public roots;

    mapping(uint256 => EnumerableSet.AddressSet) private redeemers;

    /// @dev Events
    event ChaiChecked(address usr);
    event DSChiefChecked(address guy);
    event RobotChecked(address guy);
    event FlipperChecked(address guy);

    constructor(address chai_, address chief_, address flipper_) public {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);

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

    /// @notice Set Merkle Tree Root Hashes array
    /// @dev Called by owner to update roots for different address batches by templateId
    /// @param _roots Root hashes of the Merkle Trees by templateId
    /// @return True if successfully updated
    function setRootHashes(bytes32[] calldata _roots) external whenNotPaused returns (bool) {
        require(hasRole(ADMIN_ROLE, msg.sender), "MakerBadges: caller is not an admin");
        roots = _roots;
        return true;
    }

    /// @notice Chai Challenge
    /// @dev Keeps track of the address of the caller if successful
    /// @return True if the caller successfully checked for activity on Chai
    function chaiChallenge(uint256 templateId) external whenNotPaused returns (bool) {
        require(chai.dai(msg.sender) >= 1 ether, "MakerBadges: caller has not accrued 1 or more dai interest on pot");
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
        require(chief.votes(msg.sender) != 0x00,"MakerBadges: caller is not voting in an executive spell");
        if (!redeemers[templateId].contains(msg.sender)) {
            require(redeemers[templateId].add(msg.sender));
        }
        emit DSChiefChecked(msg.sender);
        return true;
    }

    /// @notice Robot Challenge
    /// @dev Keeps track of the address of the caller if successful
    /// @return True if the caller successfully checked for activity via vote proxy on DSChief
    function robotChallenge(uint256 templateId, address _proxy) external whenNotPaused returns (bool) {
        proxy = VoteProxyLike(_proxy);
        require(
            chief.votes(_proxy)!= 0x00 && (proxy.cold() == msg.sender || proxy.hot() == msg.sender),
            "MakerBadges: caller is not voting via proxy in an executive spell"
        );
        if (!redeemers[templateId].contains(msg.sender)) {
            require(redeemers[templateId].add(msg.sender));
        }
        emit RobotChecked(msg.sender);
        return true;
    }


    /// @notice Flipper Challenge
    /// @dev Keeps track of the address of the caller if successful
    /// @dev guy, high bidder
    /// @return True if the caller successfully checked for activity on Flipper
    function flipperChallenge(uint256 templateId, uint256 bidId) external whenNotPaused returns (bool) {
        require(
            flipper.bids(bidId).guy == msg.sender,
            "MakerBadges: caller is not the high bidder in the current bid in ETH collateral auctions"
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
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "MakerBadges: caller is not the default admin");
        require(!hasRole(ADMIN_ROLE, account), "MakerBadges: account is already an admin");
        grantRole(ADMIN_ROLE, account);
        return true;
    }

    /// @notice Remove an Admin
    /// @dev Access restricted only for Default Admin
    /// @param account Address of the Admin
    /// @return True if the account address is removed as Admin
    function removeAdmin(address account) external returns (bool) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "MakerBadges: caller is not the default admin");
        require(hasRole(ADMIN_ROLE, account), "MakerBadges: account is not an admin");
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
