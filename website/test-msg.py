#!/usr/bin/env python

import random
import time
import mosquitto
import uuid

broker = '127.0.0.1'
port = 1883
element = 'sensors'
sensorsId = {}
sensorsId[0] = "14d74b78-7c12-45bc-9f8a-301178efc735"
sensorsId[1] = "d652a9c7-23a3-4308-8aa9-dc50c846fa1e"
sensorsId[2] = "7071334e-5e90-4916-a428-6d5f63599a02"
sensorsId[3] = "701a3a5e-a0ca-4b35-8010-a9f09a323c7a"

print ('Messages are published')

while True:
    area = random.randrange(0,len(sensorsId),1)
    topic = element + '/' + str(sensorsId[area])
    value = str(random.uniform(0.0, 50.0))
    message = sensorsId[area] + '#' + value
    client = mosquitto.Mosquitto("smartcitizen")
    client.connect(broker)
    client.publish(topic, message)
    time.sleep(3)
