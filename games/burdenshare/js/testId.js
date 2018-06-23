//
//// Retrieve
//var MongoClient = require('mongodb').MongoClient;
//
//// Connect to the db
//MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
//  if(!err) {
//    alert("We are connected");
//  }
//});




////var channel = module.parent.exports.channel;
////var node = module.parent.exports.node;
//var Database = require('nodegame-db').Database;
//
//module.exports = function() {
//
///////////////////////////// mongoDB ///////////////////////////
//		// 1. Setting up database connection.
//		var Database = require('nodegame-db').Database;
//		var ngdb = new Database(node);
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
//		node.on.data('player_id',function(msg) {
//			console.log(msg.data);
//			console.log('Writing Player ID!!!');
//			mdbWrite.store(msg.data);
//		});
///////////////////////////// mongoDB ///////////////////////////
//		
//}