#!/usr/bin/env python

import random
import time
import mosquitto
import uuid

broker = '127.0.0.1'
port = 1883
element = 'sensors'
lat = {}
lon = {}
sensorsId = {}
i=0
while i < 6:
	lat[i] = str(random.uniform(45.1, 45.3))
	lon[i] =  str(random.uniform(5.68, 5.75))
	#random uuid, ie the sensor id
	sensorsId[i] = str(uuid.uuid4())
	i+=1


print ('Messages are published')

while True:
    area = random.randrange(0,6,1)
    topic = element + '/' + '/' + str(area)
    value = str(random.uniform(0.0, 50.0))
    message = sensorsId[area] + '#' + value + '#' + lat[area] + '#' + lon[area] + '#' + "false"

    client = mosquitto.Mosquitto("mqtt-panel-test")
    client.connect(broker)
    client.publish(topic, message)
    time.sleep(2)
