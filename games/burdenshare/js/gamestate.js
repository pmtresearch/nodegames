//Added by Florian Schmidt
//new widget

(function (node) {

	var Table = node.window.Table,
		GameState = node.GameState;
	
	node.widgets.register('StateOfGame', StateOfGame);	

//## Defaults
	
	StateOfGame.defaults = {};
	StateOfGame.defaults.id = 'statedisplay';
	StateOfGame.defaults.fieldset = { legend: 'State' };		
	
//## Meta-data
	
	StateOfGame.name = 'State Display';
	StateOfGame.version = '0.4.2';
	StateOfGame.description = 'Display basic information about player\'s status.';
	
	function StateOfGame (options) {
		
		this.id = options.id;
				
		this.root = null;

//		this.table = new Table();
	}
//	var NEWTAG = document.createElement("newtag");
//	var my_div = document.getElementById("statedisplay_fieldset");
//	document.body.insertAfter(NEWTAG, my_div);
	
//	// TODO: Write a proper INIT method
//	StateOfGame.prototype.init = function () {};
//	
//	StateOfGame.prototype.getRoot = function () {
//		return this.root;
//	};
//	
//	
//	StateOfGame.prototype.append = function (root) {
//		var that = this;
//		var PREF = this.id + '_';
//		
//		var idFieldset = PREF + 'fieldset';
//		var idPlayer = PREF + 'player';
//		var idState = PREF + 'state'; 
//			
//		var checkPlayerName = setInterval(function(idState,idPlayer) {
//			if (node.player && node.player.id) {
//				clearInterval(checkPlayerName);
//				that.updateAll();
//			}
//		}, 100);
//	
//		root.appendChild(this.table.table);
//		this.root = root;
//		return root;
//		
//	};
//	
//	StateOfGame.prototype.updateAll = function() {
//		var state = node.game ? new GameState(node.game.state) : new GameState(),
//			id = node.player ? node.player.id : '-';
//			name = node.player && node.player.name ? node.player.name : '-';
//			
//		this.table.clear(true);
////		this.table.addRow(['Name: ', name]);
////		this.table.addRow(['State: ', state.toString()]);
//		this.table.addRow(['', state.toString()]);
////		this.table.addRow(['Id: ', id]);
//		this.table.parse();
//		
//	};
//	
//	StateDisplay.prototype.listeners = function () {
//		var that = this;
//		
//		node.on('STATECHANGE', function() {
//			that.updateAll();
//		}); 
//	}; 
	
})(node);