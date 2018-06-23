/**
 * # Requirements for Ultimatum Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Incoming connections are validated:
 *
 * - Authorization
 * - Cookie Support
 * - Browser requirements
 *
 * On success, clients are sent to the real waiting room.
 * ---
 */
function Requirements() {

	var stager = new node.Stager();
	var J = JSUS;

	var game = {};

	// Functions.

	function myInit() {
		console.log('INIT');
		W.setupFrame('SOLO_PLAYER');
	}

	function requirements() {

		node.window.loadFrame('/burden/html/room/testing.html', function() {

			var div, token;
			div = W.getElementById('widgets_div');
			token = J.getQueryString('id');

			// Requirements Box.
			window.req = node.widgets.append('Requirements', div, {
				// Automatically sends a SAY message with the outcome of the
				// tests, and the navigator.userAgent property.
				sayResults: true,
				// Mixin the properties of the object returned by the callback
				// with the default content of the SAY message. It can also
				// overwrite the defaults.
				addToResults: function() {
					return { token: token };
				}
			});

			req.onFail = function() {
				var str, args;
				console.log('failed');
//				str = '%spanYou are NOT allowed to take the HIT. If you ' +
//				'have already taken it, you must return it. You can ' +
//				'leave a feedback using the form below.%span';
				str = '%spanYou are NOT allowed to take the HIT. If you ' +
				'have already taken it, you must return it. You can ' +
				'leave a feedback using the form below.%span';
				args = {
						'%span': {
							'class': 'requirements-fail'
						}
				};
				W.sprintf(str, args, div);
				window.feedback = node.widgets.append('Feedback', div);
			};

			req.onSuccess = function() {
				node.emit('HIDE', 'unsupported');
				node.store.cookie('token', token);
				W.getElementById("continue").style.display = ""; 
			};

			// Synchronous callback function for the Requirements widget.
			// Returns an array containing a string for every error.
			// Empty array on success.
			function cookieSupport() {
				var errors = [];
				if ('undefined' === typeof node.store.cookie) {
					// errors.push('Cookie support must be enabled. Please follow the link for instructions on how to enable cookie support provided to you in the e-mail. If cookie support was enabled succesfully please reload this page or click on the link provided to you in the e-mail.');
					errors.push('Cookie support must be enabled.');

				}
				return errors;
			}

			// Asynchronous callback function for the Requirements widget.
			// When the token has been validated on the server, it calls
			// the _result_ callback with the results of the validation
			// to be displayed on screen.
			function checkToken(result) {

				node.get('MTID', function(authorized) {
				    var msg;
					if (authorized.success) {
						// No errors.
						W.getElementById('continue').innerHTML = '<a class="btn btn-primary" id="continue" onclick="parent.location.href = \'/burden/html/informedConsent.html\'">Continue to the Experiment</a>';
                        // W.getElementById('continue').innerHTML = authorized.linkToGame;

						result([]);
						}
						else {
							msg = 'Your identification code was not authorized: ' + authorized.msg;
							result([msg]);
						}
					}, 'SERVER', token);
			}

				req.addRequirements(req.nodeGameRequirements,
						cookieSupport,
						checkToken);

				req.checkRequirements();
			});

		node.log('Testing requirements.');
		};

		// Setting the game plot

		stager.setOnInit(myInit);

		stager.addStage({
			id: 'requirements',
			cb: requirements,
			steprule: node.stepRules.WAIT
		});

		stager.init()
		.next('requirements');

		// Setting the property in game.

		game.plot  = stager.getState();

		game.metadata = {
				name: 'Burden Requirements',
				description: 'Tests if the browser has the necessary requirement, the client is authorized, etc.',
				version: '0.1'
		};

		return game;
	}
