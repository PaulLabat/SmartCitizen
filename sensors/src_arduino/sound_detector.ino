int value;
float voltage;

void setup(){
  Serial.begin(9600);
  
}


void loop(){
  value = analogRead(A0);
  Serial.println(value);
  delay(1000);
  
}
