SmartCitizen
============

SmartCitizen 2014, Project for RICM4.<br>
For more information about the progress of the project, see the GitHub wiki.

## Installation
The website depends on some additional packages :
- [node.js](http://www.nodejs.org/)
- [mqtt](https://github.com/adamvr/MQTT.js/)
- [socket.io](http://socket.io/)
- [mongoose](mongoosejs.com)
To install mqtt, socket.io and mongoose, first you need to install node.js and NPM. 

In order to use an Ethernet module on your arduino and to publish with it on a MQTT server, you need to install some packages. <br>
you need to clone in your-path-for-arduino/librairies/ 3 librairies :
```
git clone https://github.com/njh/NanodeMQTT.git
git clone https://github.com/sde1000/NanodeUIP.git
git clone https://github.com/sde1000/NanodeUNIO.git
```
An example of how to use a MQ4 sensor (for methane) or a DHT11 sensor (for humidity and temperature) with an arduino leonardo is available in the sensor/src_arduino/ directory. You also have a wiring diagram in the sensor/layout/ directory, and some code in python to use your arduino with serial port and publish on a MQTT server in sensor/src_python/

A tutorial of how to use a DHT11 sensor is available [here](https://learn.adafruit.com/dht)

Then clone the repository :
```
git clone https://github.com/PaulLabat/SmartCitizen.git
```

then in the SmartCitizen folder run
```
$ npm install mqtt socket.io mongoose
```

## MQTT broker/server
A MQTT broker/server is needed to run on **localhost** :
- [Mosquitto](http://mosquitto.org/)

## Running SmartCitizen

1. Make sure that your MQTT broker/server is running and listening.
2. Launch `node server.js` which will start the node server.
3. Start the `python test-msg.py` script to publish test messages if you have no sensors available. This requires the Python bindings of mosquitto.
4. Open `map.html` with your browser.
