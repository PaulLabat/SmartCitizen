

/* Example testing sketch for various DHT humidity/temperature sensors
** Written by ladyada, public domain
** library : https://github.com/adafruit/DHT-sensor-library
*/

#include "DHT.h"
#include <NanodeMQTT.h>
#include <NanodeUIP.h>
#include <NanodeUNIO.h>

/*For Ethernet and MQTT */
NanodeMQTT mqtt(&uip);
struct timer my_timer;
char buf[20];
char envoi[100];
char resultat2 [100];
/*For the DHT11 sensor */
#define DHTPIN 4     
#define DHTTYPE DHT11 
DHT dht(DHTPIN, DHTTYPE);


void setup() {
  delay(3000);
  
  /* Setting MAC Address */
  byte macaddr[6] = { 0x74,0x69,0x69,0x2D,0x30,0x31 };
  NanodeUNIO unio(NANODE_MAC_DEVICE);
  
  Serial.println("please wait... ethernet calibration");
  
  /*Set the mac address into the device*/
  unio.read(macaddr, NANODE_MAC_ADDRESS, 6);
  uip.init(macaddr);

  /*Set IP address and netmask of the device*/
  uip.set_ip_addr(10, 1, 0, 2);
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
  
  Serial.begin(9600); 
  delay(2000);
 
  dht.begin();
}

void loop() {
  
  /* need to be call regularly in the loop */
  uip.poll();
  
  delay(2000);
  /* We need to wait 2 seconds */
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  /* Only send right values as for MQ4 sensor*/
  if (isnan(t) || isnan(h)) {
    /* do nothing */
  } else {
    /* Convert result from float to char *
    ** mqtt.publish can only send char *
    */
    delay(1000);

    if (mqtt.connected()) {
      Serial.println("Publishing...");
      dtostrf(h, 1, 2, envoi);
      String resultat(envoi);
      resultat = "notreIDici#" + resultat;
      resultat.toCharArray(resultat2, 100);
      Serial.println(resultat2);
      mqtt.publish("test", resultat2);
 
      delay(1000);
      
      dtostrf(t, 1, 2, envoi);
      String resultat3(envoi);
      resultat3 = "notreID2ici#" + resultat3;
      resultat3.toCharArray(resultat2, 100);
      mqtt.publish("test", resultat2);
      Serial.println("Published !");
    }else{
      mqtt.connect();
    }
  }
  
   /*need to be call regularly in the loop */
   uip.poll();
   
  delay(5000);

   /*need to be call regularly in the loop */
   uip.poll();
}
