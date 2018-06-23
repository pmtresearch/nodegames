/**
 * # Index script for nodeGame
 * Copyright(c) 2016 brenste <myemail>
 * MIT Licensed
 *
 * http://nodegame.org
 * ---
 */
window.onload = function() {
    var node = parent.node;
    // All these properties will be overwritten
    // by remoteSetup from server.
    node.setup('nodegame', {
        verbosity: 100,
        debug : true,
        window : {
            promptOnleave : false
        },
        env : {
            auto : false,
            debug : false
        },
        events : {
            dumpEvents : true
        },
        socket : {
            type : 'SocketIo',
            reconnection : false
        }
    });
    // Connect to channel.
    node.connect();
};
