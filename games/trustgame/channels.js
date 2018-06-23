/**
 * # Channels definition file for Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Defines two channels, one to test the requirements,
 * and one to actually play an Ultimatum game.
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = [

    // Game channel.
    {
        name: 'trustgame',

        admin: 'trustgame/admin',

        player: 'trustgame',

        verbosity: 100,

        // If TRUE, players can invoke GET commands on admins.
        getFromAdmins: true,

        // Unauthorized clients will be redirected here.
        // (defaults: "/pages/accessdenied.htm")
        accessDeniedUrl: '/trustgame/unauth.htm',

        // Channel Waiting Room configuration.
        waitingRoom: {
            // Relative path from server/ directory.
            logicPath:  'game.room.js',
            name:       'waitRoom'
        }
    }

    ,

    // Requirements channel.
    {
        name: 'requirements',

        admin: 'requirements/admin',

        player: 'requirements',

        verbosity: 100,

        getFromAdmins: true,

        waitingRoom: {
            logicPath: 'requirements.room.js',
            name: 'requirementsWR'
        }
    }

];
