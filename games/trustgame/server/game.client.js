/**
 * # Client code for Trust Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 * Extensively documented tutorial.
 *
 * http://www.nodegame.org
 * ---
 */

var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

var trustor = require('./game.client.trustor.js');
var trustee = require('./game.client.trustee.js');
var getGameStager = require('./game.stages.js');

// Export the game-creating function. It needs the name of the treatment and
// its options.
module.exports = function(gameRoom, treatmentName, settings) {
    var stager;
    var game;
    var MIN_PLAYERS;

    stager = new Stager(getGameStager(settings));
    game = {};
    MIN_PLAYERS = settings.MIN_PLAYERS;

    // INIT and GAMEOVER

    stager.setOnInit(function() {
        var that = this;
        var waitingForPlayers;
        var treatment;
        var header;

        console.log('INIT PLAYER GC!');

        // Hide the waiting for other players message.
        waitingForPlayers = W.getElementById('waitingForPlayers');
        waitingForPlayers.innerHTML = '';
        waitingForPlayers.style.display = 'none';

        // We setup the page manually.
        if (!W.getHeader()) {
            header = W.generateHeader();
            // Uncomment to visualize the name of the stages.
//            node.game.visualState = node.widgets.append('VisualState', header);
            node.game.rounds = node.widgets.append('VisualRound', header);
            node.game.timer = node.widgets.append('VisualTimer', header);

        }

        if (!W.getFrame()) {
            W.generateFrame();
        }

        // Add default CSS.
        if (node.conf.host) {
            W.addCSS(W.getFrameRoot(), node.conf.host +
                                       '/stylesheets/nodegame.css');
        }

        this.other = null;

        node.on('BID_DONE', function(offer, to) {
            var root;

            node.game.timer.clear();
            node.game.timer.startWaiting({milliseconds: 30000});

            // W.getElementById('submitOffer').disabled = 'disabled';
            node.set('offer', offer);
            node.say('OFFER', to, offer);
            root = W.getElementById('container');
            W.write(' Your offer: ' +  offer +
                    '. Waiting for the respondent... ', root);
        });

        node.on('RESPONSE_DONE', function(response, offer, from) {
            console.log(response, offer, from);
            node.set('response', {
                response: response,
                value: offer,
                from: from
            });
            node.say(response, from, response);

            //////////////////////////////////////////////
            // nodeGame hint:
            //
            // node.done() communicates to the server that
            // the player has completed the current state.
            //
            // What happens next depends on the game.
            // In this game the player will have to wait
            // until all the other players are also "done".
            //
            // This command is a shorthand for:
            //
            // node.emit('DONE');
            //
            /////////////////////////////////////////////
            node.done();
        });


        // Remove the content of the previous frame
        // before loading the next one.
        node.on('STEPPING', function() {
            W.clearFrame();
        });

        this.isValidBid = function(n, lower, upper) {
            lower = lower || 0;
            upper = upper || node.env.coins;

            if (!n) return false;
            n = parseInt(n, 10);
            return !isNaN(n) && isFinite(n) && n >= lower && n <= upper;
        };

        treatment = node.env('treatment');

        // Adapting the game to the treatment.
        node.game.instructionsPage = '/trustgame/';
        if (treatment === 'pp') {
            node.game.instructionsPage += 'instructions_pp.html';
        }
        else {
            node.game.instructionsPage += 'instructions.html';
        }

    });

    stager.setOnGameOver(function() {
        // Do something.
    });

    ///// STAGES and STEPS

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // Pages can be preloaded with this method:
    //
    // W.preCache()
    //
    // It loads the content from the URIs given in an array parameter, and the
    // next time W.loadFrame() is used with those pages, they can be loaded
    // from memory.
    //
    // W.preCache calls the function given as the second parameter when it's
    // done.
    //
    /////////////////////////////////////////////
    function precache() {
        W.lockScreen('Loading...');
        node.done();
        return;
        // preCache is broken.
        W.preCache([
            node.game.instructionsPage,
            '/trustgame/quiz.html',
            //'/trustgame/bidder.html',  // these two are cached by following
            //'/trustgame/resp.html',    // loadFrame calls (for demonstration)
            '/trustgame/postgame.html',
            '/trustgame/ended.html'
        ], function() {
            console.log('Precache done.');
            // Pre-Caching done; proceed to the next stage.
            node.done();
        });
    }

    function instructions() {
        var that = this;

        //////////////////////////////////////////////
        // nodeGame hint:
        //
        // The W object takes care of all
        // visual operation of the game. E.g.,
        //
        // W.loadFrame()
        //
        // loads an HTML file into the game screen,
        // and the execute the callback function
        // passed as second parameter.
        //
        /////////////////////////////////////////////
        W.loadFrame(node.game.instructionsPage, function() {
            var b = W.getElementById('read');
            b.onclick = function() {
                node.done();
            };

            ////////////////////////////////////////////////
            // nodeGame hint:
            //
            // node.env executes a function conditionally to
            // the environments defined in the configuration
            // options.
            //
            // If the 'auto' environment was set to TRUE,
            // then the function will be executed
            //
            ////////////////////////////////////////////////
            node.env('auto', function() {

                //////////////////////////////////////////////
                // nodeGame hint:
                //
                // Emit an event randomly in a time interval
                // from 0 to 2000 milliseconds
                //
                //////////////////////////////////////////////
                node.timer.randomEmit('DONE', 2000);
            });

        });
        console.log('Instructions');
    }

    function quiz() {
        var that = this;
        W.loadFrame('/trustgame/quiz.html', function() {
            var b, QUIZ;
            node.env('auto', function() {
                node.timer.randomExec(function() {
                    node.game.timer.doTimeUp();
                });
            });
        });
        console.log('Quiz');
    }

    function trustgame() {

        //////////////////////////////////////////////
        // nodeGame hint:
        //
        // var that = this;
        //
        // /this/ is usually a reference to node.game
        //
        // However, unlike in many progamming languages,
        // in javascript the object /this/ assumes
        // different values depending on the scope
        // of the function where it is called.
        //
        /////////////////////////////////////////////
        var that = this;

        var root, b, options, other;

        // Load the trustor and trustee event listeners.
        node.game.globals.trustor(this);
        node.game.globals.trustee(this);

        console.log('Trust Game');
    }

    function postgame() {
        W.loadFrame('/trustgame/postgame.html', function() {
            node.env('auto', function() {
                node.timer.randomExec(function() {
                    node.game.timer.doTimeUp();
                });
            });
        });
        console.log('Postgame');
    }

    function endgame() {
        W.loadFrame('/trustgame/ended.html', function() {
            node.game.timer.switchActiveBoxTo(node.game.timer.mainBox);
            node.game.timer.waitBox.hideBox();
            node.game.timer.setToZero();
            node.on.data('WIN', function(msg) {
                var win, exitcode, codeErr;
                codeErr = 'ERROR (code not found)';
                win = msg.data && msg.data.win || 0;
                exitcode = msg.data && msg.data.exitcode || codeErr;
                W.writeln('Your bonus in this game is: ' + win);
                W.writeln('Your exitcode is: ' + exitcode);
            });
        });

        console.log('Game ended');
    }

    function clearFrame() {
        node.emit('INPUT_DISABLE');
        // We save also the time to complete the step.
        node.set('timestep', {
            time: node.timer.getTimeSince('step'),
            timeup: node.game.timer.gameTimer.timeLeft <= 0
        });
        return true;
    }

    function notEnoughPlayers() {
        console.log('Not enough players');
        node.game.pause();
        W.lockScreen('One player disconnected. We are now waiting to see if ' +
                'he or she reconnects. If not the game will be terminated.');
    }

    // Add all the stages into the stager.

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // A minimal stage must contain two properties:
    //
    // - id: a unique name for the stage
    // - cb: a callback function to execute once
    //     the stage is loaded.
    //
    // When adding a stage / step into the stager
    // there are many additional options to
    // configure it.
    //
    // Properties defined at higher levels are
    // inherited by each nested step, that in turn
    // can overwrite them.
    //
    // For example if a step is missing a property,
    // it will be looked into the enclosing stage.
    // If it is not defined in the stage,
    // the value set with _setDefaultProperties()_
    // will be used. If still not found, it will
    // fallback to nodeGame defaults.
    //
    // The most important properties are used
    // and explained below.
    //
    /////////////////////////////////////////////

    // A step rule is a function deciding what to do when a player has
    // terminated a step and entered the stage level _DONE_.
    // Other stepRules are: SOLO, SYNC_STAGE, SYNC_STEP, OTHERS_SYNC_STEP.
    // In this case the client will wait for command from the server.
    stager.setDefaultStepRule(stepRules.WAIT);

    stager.extendStep('precache', {
        cb: precache,
        // `minPlayers` triggers the execution of a callback in the case
        // the number of players (including this client) falls the below
        // the chosen threshold. Related: `maxPlayers`, and `exactPlayers`.
        minPlayers: [ MIN_PLAYERS, notEnoughPlayers ],
        // syncOnLoaded: true,
        done: clearFrame
    });

    stager.extendStep('instructions', {
        cb: instructions,
        minPlayers: [ MIN_PLAYERS, notEnoughPlayers ],
        // syncOnLoaded: true,
        timer: 90000,
        done: clearFrame
    });

    stager.extendStep('quiz', {
        cb: quiz,
        minPlayers: [ MIN_PLAYERS, notEnoughPlayers ],
        // syncOnLoaded: true,
        // `timer` starts automatically the timer managed by the widget
        // VisualTimer if the widget is loaded. When the time is up it fires
        // the DONE event.
        // It accepts as parameter:
        //  - a number (in milliseconds),
        //  - an object containing properties _milliseconds_, and _timeup_
        //     the latter being the name of the event to fire (default DONE)
        // - or a function returning the number of milliseconds.
        timer: 60000,
        done: function() {
            var b, QUIZ, answers, isTimeup;
            QUIZ = W.getFrameWindow().QUIZ;
            b = W.getElementById('submitQuiz');

            answers = QUIZ.checkAnswers(b);
            isTimeUp = node.game.timer.gameTimer.timeLeft <= 0;

            if (!answers.__correct__ && !isTimeUp) {
                return false;
            }

            answers.timeUp = isTimeUp;

            // On TimeUp there are no answers
            node.set('QUIZ', answers);
            node.emit('INPUT_DISABLE');
            // We save also the time to complete the step.
            node.set('timestep', {
                time: node.timer.getTimeSince('step'),
                timeup: isTimeUp
            });
            return true;
        }
    });

    stager.extendStep('trustgame', {
        cb: trustgame,
        minPlayers: [ MIN_PLAYERS, notEnoughPlayers ],
        // `syncOnLoaded` forces the clients to wait for all the others to be
        // fully loaded before releasing the control of the screen to the
        // players.  This options introduces a little overhead in
        // communications and delay in the execution of a stage. It is probably
        // not necessary in local networks, and it is FALSE by default.
        // syncOnLoaded: true,
        done: clearFrame,
        globals: {
            trustor: trustor,
            trustee: trustee
        }
    });

    stager.extendStep('endgame', {
        cb: endgame,
        done: clearFrame
    });

    stager.extendStep('questionnaire', {
        cb: postgame,
        timer: 90000,
        // `done` is a callback function that is executed as soon as a
        // _DONE_ event is emitted. It can perform clean-up operations (such
        // as disabling all the forms) and only if it returns true, the
        // client will enter the _DONE_ stage level, and the step rule
        // will be evaluated.
        done: function() {
            var q1, q2, q2checked, i, isTimeup;
            q1 = W.getElementById('comment').value;
            q2 = W.getElementById('disconnect_form');
            q2checked = -1;

            for (i = 0; i < q2.length; i++) {
                if (q2[i].checked) {
                    q2checked = i;
                    break;
                }
            }

            isTimeUp = node.game.timer.gameTimer.timeLeft <= 0;

            // If there is still some time left, let's ask the player
            // to complete at least the second question.
            if (q2checked === -1 && !isTimeUp) {
                alert('Please answer Question 2');
                return false;
            }

            node.set('questionnaire', {
                q1: q1 || '',
                q2: q2checked
            });

            node.emit('INPUT_DISABLE');
            node.set('timestep', {
                time: node.timer.getTimeSince('step'),
                timeup: isTimeUp
            });
            return true;
        }
    });

    // We serialize the game sequence before sending it.
    game.plot = stager.getState();

    // Let's add the metadata information.
    game.metadata = {
        name: 'trustgame',
        version: '0.1.0',
        description: 'no descr'
    };

    // Other settings, optional.
    game.settings = {
        publishLevel: 2
    };
    game.env = {
        auto: settings.AUTO,
        treatment: treatmentName,
        coins: settings.COINS,
        timeout: settings.TIMEOUT,
    };
    game.verbosity = 100;

    game.debug = settings.DEBUG;

    return game;
};
