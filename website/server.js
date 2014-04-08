var mqtt = require('mqtt');
var socket = require('socket.io');
var mongoose = require('mongoose');
var twit = require('twit');

//----------------- twitter part
var T = new twit({
    consumer_key : 'U87J6WZNIjD7FRPeiSDLqrji9',
    consumer_secret : 'XHp6BLffy9FZZJXQb6XWNfOXa4R738tGVd09qhr2yKxZkT6G98',
    access_token : '2360537487-YR6i2mQkwRubKVq212FQLdkPXp44RjGDOQcXKyv',
    access_token_secret : 'uv59pI49r841XLECUrEYAeDRIMu1l3f4X4v5ctMN4puEC'
});

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
    city: String,
    owner: String,
},
{
	collection: 'sensors' 
});
var sensorsDataSchema = mongoose.Schema({
	idKey: String,
	value : Number,
	date:{type:Date, default:Date.now()},
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
    					//query the last value of the sensor
						SensorsData.find({idKey: entry.idKey},{}, {sort: {'_id':'descending'}}).limit(1).exec(function(err,doc){
					    		if(err)
					    		{
									socket.emit('startQueryReponse', {'latitude' : entry.latitude,'longitude' : entry.longitude, 'idKey' : entry.idKey, 'type': entry.type, 'value':"none", 'city':entry.city, 'owner':entry.owner});
					    		}
					    		else
					    		{
                                    if(doc.length !== 0)//if the sensor has just been added and has no value, we don't display it
                                    {
                                        socket.emit('startQueryReponse', {'latitude' : entry.latitude,'longitude' : entry.longitude, 'idKey' : entry.idKey, 'type': entry.type, 'value':JSON.parse(JSON.stringify(doc[0])).value,'city':entry.city, 'owner':entry.owner});
                                    }
					    		}

					   	});
    				});
    			}
    				
			});
		}   	

    });//end startquery

    //send the last data of a sensor
    socket.on('queryLastData', function (query){
    	SensorsData.find({idKey: query},{}, {sort: {'_id':'descending'}}).limit(1).exec(function(err,doc){
    		if(err)
    		{
    			console.log(err);
    			socket.emit('queryResponse','error');

    		}
    		else
    		{
    			socket.emit('queryResponse',JSON.parse(JSON.stringify(doc[0])));
    		}

    	});


    });//end socket.on querylastdata

    //send the 30 last data of a sensor in order to display a grap in the popup
    socket.on('queryDataGraph', function (query){
    	SensorsData.find({idKey: query},{}, {sort: {'_id':'ascending'}}).limit(30).exec(function(err,doc){
    		if(err)
    		{
    			console.log(err);
    			socket.emit('queryDataGraphResponse','error');

    		}
    		else
    		{
    			socket.emit('queryDataGraphResponse',{idKey:doc[0].idKey,value:doc});
    		}

    	});
    });// end queryDataGraph

    //send all data about a sensor, to display graph in the about page
    socket.on('queryAllData', function (query){
    	SensorsData.find({idKey: query},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
    		if(err)
    		{
    			console.log(err);
    			socket.emit('queryAllDataResponse','error');

    		}
    		else
    		{
    			socket.emit('queryAllDataResponse',{idKey:doc[0].idKey,value:doc});
    		}

    	});
    });// end queryAllData

    //send all data about avery sensor with the right type (temperature, humidity...), to display graph in the about page
    socket.on('queryAllDataByType', function (query){
        if(query === "allTypes"){

            Sensors.find({},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                if(err)
                {
                    console.log(err);
                    socket.emit('queryAllDataByTypeReponse','error');//if an error occur
                }   
                else{
                //send the data of each sensors to the map
                    var res = JSON.parse(JSON.stringify(doc));
                    res.forEach(function(entry){
                        SensorsData.find({idKey: entry.idKey},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                            if(err)
                            {
                                console.log(err);
                                socket.emit('queryAllDataByTypeReponse','error');

                            }
                            else
                            {
                                if(doc.length !==0)
                                {
                                    socket.emit('queryAllDataByTypeReponse',{idKey:doc[0].idKey,value:doc});
                                }
                              }

                        });
                    });
                }
                    
            });
        }
        else{
            Sensors.find({type: query},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                if(err)
                {
                    console.log(err);
                    socket.emit('queryAllDataByTypeReponse','error');//if an error occur
                }   
                else{
                //send the data of each sensors to the map
                    var res = JSON.parse(JSON.stringify(doc));
                    res.forEach(function(entry){
                        SensorsData.find({idKey: entry.idKey},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                            if(err)
                            {
                                console.log(err);
                                socket.emit('queryAllDataByTypeReponse','error');

                            }
                            else
                            {
                                if(doc.length !==0)
                                {
                                    socket.emit('queryAllDataByTypeReponse',{idKey:doc[0].idKey,value:doc});
                                }
                              }

                        });
                    });
                }
                    
            });
        }
        
    });// end queryAllDataByType

    socket.on('queryAllDataByCity', function (query){
        if(query === "allCities"){

            Sensors.find({},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                if(err)
                {
                    console.log(err);
                    socket.emit('queryAllDataByCityResponse','error');//if an error occur
                }   
                else{
                //send the data of each sensors to the map
                    var res = JSON.parse(JSON.stringify(doc));
                    res.forEach(function(entry){
                        SensorsData.find({idKey: entry.idKey},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                            if(err)
                            {
                                console.log(err);
                                socket.emit('queryAllDataByCityResponse','error');

                            }
                            else
                            {
                                if(doc.length !==0)
                                {
                                    socket.emit('queryAllDataByCityResponse',{idKey:doc[0].idKey,value:doc});
                                }
                              }

                        });
                    });
                }
                    
            });
        }
        else{
            Sensors.find({city: query},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                if(err)
                {
                    console.log(err);
                    socket.emit('queryAllDataByCityResponse','error');//if an error occur
                }   
                else{
                //send the data of each sensors to the map
                    var res = JSON.parse(JSON.stringify(doc));
                    res.forEach(function(entry){
                        SensorsData.find({idKey: entry.idKey},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                            if(err)
                            {
                                console.log(err);
                                socket.emit('queryAllDataByCityResponse','error');

                            }
                            else
                            {
                                if(doc.length !==0)
                                {
                                    socket.emit('queryAllDataByCityResponse',{idKey:doc[0].idKey,value:doc});
                                }
                              }

                        });
                    });
                }
                    
            });
        }
    });


    socket.on('queryAllDataByCityAndType', function (query) {
        if(query.type === "allTypes"){
            Sensors.find({city : query.city},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                if(err)
                {
                    console.log(err);
                    socket.emit('queryAllDataByCityAndTypeResponse','error');//if an error occur
                }   
                else{
                //send the data of each sensors to the map
                    var res = JSON.parse(JSON.stringify(doc));
                    res.forEach(function(entry){
                        SensorsData.find({idKey: entry.idKey},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                            if(err)
                            {
                                console.log(err);
                                socket.emit('queryAllDataByCityResponse','error');

                            }
                            else
                            {
                                if(doc.length !==0)
                                {
                                    socket.emit('queryAllDataByCityResponse',{idKey:doc[0].idKey,value:doc});
                                }
                              }

                        });//end second query
                    });
                }    
            });//end first query

        }
        else if(query.city === "allCities"){
            Sensors.find({type: query.type},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                if(err)
                {
                    console.log(err);
                    socket.emit('queryAllDataByCityAndTypeResponse','error');//if an error occur
                }   
                else{
                //send the data of each sensors to the map
                    var res = JSON.parse(JSON.stringify(doc));
                    res.forEach(function(entry){
                        SensorsData.find({idKey: entry.idKey},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                            if(err)
                            {
                                console.log(err);
                                socket.emit('queryAllDataByCityResponse','error');
                            }
                            else
                            {
                                if(doc.length !==0)
                                {
                                    socket.emit('queryAllDataByCityResponse',{idKey:doc[0].idKey,value:doc});
                                }
                              }

                        });//end second query
                    });
                }      
            });//end first query
        }
        else{
            Sensors.find({type: query.type, city : query.city},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                if(err)
                {
                    console.log(err);
                    socket.emit('queryAllDataByCityAndTypeResponse','error');//if an error occur
                }   
                else{
                //send the data of each sensors to the map
                    var res = JSON.parse(JSON.stringify(doc));
                    res.forEach(function(entry){
                        SensorsData.find({idKey: entry.idKey},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
                            if(err)
                            {
                                console.log(err);
                                socket.emit('queryAllDataByCityResponse','error');
                            }
                            else
                            {
                                if(doc.length !==0)
                                {
                                    socket.emit('queryAllDataByCityResponse',{idKey:doc[0].idKey,value:doc});
                                }
                              }

                        });//end second query
                    });
                }       
            });//end first query
        }
    });

});

