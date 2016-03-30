var MongoClient = require('mongodb').MongoClient;

// Connect to the db
// MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
  
//   if(err) { return console.dir(err); }

//   var collection = db.collection('test');
//   var doc1 = {'hello':'doc1'};
//   var doc2 = {'hello':'doc2'};
//   var lotsOfDocs = [{'hello':'doc3'}, {'hello':'doc4'}];

//   //collection.insert(doc1);

//   collection.insert(doc2, {w:1}, function(err, result) {console.log('here');});

//   collection.insert(lotsOfDocs, {w:1}, function(err, result) {console.log('there');});

// });

function DataItem(a,b,c,d){
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
}

var i = {a:0,b:10,c:4,d:2};

var a = new DataItem(i);
console.log(a);
// hahah
