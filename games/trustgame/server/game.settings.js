/**
 * # Game settings: Trust Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    // Files
    gamePaths: {
        logic: "game.logic.js",
        player: "game.client.js",
    },

    // Group settings.

    // How many players have to connect before a random subset is drawn.
    POOL_SIZE: 2,
    // How many players in each group ( must be <= POOL_SIZE).
    GROUP_SIZE: 2,
    // Minimum number of players that must be always connected.
    MIN_PLAYERS: 2,

    // Session Counter start from.
    SESSION_ID: 100,

    // Game settings.

    // Which treatment to play.
    // Leave undefined for a randomly chosen treatment.
    CHOSEN_TREATMENT: 'pp',

    // Number or rounds to repeat the bidding. *
    REPEAT: 2,

    // Number of coins to split. *
    COINS: 100,

    // Number of milliseconds until the round times out
    TIMEOUT: 30000,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 2000,

    // DEBUG.
    DEBUG: true,

    // AUTO-PLAY.
    AUTO: false,

    // AUTHORIZATION.
    AUTH: 'NO', // MTURK, LOCAL, NO.

    // Available treatments:
    // (there is also the "default" treatment, using the options above)
    treatments: {
        pp: {
            name: "pp",
            fullName: "Peer Pressure",
            description: "Introduces peer pressure to players to not disconnect."
        }
    }

    // * =  If you change this, you need to update the instructions and quiz
};
