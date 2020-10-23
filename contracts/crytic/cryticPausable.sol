// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.6.12;

import "../BadgeRoles.sol";

contract CryticInterface{
    address internal crytic_owner = address(0x41414141);
    address internal crytic_user = address(0x42424242);
    address internal crytic_attacker = address(0x43434343);
}

contract CryticTestBadgeRoles is CryticInterface, BadgeRoles {

    constructor() public {
        _setupRole(PAUSER_ROLE, crytic_owner);
        pause();
    }

    function crytic_no_transfer() public view returns(bool){
        return paused() == true;
    }

}
