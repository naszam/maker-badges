// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.6.12;

import "../BadgeRoles.sol";

contract CryticInterface{
    address internal crytic_owner = address(0x41414141);
    address internal crytic_user = address(0x42424242);
    address internal crytic_attacker = address(0x43434343);
}

contract CryticTestBadgeRoles is CryticInterface, BadgeRoles {

    constructor ()
        BadgeRoles(0x0842Ad6B8cb64364761C7c170D0002CC56b1c498)
        public
    {

    }

    function crytic_default_admin_constant() public view returns(bool){
        return hasRole(DEFAULT_ADMIN_ROLE, crytic_owner);
    }

}
