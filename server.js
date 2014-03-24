var mqtt = require('mqtt');
var socket = require('socket.io');
var mongoose = require('mongoose');

//----------------- mqtt part
var mqttbroker = 'localhost';
var mqttport = 1883;
var topic = 'sensors/#'
//connection to the mqtt server
var mqttclient = mqtt.createClient(mqttport, mqttbroker);

//----------------- mongoose part, connection to the database dbSmartCitizen
mongoose.connect('mongodb://localhost/dbSmartCitizen');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));//display if connection error
db.once('open', function callback () {
  console.log("mongoose","connection success");
});

var sensorsCollection = db.collection('sensors');
var capteursCollection = db.collection('capteurs');


//definition of the schema used by the database
var dataSchema = mongoose.Schema({
	latitude: Number,
	idKey: String,
	type: String,
	longitude: Number
},
{
	collection: 'sensors' 
});
var Data = mongoose.model('Data', dataSchema);// define a mongoose model named data

//------------------ socket.io part
var io = socket.listen(3000);
io.set('log level', 0)

//--------------core of the server

io.sockets.on('connection', function (socket) {
	mqttclient.subscribe(topic);//suscribe to the mqtt topic
	console.log('suscribeTopic', topic)


	//function called when a query is received
    socket.on('startQuery', function (query)
    {
    	console.log('startQuery', query.idKey);
    	//var res = sensorsCollection.find({'idKey': query.idKey});
    	Data.find({type: "celcius"}).exec(function(err,doc){
    		if(err)
    			console.log(err);
    		else
    			console.log(doc);
    	});
    	//console.log('resQuery',res.mongooseCollection.collection.db);
    	socket.emit('queryResponse','True');
    	

    });
});

/**
* function to be executed when data from mqtt are received
* Data are received via mqtt brocker and then stored in a mongodb database
*/
mqttclient.on('message', function(topic, payload) {
	//data are formated so that it fit the mongodb syntax
	var split = payload.split('#');
	var toBeStored = new Data({
		idKey: split[0],
		value: parseFloat(split[1]),
		lat: parseFloat(split[2]),
		lon: parseFloat(split[3])
	});

	toBeStored.save(function(err, toBeStored){
		if(err) return console.error(err);
	});

	console.log('', toBeStored);
});