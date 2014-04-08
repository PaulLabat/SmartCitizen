#!/usr/bin/env python

#Create by Paul Labat 03/17/14
#Modify by Rodolphe Freby 03/18/14

import pymongo
import uuid
import sys

#Connection to mongoDB on localhost
try:
	client = pymongo.MongoClient('mongodb://localhost')
	print "Connected successfully!!!"
except pymongo.errors.ConnectionFailure, e:
	print "Could not connect to MongoDB"

#Connection to the database dbSmartCitizen
#note : if it is not exist, it will be created
db = client.dbSmartCitizen

#Connection to the collection sensors
#note : if it is not exist, it will be created
sensors = db.sensors

#Definition of the differents types
types = ['celcius', 'fahrenheit', 'percent', 'becquerel', 'ppm']

#Asking the value of the latitude of the sensor
while True:
	try:
		lat = float(raw_input("Latitude of the sensor: "))
		if isinstance(lat, float):
			break
	except ValueError:
		print("This is not an int or a float !")

#Asking the value of the longitude of the sensor
while True:
	try:
		lon = float(raw_input("Longitude of the sensor: "))
		if isinstance(lon, float):
			break
	except ValueError:
		print("This is not an int or a float !")

#Asking the type of data emited by the sensor
while True:
	typeValue = raw_input("Enter the type of the value : (celcius, fahrenheit, percent, becquerel, ppm) : ")
	if typeValue in types:
		break

city = raw_input("Enter the city of the sensor : ")

owner = raw_input("Enter the owner's first and last name : ")


#Checking the unicity of data
sensorId = str(uuid.uuid4())
for d in sensors.find():
	if sensorId == d['idKey']: 
		print('UUID error, aborting...')
		sys.exit(-1)
	if lon == d['longitude'] and lat == d['latitude']:
		print('This coordonates already exist on the database.')
		print('Aborting...')
		sys.exit(-1)

#Injection into database
val = {}
val['idKey'] = str(sensorId)
val['latitude'] = lat
val['longitude'] = lon
val['type'] = typeValue
val['city'] = city
val['owner'] = owner

sensors.insert(val)
print(sensorId)