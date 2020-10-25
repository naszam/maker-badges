// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.6.12;

import "../BadgeRoles.sol";

contract CryticInterface{
    address constant internal crytic_owner = address(0x41414141);
    //address constant internal crytic_user = address(0x42424242);
    //address constant internal crytic_attacker = address(0x43434343);
}

contract CryticTestBadgeRoles is CryticInterface, BadgeRoles {

    constructor ()
        public
    {
      _setupRole(DEFAULT_ADMIN_ROLE, crytic_owner);
    }

    function crytic_default_admin_constant() public view returns(bool){
        return hasRole(DEFAULT_ADMIN_ROLE, crytic_owner);
    }

    function crytic_templater_constant() public view returns(bool){
        return hasRole(TEMPLATER_ROLE, crytic_owner);
    }

    function crytic_pauser_constant() public view returns(bool){
        return hasRole(PAUSER_ROLE, crytic_owner);
    }

}
