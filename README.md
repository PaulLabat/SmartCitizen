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
- [Twit](https://github.com/ttezel/twit)
To install mqtt, socket.io, Twit and mongoose, first you need to install node.js and NPM. 

In order to use an Ethernet module on your arduino and to publish with it on a MQTT server, you need to install some packages. <br>
you need to clone in your-path-for-arduino/librairies/ 3 librairies :
```
git clone https://github.com/njh/NanodeMQTT.git
git clone https://github.com/sde1000/NanodeUIP.git
git clone https://github.com/sde1000/NanodeUNIO.git
```
An example of how to use a MQ4 sensor (for methane) or a DHT11 sensor (for humidity and temperature) with an arduino leonardo is available in the sensor/src_arduino/ directory. You also have a wiring diagram in the sensor/layout/ directory, and some code in python to use your arduino with serial port and publish on a MQTT server in sensor/src_python/. The DHT11 sensor also needs an extern library. You can found it on the DHT11 tutorial from [adafruit](https://learn.adafruit.com/dht).

A tutorial of how to use a DHT11 sensor is available [here](https://learn.adafruit.com/dht).
More information about the MQ4 Sensor can be found [here](http://www.dfrobot.com/community/diy-your-own-air-quality-monitor-with-arduino.html).
This two websites help us to create arduino's sketch available in the /sensors/src_arduino/ directory.

Then clone the repository :
```
git clone https://github.com/PaulLabat/SmartCitizen.git
```

then in the SmartCitizen folder run
```
$ npm install mqtt socket.io mongoose twit
```

In order to use Twit you will need to have a key. More information can be found [here](https://github.com/ttezel/twit).

## MQTT broker/server
A MQTT broker/server is needed to run on **localhost** :
- [Mosquitto](http://mosquitto.org/)

## Running SmartCitizen

1. Make sure that your MQTT broker/server is running and listening.
2. Launch `node server.js` which will start the node server.
3. Add the sensor to the database with the `python manage-sensors.py` script and use the ID for yor sensor. The sensor needs to publish on the MQTT topic sensors/id this type of message : your_sensor_id#value. Don't forget it, a sensor in the database without any value will not be set on the map.
4. Start the `python test-msg.py` script to publish test messages if you have no sensors available. This requires the Python bindings of mosquitto.
5. Open `map.html` with your browser and see your markers and graphs ! Also take a look to your twitter account to see twit if there is any problem !
