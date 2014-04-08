#include <NanodeUNIO.h>
#include <NanodeUIP.h>
#include <NanodeMQTT.h>

/* create with
http://www.dfrobot.com/community/diy-your-own-air-quality-monitor-with-arduino.html
https://mail.google.com/mail/u/0/?shva=1#inbox/143d5be4d9046d50
Modified by Rodolphe Freby, on 2014/01/18
*/


/*For Ethernet and MQTT */
NanodeMQTT mqtt(&uip);
char buf[20];
char envoi[100];
char resultat2 [100];

/*For the sensor */
int CH4_PIN = 0;
int RL_CH4 = 22000;
int CH4_air_ratio = 4.5;
float CH4Curve[] = {2.3, 0.26, -0.45};
float RO_CH4;
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
}

void loop() {
  /* need to be call regularly in the loop */
  uip.poll();

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
  resultat = "notreIDici#" + resultat;
  resultat.toCharArray(resultat2, 100);
    if (mqtt.connected()) {
      Serial.println("Publishing...");
      
      mqtt.publish("test", resultat2);
      Serial.println("Published !");
    }else{
      Serial.println("Reconnexion");
      mqtt.set_server_addr(10, 1, 0, 40);
      mqtt.connect();
    }
  }
}
