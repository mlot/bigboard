var express = require('express'),
	bb = require('./routes/bigboard');

var app = express();

app.configure(function(){
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

app.use(express['static'](__dirname));

app.get('/data', bb.getItems);

app.post('/data', bb.createItem);

app.put('/data/:id', bb.updateItem);

app.delete('/data/:id', bb.deleteItem);


app.get('/context', bb.getContext);

app.put('/context', bb.updateContext);



app.get('/',function(req, res){
	res.sendfile('bigboard.html');

});

app.listen(3333);
console.log("BigBoard Server listening on port 3333...");
