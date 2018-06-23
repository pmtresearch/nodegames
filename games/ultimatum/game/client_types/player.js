/**
 * # Player code for Ultimatum Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 * Extensively documented tutorial.
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

// Export the game-creating function.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var game, cbs;
    var channel = gameRoom.channel;
    var node = gameRoom.node;

    // The game object to return at the end of the function.
    game = {};

    // Import other functions used in the game.
    cbs = require(__dirname + '/includes/player.callbacks.js');

    // Specify init function, and extend steps.


    // Init callback.
    stager.setOnInit(cbs.init);

    stager.setOnGameOver(function() {
        // Do something if you like!
    });

    ////////////////////////////////////////////////////////////
    // nodeGame hint: step propreties.
    //
    // A step is a set of properties under a common label (id),
    // i.e. the id of the step.
    //
    // Properties can be defined at multiple levels, and those defined
    // at higher levels are inherited by each nested step, that in
    // turn can overwrite them.
    //
    // For example, if a step is missing a property, it will be looked
    // into the enclosing stage. If it is not defined in the stage,
    // the value set with _setDefaultProperties()_ will be used. If
    // still not found, it will fallback to nodeGame defaults.
    //
    // The property named `cb` is one of the most important.
    //
    // It defines the callback that will be called during the
    // step. By default, each steps inherits an empty callback,
    // so that it is not necessary to implement one, if the
    // player has, for example, just to read a text.
    //
    // Another important property is `stepRule`
    //
    // A step rule is a function deciding what to do when a player has
    // terminated a step and entered the stage level _DONE_.
    //
    // Some of the available step rules are:
    //
    //  - 'SOLO': advances through the steps freely
    //  - 'WAIT': wait for a command from server to go to
    //            next step (Default)
    //
    // To add/modify properties use the commands:
    //
    // `stager.extendStep`: modifies a step
    // `stager.extendStage`: modifies a stage, and all enclosed steps
    // `stager.setDefaultProperty`: modifies all stages and steps
    //
    ////////////////////////////////////////////////////////////

    stager.extendStep('selectLanguage', {
        frame: 'languageSelection.html',
        cb: cbs.selectLanguage,
        done: function() {
            // The chosen language prefix will be
            // added automatically to every call to W.loadFrame().
            if (node.player.lang.name !== 'English') {
                W.setUriPrefix(node.player.lang.path);
                node.say('mylang', 'SERVER', node.player.lang);
            }
        }
    });

    stager.extendStep('precache', {
        cb: cbs.precache
    });

    stager.extendStep('instructions', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the settings object
        //
        // The settings object is automatically populated with the
        // settings specified for the treatment chosen by the waiting
        // room. The settings is sent to each remote client and it is
        // available under: `node.game.settings`.
        frame: settings.instructionsPage
    });

    stager.extendStep('quiz', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the frame parameter
        //
        // The frame parameter is passed to `W.loadFrame` to
        // load a new page. Additional options exist to automatically
        // search & replace the DOM, and store a page in the cache.
        // In its simplest form, it is just a string indicating the
        // path to the page to load.
        //
        // Pages are loading from the public/ directory inside the
        // game folder. However, they can also be loaded from the
        // views/ directory (if not found in public/).
        frame: 'quiz2.html', // ('quiz.html' to have forms in html)
        cb: function() {
            var w, qt, t;
            t = this.settings.treatmentName;
            qt = this.quizTexts;

            /////////////////////////////////////////////////////////////
            // nodeGame hint: the widget collection
            //
            // Widgets are re-usable components with predefined methods,
            // such as: hide, highlight, disable, getValues, etc.
            // Here we use the `ChoiceManager` widget to create a quiz page.
            w = node.widgets;
            this.quiz = w.append('ChoiceManager', W.getElementById('quiz'), {
                id: 'quizzes',
                title: false,
                forms: [
                    w.get('ChoiceTable', {
                        id: 'howMuch',
                        shuffleItems: true,
                        title: false,
                        choices: qt.howMuchChoices,
                        correctChoice: 1,
                        mainText: qt.howMuchMainText
                    }),
                    w.get('ChoiceTable', {
                        id: 'reject',
                        shuffleItems: true,
                        title: false,
                        orientation: 'v',
                        choices: qt.rejectChoices,
                        correctChoice: 3,
                        mainText: qt.rejectMainText
                    }),
                    w.get('ChoiceTable', {
                        id: 'disconnect',
                        shuffleItems: true,
                        title: false,
                        orientation: 'v',
                        choices: qt.disconnectChoices,
                        correctChoice: t === 'pp' ? 1 : 3,
                        mainText: qt.disconnectMainText
                    })
                ]
            });
        },
        done: function() {
            var answers, isTimeup;
            answers = this.quiz.getValues({
                markAttempt: true,
                highlight: true
            });
            isTimeup = node.game.timer.isTimeup();
            if (!answers.isCorrect && !isTimeup) return false;
            return answers;
        }
    });

    stager.extendStep('mood', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the widget property
        //
        // It is a shortcut to create widget-steps.
        //
        // In a widget-step, the following operations are performed:
        //
        //   1- The widget is loaded, possibly appended. If no frame
        //      is specified, the default page
        //      '/pages/default.html' will be loaded.
        //   2- Upon `node.done`, the current values of the widget
        //      are validated, and if valid, and not timeup will be
        //      sent to server.
        //   3- Upon exiting the step, the widget will be destroyed.
        //
        // If specified as an object, additional options can be set.
        // For example:
        //
        // ```
        // widget: {
        //     name: 'MoodGauge',
        //     id: 'myid',
        //     ref: 'myref', // It will be added as node.game[ref]
        //     options: { ... },
        //     append: false,
        //     checkAnswers: false,
        //     root: ...
        //     destroyOnExit: false
        // }
        // ```
        widget: 'MoodGauge'
    });

    stager.extendStage('ultimatum', {
        // Disable the donebutton for this step.
        donebutton: false,
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the init function
        //
        // It is a function that is executed before the main callback,
        // and before loading any frame.
        //
        // Likewise, it is possible to define an `exit` function that
        // will be executed upon exiting the step.
        //
        // Notice that if the function is defined at the level of the
        // stage, it will be executed only once upone entering the
        // stage. If, you need to have it executed every round the
        // stage is repeated, add it to the first step of the stage.
        init: function() {
            node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL',
                                             'COUNT_UP_ROUNDS_TO_TOTAL']);
        }

        // `syncOnLoaded` forces the clients to wait for all the others to be
        // fully loaded before releasing the control of the screen to the
        // players.  This options introduces a little overhead in
        // communications and delay in the execution of a stage. It is probably
        // not necessary in local networks, and it is FALSE by default.
        // syncOnLoaded: true
    });

    stager.extendStep('matching', {
        init: function() {
            node.game.role = null;
            node.game.other = null;
            node.game.offerReceived = null;
        }
    });

    stager.extendStep('bidder', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the timeup parameter
        //
        // It can be a string (to be emitted as an event), or a
        // function to be executed when `node.game.timer` expires.
        // Note that if no `timer` property is set for current step,
        // then the timeup function will not be automatically called.
        //
        // The default timeup is different for player and logic client
        // types. For players, by default it is a call to `node.done()`.
        timeup: function() {
            if (this.role === 'BIDDER') node.game.bidTimeup();
        },
        cb: cbs.bidder
    });

    stager.extendStep('respondent', {
        timeup: function() {
            if (this.role === 'RESPONDENT') node.game.resTimeup();
        },
        cb: cbs.respondent
    });

    stager.extendStep('endgame', {
        frame: 'ended.html',
        cb: cbs.endgame,
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the donebutton parameter
        //
        // It is read by the DoneButton widget, and it can set the
        // the text on the button, or disable it (false).
        donebutton: false
    });

    stager.extendStep('questionnaire', {
        init: function() {
            node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL']);
        },
        cb: function() {
            var qt;
            qt = this.questTexts;
            this.quest = node.widgets.append('ChoiceTable',
                                             W.getElementById('quiz'),
                                             {
                                                 id: 'quest',
                                                 mainText: qt.mainText,
                                                 choices: qt.choices,
                                                 freeText: qt.freeText,
                                                 title: false,
                                                 shuffleChoices: true,
                                                 orientation: 'v'
                                             });
        },
        frame: 'questionnaire.html', // ('postgame.html' to have forms in html)
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the done callback
        //
        // `done` is a callback execute after a call to `node.done()`
        // If it returns FALSE, the call to `node.done` is canceled.
        // Other return values are sent to the server, and replace any
        // parameter previously passed to `node.done`.
        done: function(args) {
            var answers, isTimeup;
            answers = this.quest.getValues();
            isTimeup = node.game.timer.isTimeup();
            if (!answers.choice && !isTimeup) {
                this.quest.highlight();
                return false;
            }
            return answers;
        }
    });

    // We serialize the game sequence before sending it.
    game.plot = stager.getState();

    // Other settings, optional.

    game.env = {
        auto: settings.AUTO,
        treatment: treatmentName
    };
    game.verbosity = 1000;

    game.debug = settings.DEBUG;
    game.nodename = 'player';

    return game;
};
