/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel, gameRoom) {

    var path = require('path');
///////////////////////////// MTurk Version ///////////////////////////
    // Reads in descil-mturk configuration.
    var confPath = path.resolve(__dirname, 'descil.conf.js');

    // Load the code database.
    var dk = require('descil-mturk')(confPath);

//   dk.getCodes(function() {
//       if (!dk.codes.size()) {
//           throw new Error('game.room: no codes found.');
//       }
//   });

    dk.readCodes(function() {
        if (!dk.codes.size()) {
            throw new Error('game.room: no codes found.');
        }
    });

    // If NO authorization is found, local codes will be used,
    // and assigned automatically.
    var noAuthCounter = -1;
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
        // var code;
		// code = dk.codes.db[++noAuthCounter].AccessCode;
		// dk.incrementUsage(code);
        // // Return the id only if token was validated.
        // // More checks could be done here to ensure that token is unique in ids.
        if (cookies.token) {

            if (!ids[cookies.token] || ids[cookies.token].disconnected) {
   			         return cookies.token;
   			        }
   			else{
   				console.log("already in ids", cookies.token)
   				return false;
   			}
        }
    });
/////////////////////////////// MTurk Version ///////////////////////////


//	stager.addStage(waitingStage);

	stager.setOnInit(function() {
		this.channel = channel;
		var counter = 1;
		console.log('********Waiting Room Created*****************');

		function TimeOut(playerID, nbrPlayers){
			var code = dk.codes.id.get(playerID);
			var timeOutData = {
				over: "Time elapsed!!!",
				exit: code.ExitCode
				// exit: 123
			}
			if(nbrPlayers == 1){
				countDown1 = setTimeout(function(){
					// console.log("Timeout has not been cleared!!!");
					dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(err, response, body){
						if(err){
							// Retry the Checkout
							setTimeout(function(){
								dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
							}, 2000)
						}
					});
					node.say("TIME", playerID, timeOutData);
					for(var i = 0; i < channel.waitingRoom.clients.player.size(); i++){
						if(channel.waitingRoom.clients.player.db[i].id == playerID){
							delete channel.waitingRoom.clients.player.db[i];
							channel.waitingRoom.clients.player.db = channel.waitingRoom.clients.player.db.filter(function(a){return typeof a !== 'undefined';})	;
						}
					}

				}, 600000); // 600000 == 10 min
			}
			else if(nbrPlayers == 2){
				countDown2 = setTimeout(function(){
					// console.log("Timeout has not been cleared!!!");
					dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(err, response, body){
						if(err){
							// Retry the Checkout
							setTimeout(function(){
								dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
							}, 2000)
						}
					});
					node.say("TIME", playerID, timeOutData);
					for(var i = 0; i < channel.waitingRoom.clients.player.size(); i++){
						if(channel.waitingRoom.clients.player.db[i].id == playerID){
							delete channel.waitingRoom.clients.player.db[i];
							channel.waitingRoom.clients.player.db = channel.waitingRoom.clients.player.db.filter(function(a){return typeof a !== 'undefined';})	;
						}
					}

				}, 600000); // 600000 == 10 min
			}
			else if(nbrPlayers == 3){
				countDown3 = setTimeout(function(){
					// console.log("Timeout has not been cleared!!!");
					dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(err, response, body){
						if(err){
							// Retry the Checkout
							setTimeout(function(){
								dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
							}, 2000)
						}
					});
					node.say("TIME", playerID, timeOutData);
					for(var i = 0; i < channel.waitingRoom.clients.player.size(); i++){
						if(channel.waitingRoom.clients.player.db[i].id == playerID){
							delete channel.waitingRoom.clients.player.db[i];
							channel.waitingRoom.clients.player.db = channel.waitingRoom.clients.player.db.filter(function(a){return typeof a !== 'undefined';})	;
						}
					}

				}, 600000); // 600000 == 10 min
			}
			else if(nbrPlayers == 4){
				countDown4 = setTimeout(function(){
					// console.log("Timeout has not been cleared!!!");
					dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(err, response, body){
						if(err){
							// Retry the Checkout
							setTimeout(function(){
								dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
							}, 2000)
						}
					});
					node.say("TIME", playerID, timeOutData);
					for(var i = 0; i < channel.waitingRoom.clients.player.size(); i++){
						if(channel.waitingRoom.clients.player.db[i].id == playerID){
							delete channel.waitingRoom.clients.player.db[i];
							channel.waitingRoom.clients.player.db = channel.waitingRoom.clients.player.db.filter(function(a){return typeof a !== 'undefined';})	;
						}
					}

				}, 600000); // 600000 == 10 min
			}
		}

        function connectingPlayer(p) {
			var room, wRoom;
			var NPLAYERS = 4;
			var code = dk.codes.id.get(p.id);
			dk.checkIn(code.AccessCode);

			console.log('-----------Player connected ' + p.id);
			wRoom = channel.waitingRoom.clients.player;
			// console.log(channel.waitingRoom.clients.player);
			for(var i = 0; i < wRoom.size(); i++){
				// console.log(wRoom.db[i].id);
				node.say("PLAYERSCONNECTED", wRoom.db[i].id, wRoom.size());
			}

			TimeOut(p.id, wRoom.size());

			if (wRoom.size() < NPLAYERS) return;

			for(var i = 0; i < wRoom.size(); i++){
					var timeOutData = {
						over: "AllPlayersConnected",
						exit: 0
					}
					node.say("TIME", wRoom.db[i].id, timeOutData);
					if(i == 0){
						clearTimeout(countDown1);
					}
					else if(i == 1){
						clearTimeout(countDown2);
					}
					else if(i == 2){
						clearTimeout(countDown3);
					}
					else if(i == 3){
						clearTimeout(countDown4);
					}
			};



			console.log('-----------We have four players-----Game Room ID: ' + counter);

			tmpPlayerList = wRoom.shuffle().limit(NPLAYERS);

			room = channel.createGameRoom({
				group: 'burdenRAHR',
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
                            // STE: commented, makes easier to debug
			    // node.remoteSetup('verbosity', p.id, 0);

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

			// Save User ID permanently such that he or she can onlyparticipate once
			// var fs = require('fs');
			// // fs.appendFile(__dirname + "/codes.json", dk.codes.stringify(false), function(err) {
			// // });
			// var auth_codes = require(__dirname + "/codes.json");
			// for(i = 0; i<dk.codes.db.length; i++){
				// if(dk.codes.db[i].usage == 1){
					// auth_codes.push(dk.codes.db[i]);
				// }
			// }
			// fs.writeFile(__dirname + "/codes.json", JSON.stringify(auth_codes));

        }

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
		// node.on.pconnect(function(p) {
			// var room, wRoom;
			// var NPLAYERS = 4;
			// console.log('-----------Player connected ' + p.id);
			// wRoom = channel.waitingRoom.clients.player;
//
//
			// // Send the client the waiting stage.
// //			node.remoteSetup('game_metadata',  p.id, clientWait.metadata);
// //			node.remoteSetup('plot', p.id, clientWait.plot);
// //			node.remoteCommand('start', p.id);
// //			node.socket.send(node.msg.create({
// //			to: 'ALL',
// //			text: 'waitingRoom',
// //			data: {
// //			poolSize: NPLAYERS,
// //			nPlayers: wRoom.size()
// //			}
// //			}));
// //			console.log(wRoom);
//
//
			// if (wRoom.size() < NPLAYERS) return;
//
			// console.log('-----------We have four players');
//
			// var tmpPlayerList = wRoom.shuffle().limit(NPLAYERS);
//
			// room = channel.createGameRoom({
				// group: 'burden',
				// clients: tmpPlayerList,
				// channel: channel,
				// logicPath: logicPath
			// });
//
			// // Setting metadata, settings, and plot
			// tmpPlayerList.each(function (p) {
				// node.remoteSetup('game_metadata',  p.id, client.metadata);
				// node.remoteSetup('game_settings', p.id, client.settings);
				// node.remoteSetup('plot', p.id, client.plot);
				// node.remoteSetup('env', p.id, client.env);
				// node.remoteSetup('verbosity', p.id, 0);
//
				// node.remoteCommand('start', p.id);
			// });
// //			console.log(room.clients.player.id.getAllKeys());
// //			console.log(room.clients.player.id.getAllKeys()[0]);
// //			console.log(room.clients.player.id.getAllKeys()[1]);
//
//
			// room.startGame();
//
			// // Send room number to admin
			// channel.admin.socket.send2roomAdmins(node.msg.create({
				// target: node.constants.target.TXT,
				// text: 'ROOMNO',
				// data: {
					// roomNo: counter,
					// pids: room.clients.player.id.getAllKeys(),
					// aids: room.clients.admin.id.getAllKeys()
				// }
			// }), room);
			// counter ++;
		// });

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
