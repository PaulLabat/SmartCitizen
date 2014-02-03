#! /usr/bin/python2.7
# -*-coding:UTF-8 -*

# publish the number of particles detected by a Methane sensor every two second, it is use with an arduino code for a MQ4 methane sensor
# using MQTT 
# Author: Didier Donsez 
# 2013/08/20 
# modified by Rodolphe Freby on 2014/02/03 
# run on sudo mode, the serial port is /dev/ttyACM0 on my computer, it may differs from yours

import serial
import sys
import math
import os
import mosquitto

if __name__ == '__main__':

	#recuperation of the port and the ip address
	port = sys.argv[1]
	netAddress = sys.argv[2]
	sensor = 'MQ4_Methane_detector'
	topic = 'sensor/'+sensor

	try:
		print 'Connecting... please wait'
		#select your usb port here
		ser = serial.Serial('/dev/ttyACM0', 9600)
		print 'done'
	except:
		#an exception occur
		raise SystemExit('Failed to connect to serial port')	


	try:
		#flush the serial port
		ser.flushInput()
		
		#creation of an unique ID
		pid_sensor = os.getpid()
		client_uniq = sensor+'-'+str(pid_sensor)
		
		mqttc = mosquitto.Mosquitto(client_uniq)
		
		#connect to broker
		mqttc.connect(netAddress, int(port), 60)


		#recuperation of the value given by arduino
		line = ser.readline()
		while 'please' in line:
			ser.flushInput()
			line = ser.readline()
			#do nothing, preparation of the sensor (calibration)


		while mqttc.loop() == 0:
			line = ser.readline()
			#filter of wrong values : not a number, ovf, infinit and absurd values
			if not 'ovf' in line and not 'nan' in line and not 'inf' in line and float(line) < 10000:
				print 'Value: {}' .format(float(line))
				mqttc.publish(topic, line)
	# handle list index error (i.e. assume no data received)
	except (IndexError):
		print 'No data received within serial timeout period'
		ser.close()
		mqttc.disconnect()
	# handle app closure
	except (KeyboardInterrupt):
		print 'Interrupt received'
		ser.close()
		mqttc.disconnect()
	except (RuntimeError):
		print 'uh-oh! time to die'
		ser.close()
		mqttc.disconnect()

