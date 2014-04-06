

// Example testing sketch for various DHT humidity/temperature sensors
// Written by ladyada, public domain

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
  
  byte macaddr[6] = { 0x74,0x69,0x69,0x2D,0x30,0x31 };
  NanodeUNIO unio(NANODE_MAC_DEVICE);
  
  Serial.println("please wait... ethernet calibration");
  
  /*Set the mac address*/
  unio.read(macaddr, NANODE_MAC_ADDRESS, 6);
  uip.init(macaddr);

  /*Set IP address and netmask */
  uip.set_ip_addr(10, 1, 0, 2);
  uip.set_netmask(255, 255, 255, 0);

  /*Wait for the connection to be establish* */
  uip.wait_for_link();
  Serial.println("Link is up !");
  
  /* Connection to the MQTT server */
  Serial.println("please wait, connection...");
  mqtt.set_server_addr(10, 1, 0, 42);
  mqtt.connect();
  
  /* We keep our mac address */
  sprintf(buf,"%02X:%02X:%02X:%02X:%02X:%02X",
        macaddr[0], macaddr[1], macaddr[2], macaddr[3],
        macaddr[4], macaddr[5], macaddr[6]);
  Serial.println("Ethernet card is configure !");
  
  Serial.begin(9600); 
  delay(2000);
  Serial.println("DHT11 test!");
 
  dht.begin();
}

void loop() {
  
  /* need to be call regularly in the loop */
  uip.poll();
  
  delay(2000);
  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // check if returns are valid, if they are NaN (not a number) then something went wrong!
  if (isnan(t) || isnan(h)) {
    Serial.println("Failed to read from DHT");
  } else {
    Serial.print("Humidity: "); 
    Serial.print(h);
    Serial.print(" %\t");
    Serial.print("Temperature: "); 
    Serial.print(t);
    Serial.println(" *C");
  }
  
  /*Convert result from float to char *
  mqtt.publish can only send char *
  */
  delay(1000);

      if (mqtt.connected()) {
      Serial.println("Publishing...");
      dtostrf(h, 1, 2, envoi);
      String resultat(envoi);
      resultat = resultat + "#data1#data2#pourcent";
      resultat.toCharArray(resultat2, 100);
      mqtt.publish("test", resultat2);
 
      delay(1000);
      
      dtostrf(t, 1, 2, envoi);
      String resultat3(envoi);
      resultat3 = resultat3 + "#data1#data2#degree";
      resultat3.toCharArray(resultat2, 100);
      mqtt.publish("test", resultat2);
      Serial.println("Published !");
    }else{
    mqtt.connect();
    }
  
  /*need to be call regularly in the loop */
  uip.poll();
  
}
