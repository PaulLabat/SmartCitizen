int CH4_PIN = 0;
int RL_CH4 = 22000;
int CH4_air_ratio = 4.5;
float CH4Curve[] = {2.3, 0.26, -0.45};
float RO_CH4;
/* create with
http://www.dfrobot.com/community/diy-your-own-air-quality-monitor-with-arduino.html
https://mail.google.com/mail/u/0/?shva=1#inbox/143d5be4d9046d50
Modified by Rodolphe Freby, on 2014/01/18
*/

void setup()
{
  Serial.begin(9600);
  /*preheat the sensor for 15 minutes */
  int i = 0;
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
  //Use the value of Rs to find Ro
  val1 = val1/CH4_air_ratio;
  RO_CH4 = val1;
  
}

void loop()
{
    
  //Serial.println(RO_CH4);
  
 /*Get the value into ppm*/
  int i = 0;
  float val1 = 0;
  for (i=0;i<10;i++)
  {
    int b = analogRead(CH4_PIN);
    val1 += RL_CH4*(1023-b)/b;
    delay(200);
  }//read 10 times in 2 second
  val1 = val1/10;
  float Rs_CH4 = val1;
  float result_CH4 = pow(10,(((log(Rs_CH4/RO_CH4)-CH4Curve[1])/CH4Curve[2]) + CH4Curve[0]));
  Serial.println(result_CH4);
}
