#!/usr/bin/env python
# 
# test-messages.py - This script publish a random MQTT messages every 2 s.
#
# Copyright (c) 2013, Fabian Affolter <fabian@affolter-engineering.ch>
# Released under the MIT license. See LICENSE file for details.
#
import random
import time
import mosquitto

timestamp = int(time.time())

broker = '127.0.0.1'
port = 1883
element = 'sensors'
areas = ['1111', '', '1112', '1113', '1114', '1115', '1116']

print 'Messages are published on topic %s/#... -> CTRL + C to shutdown' \
    % element

while True:
    area = random.choice(areas)
    topic = element +'/'+'/'+area
    message = str(random.uniform(0.0, 50.0))+'#'+str(random.uniform(45.0, 46.0))+'#'+str(random.uniform(5.0, 6.0))

    client = mosquitto.Mosquitto("mqtt-panel-test")
    client.connect(broker)
    client.publish(topic, message)
    time.sleep(2)