//---------------- Activition treshold
var temperature = 30.;
var humidity = 40.;

/**
* function to be executed when data from mqtt are received
* Data are received via mqtt brocker and then stored in a mongodb database
*/
mqttclient.on('message', function(topic, payload) {
	//data are formated so that it fit the mongodb syntax
    console.log('mqtt', 'msg received');
    var split = payload.split('#');
    //the query verify if the sensor is in the database, if not, we do not store the data
    Sensors.find({idKey : split[0]},{}, {sort: {'_id':'ascending'}}).exec(function(err,doc){
        if(err){
        }
        else{
            if(doc.length !==0){
                var toBeStored = new SensorsData({
                    idKey: split[0],
                    value: parseFloat(split[1]),
                    date:Date.now()
                });
                console.log('tobestored',toBeStored);
                toBeStored.save(function(err, toBeStored){
                    if(err) return console.error(err);
                });
                switch(doc[0].type){
                    case "celcius":
                    if(split[1] >= temperature){
                        tweet(doc[0], temperature, "°C", split[1]);
                    }
                    break;
                    case "percent":
                    if(split[1] >= humidity){
                        tweet(doc[0], humidity, "%", split[1]);
                    }
                    break;
                    default:
                }
            }
        }
    });	
});
function tweet(doc,threshold, unit, value)
{
    var txt = "The sensor own by "+doc.owner+", located in "+ doc.city+" exeeded "+threshold+unit+". It is "+Math.ceil(value)+unit;
    T.post('statuses/update', {status: txt}, function (err, reply){
        if(err)
        {
            console.log('twitter', 'error', err);
        }
        else{
            console.log('twitter', "tweet sent");
        }
    });

}