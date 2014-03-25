var mqtt = require('mqtt');
var socket = require('socket.io');
var mongoose = require('mongoose');
var bson = require('bson');

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


//definition of the schema used by the database
var sensorsSchema = mongoose.Schema({
	latitude: Number,
	idKey: String,
	type: String,
	longitude: Number,
},
{
	collection: 'sensors' 
});
var sensorsDataSchema = mongoose.Schema({
	idKey: String,
	value : Number,
},
{
	collection: 'sensorsData' 
});


var Sensors = mongoose.model('Sensors', sensorsSchema);
var SensorsData = mongoose.model('SensorsData', sensorsDataSchema);

//------------------ socket.io part
var io = socket.listen(3000);
io.set('log level', 0)

//--------------core of the server

io.sockets.on('connection', function (socket) {
	mqttclient.subscribe(topic);//suscribe to the mqtt topic


	//function called when a query is received
    socket.on('startQuery', function (query)
	{	
		if(query === 'allSensors')
		{
			Sensors.find().exec(function(err,doc){
				if(err)
				{
					console.log(err);
					socket.emit('queryResponse','error');//if an error occur
				}	
    			else{
    			//send the data of each sensors	to the map
    				var res = JSON.parse(JSON.stringify(doc));
    				res.forEach(function(entry){

					SensorsData.find({idKey: entry.idKey},{}, {sort: {'_id':'descending'}}).exec(function(err,doc){
					    		if(err)
					    		{
					    			console.log(err);
					    			socket.emit('queryResponse','error');

					    		}
					    		else
					    		{
					    			//socket.emit('queryResponse',JSON.parse(JSON.stringify(doc[0])));
					    			socket.emit('startQueryReponse', {'latitude' : entry.latitude,'longitude' : entry.longitude, 'idKey' : entry.idKey, 'type': entry.type, 'value':JSON.parse(JSON.stringify(doc[0])).value});
					    		}

					    	});











   					//socket.emit('startQueryReponse', {'latitude' : entry.latitude,'longitude' : entry.longitude, 'idKey' : entry.idKey, 'type': entry.type});
    				});
    			}
    				
			});
		}   	

    });

    socket.on('queryLastData', function (query){
    	//console.log('queryLastData', query);
    	SensorsData.find({idKey: query},{}, {sort: {'_id':'descending'}}).exec(function(err,doc){
    		if(err)
    		{
    			console.log(err);
    			socket.emit('queryResponse','error');

    		}
    		else
    		{
    			console.log(doc[0]);
    			socket.emit('queryResponse',JSON.parse(JSON.stringify(doc[0])));
    		}

    	});


    });



});

/**
* function to be executed when data from mqtt are received
* Data are received via mqtt brocker and then stored in a mongodb database
*/
mqttclient.on('message', function(topic, payload) {
	//data are formated so that it fit the mongodb syntax
	var split = payload.split('#');
	var toBeStored = new SensorsData({
		idKey: split[0],
		value: parseFloat(split[1])
	});
	console.log('tobestored',toBeStored);
	toBeStored.save(function(err, toBeStored){
		if(err) return console.error(err);
	});
	
});