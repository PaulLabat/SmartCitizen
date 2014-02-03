#! /usr/bin/python2.7
# -*-coding:Utf-8 -*

# publish the number of particles detected by an USB geiger counter every second
# using MQTT
# Author: Didier Donsez
# 2013/08/20
# modified by Paul Labat on 2014/01/31
# run on sudo mode, the serial port is /dev/ttyUSB0 on my computer, it may differs from yours


import serial
import os
import threading
import mosquitto

#mosquitto_sub -t sensor/geigercounter

broker="localhost"
port = 1883

serialdev="/dev/ttyUSB0"

sensor = "geigercounter"
topic="sensor/"+sensor

period = 1.0

cpt = 0

def on_second():
      global period, cpt, topic
      print(cpt)
      mqttc.publish(topic , cpt)
      cpt = 0
      timer = threading.Timer(period, on_second)
      timer.start()


if __name__ == '__main__':

	try:
	    print "Connecting... ", serialdev
	    #connect to serial port
	    ser = serial.Serial(serialdev, 9600, timeout=20)
	except:
	    print "Failed to connect serial"
	    #unable to continue with no serial input
	    raise SystemExit("Failed to connect serial")


	try:
	    ser.flushInput()
	    #create an mqtt client
	    mypid = os.getpid()
	    client_uniq = sensor+"-"+str(mypid)
	    mqttc = mosquitto.Mosquitto(client_uniq)

	    #connect to broker
	    mqttc.connect(broker, port, 60)

	    timer = threading.Timer(period, on_second)
	    timer.start()
	    while mqttc.loop() == 0:
	        c = ser.read()
	        cpt = cpt + 1
	        pass


	# handle list index error (i.e. assume no data received)
	except (IndexError):
	    print "No data received within serial timeout period"
	    ser.close()
    	    mqttc.disconnect()
	# handle app closure
	except (KeyboardInterrupt):
	    print "Interrupt received"
	    ser.close()
    	    mqttc.disconnect()
	except (RuntimeError):
	    print "uh-oh! time to die"
	    ser.close()
    	    mqttc.disconnect()
