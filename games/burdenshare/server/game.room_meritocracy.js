/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel) {

    var path = require('path');
    
///////////////////////////// MTurk Version ///////////////////////////
    // Reads in descil-mturk configuration.
    var confPath = path.resolve(__dirname, 'descil.conf.js');
    
    // Load the code database.
    var dk = require('descil-mturk')(confPath);
//    dk.getCodes(function() {
//        if (!dk.codes.size()) {
//            throw new Error('game.room: no codes found.');
//        }
//    });
    dk.readCodes(function() {
        if (!dk.codes.size()) {
            throw new Errors('requirements.room: no codes found.');
        }
    });
///////////////////////////// MTurk Version ///////////////////////////

    
	var Database = require('nodegame-db').Database;
	var ngdb = new Database(node);
	var mdb = ngdb.getLayer('MongoDB');

	var stager = new node.Stager();
	var logicPath = __dirname + '/includes/game.logic';

	var ngc = require('nodegame-client');

	// second parameter makes available to the required file its properties
	var client = channel.require(__dirname + '/includes/game.client', {
		ngc: ngc
	});

	var clientWait = channel.require(__dirname + '/includes/wait.client', {
		ngc: ngc
	});

	stager.addStage({
		id: 'waiting',
		cb: function() {
			// Returning true in a stage callback means execution ok.
			return true;
		}
	});
	
/////////////////////////////// MTurk Version ///////////////////////////
    // Creating an authorization function for the players.
    // This is executed before the client the PCONNECT listener.
    // Here direct messages to the client can be sent only using
    // his socketId property, since no clientId has been created yet.
    channel.player.authorization(function(header, cookies, room) {
        var code, player, token;
        playerId = cookies.player;
        token = cookies.token;

        console.log('game.room: checking auth.');
        
        // Weird thing.
        if ('string' !== typeof playerId) {
            console.log('no player: ', player)
            return false;
        }

        // Weird thing.
        if ('string' !== typeof token) {
            console.log('no token: ', token)
            return false;
        }
        
        code = dk.codeExists(token);
        
        // Code not existing.
	if (!code) {
            console.log('not existing token: ', token);
            return false;
        }
        
        // Code in use.
	if (code.usage) {
            if (code.disconnected) {
                return true;
            }
            else {
                console.log('token already in use: ', token);
                return false;
            }
	}

        // Mark the code as in use.
        dk.incrementUsage(token);

        // Client Authorized
        return true;
    });

    // Assigns Player Ids based on cookie token.
    channel.player.clientIdGenerator(function(headers, cookies, validCookie, 
                                              ids, info) {
        
        // Return the id only if token was validated.
        // More checks could be done here to ensure that token is unique in ids.
        if (cookies.token && validCookie) {
            return cookies.token;
        }
    });
/////////////////////////////// MTurk Version ///////////////////////////
    

//	stager.addStage(waitingStage);

	stager.setOnInit(function() {
		this.channel = channel;
		var counter = 0;
		console.log('********Waiting Room Created*****************');

        function connectingPlayer(p) {
			var room, wRoom;
			var NPLAYERS = 4;
			console.log('-----------Player connected ' + p.id);
			wRoom = channel.waitingRoom.clients.player;
			
			if (wRoom.size() < NPLAYERS) return;

			console.log('-----------We have four players');

			var tmpPlayerList = wRoom.shuffle().limit(NPLAYERS);

			room = channel.createGameRoom({
				group: 'burden',
				clients: tmpPlayerList,
				channel: channel,
				logicPath: logicPath
			});
			
			// Setting metadata, settings, and plot
			tmpPlayerList.each(function (p) {
				node.remoteSetup('game_metadata',  p.id, client.metadata);
				node.remoteSetup('game_settings', p.id, client.settings);
				node.remoteSetup('plot', p.id, client.plot);
				node.remoteSetup('env', p.id, client.env);
				node.remoteSetup('verbosity', p.id, 0);

				node.remoteCommand('start', p.id);
			});
//			console.log(room.clients.player.id.getAllKeys());
//			console.log(room.clients.player.id.getAllKeys()[0]);
//			console.log(room.clients.player.id.getAllKeys()[1]);

			room.startGame();

			// Send room number to admin
			channel.admin.socket.send2roomAdmins(node.msg.create({
				target: node.constants.target.TXT,
				text: 'ROOMNO',
				data: {
					roomNo: counter,
					pids: room.clients.player.id.getAllKeys(),
					aids: room.clients.admin.id.getAllKeys()
				}
			}), room);
			counter ++;
			
        }
		
///////////////////////////// mongoDB ///////////////////////////
//		// 1. Setting up database connection.
////		var Database = require('nodegame-db').Database;
////		var ngdb = new Database(node);
//
//		// Open the collection where the categories will be stored.
//		var mdbWrite = ngdb.getLayer('MongoDB', {
//			dbName: 'burden_sharing_control',
//			collectionName: 'player_id'
//		});
//
//		// Opening the database for writing the resultdata.
//		mdbWrite.connect(function(){});
//		
//		node.on('player_id', function(msg){
////		node.on.data('player_id',function(msg) {
//			console.log(msg.data);
//			console.log('Writing Player ID!!!');
//			mdbWrite.store(msg.data);
//		});
///////////////////////////// mongoDB ///////////////////////////
		
		
		
        // This callback is executed whenever a previously disconnected
        // players reconnects.
        node.on.preconnect(function(p) {
            console.log('Oh...somebody reconnected in the waiting room!', p);
            // Notify other player he is back.
            // TODO: add it automatically if we return TRUE? It must be done
            // both in the alias and the real event handler
            // TODO: Cannot use to: ALL, because this includes the reconnecting
            // player.
            node.game.pl.each(function(p) {
                node.socket.send(node.msg.create({
                    target: 'PCONNECT',
                    data: p,
                    to: p.id
                }));
            });
            node.game.pl.add(p);
            connectingPlayer(p);
        });
        
        // This must be done manually for now (maybe will change in the future).
        node.on.mreconnect(function(p) {
            node.game.ml.add(p);
        });

        // This callback is executed when a player connects to the channel.
        node.on.pconnect(connectingPlayer);
		

            // STE: this is overwrite the above listener: one of the two is useless.
		node.on.pconnect(function(p) {
			var room, wRoom;
			var NPLAYERS = 4;
			console.log('-----------Player connected ' + p.id);
			wRoom = channel.waitingRoom.clients.player;


			// Send the client the waiting stage.
			// Send the client the waiting stage.
//			node.remoteSetup('game_metadata',  p.id, clientWait.metadata);
//			node.remoteSetup('plot', p.id, clientWait.plot);
//			node.remoteCommand('start', p.id);
//			node.socket.send(node.msg.create({
//			to: 'ALL',
//			text: 'waitingRoom',
//			data: {
//			poolSize: NPLAYERS,
//			nPlayers: wRoom.size()
//			}
//			}));
//			console.log(wRoom);


			if (wRoom.size() < NPLAYERS) return;

			console.log('-----------We have four players');

			var tmpPlayerList = wRoom.shuffle().limit(NPLAYERS);

			room = channel.createGameRoom({
				group: 'burden',
				clients: tmpPlayerList,
				channel: channel,
				logicPath: logicPath
			});

			// Setting metadata, settings, and plot
			tmpPlayerList.each(function (p) {
				node.remoteSetup('game_metadata',  p.id, client.metadata);
				node.remoteSetup('game_settings', p.id, client.settings);
				node.remoteSetup('plot', p.id, client.plot);
				node.remoteSetup('env', p.id, client.env);
				node.remoteSetup('verbosity', p.id, 0);

				node.remoteCommand('start', p.id);
			});
//			console.log(room.clients.player.id.getAllKeys());
//			console.log(room.clients.player.id.getAllKeys()[0]);
//			console.log(room.clients.player.id.getAllKeys()[1]);


			room.startGame();

			// Send room number to admin
			channel.admin.socket.send2roomAdmins(node.msg.create({
				target: node.constants.target.TXT,
				text: 'ROOMNO',
				data: {
					roomNo: counter,
					pids: room.clients.player.id.getAllKeys(),
					aids: room.clients.admin.id.getAllKeys()
				}
			}), room);
			counter ++;
		});
            
            // STE: this was missing.
            // This callback is executed when a player connects to the channel.
            node.on.pdisconnect(function(p) {
                
                // Client really disconnected (not moved into another game room).
                if (channel.registry.clients.disconnected.get(p.id)) {
                    // Free up the code.
                    dk.decrementUsage(p.id);
                }
                
            });

	});

	stager.setOnGameOver(function() {
		console.log('^^^^^^^^^^^^^^^^GAME OVER^^^^^^^^^^^^^^^^^^');
	});

	stager
	.init()
	.loop('waiting');

	return {
		nodename: 'wroom',
		game_metadata: {
			name: 'wroom',
			version: '0.0.1'
		},
		game_settings: {
			publishLevel: 0
		},
		plot: stager.getState(),
		debug: true,
		verbosity: 0
	};

};
