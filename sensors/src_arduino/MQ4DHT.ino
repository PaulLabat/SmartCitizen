#include <NanodeUNIO.h>
#include <NanodeUIP.h>
#include <NanodeMQTT.h>
#include "DHT.h"

/* For MQ4 sensor 
create with
http://www.dfrobot.com/community/diy-your-own-air-quality-monitor-with-arduino.html
https://mail.google.com/mail/u/0/?shva=1#inbox/143d5be4d9046d50
Modified by Rodolphe Freby, on 2014/01/18
*/

/* For DHT 11 Sensor
** Example testing sketch for various DHT humidity/temperature sensors
** Written by ladyada, public domain
** library : https://github.com/adafruit/DHT-sensor-library
** Modified by Rodolphe Freby, on 2014/03/14, adding MQ4 and MQTT code.
*/

/* This is the main arduino sketch
** in order to use the MQ4 and DHT11 sensors
*/

/*For Ethernet and MQTT */
NanodeMQTT mqtt(&uip);
char buf[20];
char envoi[100];
char resultat2 [100];

/*For the MQ4 sensor */
int CH4_PIN = 0;
int RL_CH4 = 22000;
int CH4_air_ratio = 4.5;
float CH4Curve[] = {2.3, 0.26, -0.45};
float RO_CH4;

/*For the DHT11 sensor */
#define DHTPIN 4     
#define DHTTYPE DHT11 
DHT dht(DHTPIN, DHTTYPE);

void setup() {

  /* Chose you mac address */
  byte macaddr[6] = { 0x74,0x69,0x69,0x2D,0x30,0x31 };
  NanodeUNIO unio(NANODE_MAC_DEVICE);

  Serial.begin(9600);
  delay(2000);
  int i = 0;
  /* preheat the sensor for 15 minutes */
  for(i; i<15; i++)
  {
   Serial.println("please wait, warming...");
   delay(60000);
  }
  
  /*now we have to calibrate the value of Ro*/
  Serial.println("please wait, calibration...");
  int value;
  float val1 = 0;
  for (i=0;i<150;i++)
  {
    value = analogRead(CH4_PIN);
    //Transform the analog value of Rs
    val1 += RL_CH4*(1023-value)/value;
    delay(500);
  }//Calibrating 150 times in 75 seconds. 
  
  val1 = val1/150;
  /* Use the value of Rs to find Ro */
  val1 = val1/CH4_air_ratio;
  RO_CH4 = val1;
  Serial.println("please wait... ethernet calibration");
  
  /*Set the mac address*/
  unio.read(macaddr, NANODE_MAC_ADDRESS, 6);
  uip.init(macaddr);

  /*Set IP address and netmask */
  uip.set_ip_addr(10, 1, 0, 42);
  uip.set_netmask(255, 255, 255, 0);

  /*Wait for the connection to be establish* */
  uip.wait_for_link();
  Serial.println("Link is up !");


  /* Connection to the MQTT server */
  Serial.println("please wait, connection...");
  mqtt.set_server_addr(10, 1, 0, 40);
  mqtt.connect();
  
  /* We keep our mac address */
  sprintf(buf,"%02X:%02X:%02X:%02X:%02X:%02X",
        macaddr[0], macaddr[1], macaddr[2], macaddr[3],
        macaddr[4], macaddr[5], macaddr[6]);
  Serial.println("Ethernet card is configure !");
  
  dht.begin();
}

void loop() {
  /* need to be call regularly in the loop */
  uip.poll();

  delay(2000);
  /* We need to wait 2 seconds */
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  /*Get the value into ppm*/
  int i = 0;
  float val1 = 0;
  for (i=0;i<10;i++)
  {
    int b = analogRead(CH4_PIN);
    val1 += RL_CH4*(1023-b)/b;
    delay(500);
  }//read 10 times in 5 second
  val1 = val1/10;
  float Rs_CH4 = val1;
  float result_CH4 = pow(10,(((log(Rs_CH4/RO_CH4)-CH4Curve[1])/CH4Curve[2]) + CH4Curve[0]));
  
  /*need to be call regularly in the loop */
  uip.poll();
  
  if(isnan(result_CH4) || isinf(result_CH4) || result_CH4 > 2000){
     uip.poll();//do nothing
  }else{ 
  uip.poll();
  /*Convert result from float to char *
  mqtt.publish can only send char *
  */
  dtostrf(result_CH4, 1, 2, envoi);
  String resultat(envoi);
  resultat = "53e459e6-3ac4-4c5f-ab8e-5f803a895ac9#" + resultat;
  resultat.toCharArray(resultat2, 100);
    if (mqtt.connected()) {
      Serial.println("Publishing...");
      // MQ4
      mqtt.publish("sensors/id", resultat2);
      
      Serial.println("Published !");
    }else{
      Serial.println("Reconnexion");
      mqtt.set_server_addr(10, 1, 0, 40);
      mqtt.connect();
    }
  }
  
  /* Only send right values as for MQ4 sensor*/
  if (isnan(t) || isnan(h)) {
     uip.poll();//do nothing
  } else {
    /* Convert result from float to char *
    ** mqtt.publish can only send char *
    */
    delay(1000);

    if (mqtt.connected()) {
      Serial.println("Publishing...");
      dtostrf(h, 1, 2, envoi);
      String resultat(envoi);
      resultat = "notreIDiciH#" + resultat;
      resultat.toCharArray(resultat2, 100);
      mqtt.publish("sensors/id", resultat2);
 
      delay(1000);
      
      dtostrf(t, 1, 2, envoi);
      String resultat3(envoi);
      resultat3 = "9ce38ec7-894f-48fc-ba26-fa0589eec913#" + resultat3;
      resultat3.toCharArray(resultat2, 100);
      mqtt.publish("sensors/id", resultat2);
      Serial.println("Published !");
    }else{
      Serial.println("Reconnexion");
      mqtt.set_server_addr(10, 1, 0, 40);
      mqtt.connect();
    }
  }
  
}
