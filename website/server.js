var mqtt = require('mqtt');
var socket = require('socket.io');
//var firmata = require('firmata');

var mqttbroker = 'localhost';
var mqttport = 1883;

var io = socket.listen(3000);
var mqttclient = mqtt.createClient(mqttport, mqttbroker);

// Reduce socket.io debug output
io.set('log level', 0)

// Subscribe to topic
io.sockets.on('connection', function (socket) {
    socket.on('subscribe', function (data) {
        mqttclient.subscribe(data.topic);
    });
});

// Push the message to socket.io
mqttclient.on('message', function(topic, payload) {
    io.sockets.emit('mqtt',
        {'topic'  : topic,
         'payload' : payload
        }
    );
});