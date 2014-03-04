SmartCitizen
============

SmartCitizen 2014, Project for RICM4
For more information about the progress of the project, see the GitHub wiki.

## Installation
The website depends on some additional packages :
- [node.js](http://www.nodejs.org/)
- [mqtt](https://github.com/adamvr/MQTT.js/)
- [socket.io](http://socket.io/)

To install mqtt and socket.io, first you need to install node.js and NPM. Then clone the repository :
```
git clone https://github.com/PaulLabat/SmartCitizen.git
```

then in the SmartCitizen folder run
```
$ npm install mqtt socket.io
```

## MQTT broker/server
A MQTT broker/server is needed to run on **localhost** :
- [Mosquitto](http://mosquitto.org/)

## Running SmartCitizen

1. Make sure that your MQTT broker/server is running and listening.
2. Launch `node server.js` which will start the node server.
3. Start the `python test-msg.py` script to publish test messages if you have no sensors available. This requires the Python bindings of mosquitto.
4. Open `map.html` with your browser.
