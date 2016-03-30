var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('test', server);	

db.open(function(err, db){
	if (!err){
		console.log("Connected to test database.");
		db.collection('board', {safe:true}, function(err, collection){
			if (err){
				console.log("The 'board' collection doesn't exist. Creating it with sample data...");
				populateDB();
			}
		});
	}
});

exports.getItems = function(req, res){
	db.collection('board', function(err, collection){
		collection.find().toArray(function(err, items){
			//console.log(items);
			res.send(items);
		});
	});
};

exports.createItem = function(req, res){
	var item = req.body;
	//console.log(item);
	console.log('Creating item:' + JSON.stringify(item));
	db.collection('board',function(err, collection){
		collection.insert(item, {safe:true}, function(err, result){
			if (err){
				res.send({'error':'An error has occurred'});
			} else {
				console.log('Success:' + JSON.stringify(result[0]));
				res.send(result[0]);
			}
		});
	});
};

exports.deleteItem = function(req, res){
    var id = req.params.id;
    //console.log(item);
    console.log('Deleting item:' + id);
    db.collection('board',function(err, collection){
        collection.remove({"id":id});
        res.send({'Success':id});
    });
};

exports.updateItem = function(req, res) {
    var id = req.params.id;
    var item = req.body;
    console.log('Updating item: ' + id);
    //console.log(JSON.stringify(item));
    if (typeof item.offset != "undefined"){
    	//just update position
    	db.collection('board', function(err, collection){
    		collection.findOne({'id':id},function(err, q){
    			var x = parseInt(q.position.x, 10) + parseInt(item.offset.x, 10);
    			var y = parseInt(q.position.y, 10) + parseInt(item.offset.y, 10); 
    			//console.log("x:"+x+",y:"+y);
    			collection.update(
    				{'id':id},
    				{
    					$set: {'position.x': x, 'position.y': y}
    				},
    				{safe:true},
    				function(err, result) {
            			if (err) {
                			console.log('Error updating item: ' + err);
                			res.send({'error':'An error has occurred'});
            			} else {
                			console.log('' + result + ' document(s) updated');
                			res.send(item);
            			}
            		}
    			);
    		});
    	});	
    		
    } 

    if (typeof item.content != "undefined") {
    	//full update
    	db.collection('board', function(err, collection){
    		collection.update(
    			{'id':id},
    			{
    				$set: {'content': item.content}
    			},
    			{safe:true},
    			function(err, result) {
            		if (err) {
                		console.log('Error updating item: ' + err);
                		res.send({'error':'An error has occurred'});
            		} else {
                		console.log('' + result + ' document(s) updated');
                		res.send(item);
            		}
            	}
    		);
    	});
    }
};

var populateDB = function(){
	var items = [
	{id:100, position:{x:100,y:100}, content:"hello", status:"SYNCED"},
	{id:200, position:{x:100,y:200}, content:"world", status:"SYNCED"},
	{id:300, position:{x:400,y:400}, content:"!", status:"SYNCED"}];

	db.collection('board', function(err, collection){
		collection.insert(items, {safe:true}, function(){});
	});

};


exports.getContext = function(req, res){
	db.collection('context', function(err, collection){
		collection.findOne({},function(err, context){
			//console.log(context);
			res.send(context);
		})
	});
	//res.send({position:{x:0,y:0}});
};

exports.updateContext = function(req, res){
	var offset = req.body.offset;
	db.collection('context', function(err, collection){
		collection.findOne({},function(err, oldContext){
			//console.log(context);
			var newX = oldContext.position.x + parseInt(offset.x, 10);
			var newY = oldContext.position.y + parseInt(offset.y, 10);
			collection.update(
				{},
				{
					$set:{'position.x':newX,'position.y':newY}
				},
				{safe:true},
    			function(err, result) {
            		if (err) {
                		console.log('Error updating context: ' + err);
                		res.send({'error':'An error has occurred'});
            		} else {
                		//console.log('' + result + ' document(s) updated');
                		res.send(result);
            		}
            	}
			);
		});
	});
};

