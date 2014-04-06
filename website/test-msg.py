#!/usr/bin/env python

import random
import time
import mosquitto
import uuid

broker = '127.0.0.1'
port = 1883
element = 'sensors'
sensorsId = {}
sensorsId[0] = "1e55a8b8-f3be-4025-a0bf-f4deff845ebf"
sensorsId[1] = "aba26bdd-51d9-4eb9-9de4-c3980977a193"
sensorsId[2] = "9b71d74d-b7db-4d4d-b2a2-6671e73bf846"
sensorsId[3] = "608e03e9-4f9d-4efa-bb28-2b7c36eeb1ef"

print ('Messages are published')

while True:
    area = random.randrange(0,len(sensorsId),1)
    topic = element + '/' + str(area)
    value = str(random.uniform(0.0, 50.0))
    message = sensorsId[area] + '#' + value
    client = mosquitto.Mosquitto("smartcitizen")
    client.connect(broker)
    client.publish(topic, message)
    time.sleep(2)
