// ==========================================
// ARIES v2.0 + ESP01 + DHT11 + Moisture + Motors + Servo
// Sends sensor data, runs motors, drops sensor when stopped
// ==========================================

#include <pwm.h>   // Required to unlock hardware PWM on ARIES
#include <Servo.h> // Required for Servo control

// --- Sensor Pins & Serial ---
#define DHT11_PIN 0
#define MOISTURE_PIN A0

UARTClass espSerial(1);
#define DEBUG_SERIAL Serial

// --- WiFi & Backend ---
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverIP = "YOUR_SERVER_IP";
const int serverPort = 5000;

// --- DHT Variables ---
uint8_t humidity_int, humidity_dec, temp_int, temp_dec, checksum;

// --- Motor Connections ---
#define enA  0// Hardware PWM0 header
int in1 = 4; // Aries GPIO4
int in2 = 5; // Aries GPIO5

#define enB  1 // Hardware PWM1 header
int in3 = 6; // Aries GPIO6
int in4 = 7; // Aries GPIO7

// Fixed speed value (20% of 800000)
long MSPEED = 800000; 
long SPEED = 200000; 

// --- Servo Connections ---
#define CH 2 // connect signal PIN to PWM-2 of Aries Board
Servo myservo;  
int angle; 

// ===============================
// SETUP
// ===============================
void setup() {
  // 1. Initialize Serial
  DEBUG_SERIAL.begin(115200);
  espSerial.begin(115200);
  delay(2000);

  DEBUG_SERIAL.println("Starting ARIES + ESP01 + Sensors + Motors + Servo");

  // 2. Initialize Servo
  myservo.attach(CH);  

  // 3. Initialize Motors
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT);
  pinMode(in4, OUTPUT);
  
  PWM.PWMC_Set_Period(enA, MSPEED);  
  PWM.PWMC_Set_Period(enB, MSPEED);
  stopMotors();

  // 4. Initialize ESP-01 & WiFi
  sendCommand("AT+RST", 3000);
  delay(2000);

  sendCommand("AT", 2000);
  sendCommand("AT+CWMODE=1", 2000);

  connectWiFi();

  DEBUG_SERIAL.println("System Ready");
}

// ===============================
// MAIN LOOP
// ===============================
void loop() {
  // --- 1. Read and Send Sensor Data ---
  int moisture = analogRead(MOISTURE_PIN);
  int status = read_dht11();

  if(status == 0) {
    DEBUG_SERIAL.print("Temp: ");
    DEBUG_SERIAL.print(temp_int);
    DEBUG_SERIAL.print(".");
    DEBUG_SERIAL.print(temp_dec);

    DEBUG_SERIAL.print("  Humidity: ");
    DEBUG_SERIAL.print(humidity_int);
    DEBUG_SERIAL.print(".");
    DEBUG_SERIAL.print(humidity_dec);

    DEBUG_SERIAL.print("  Moisture: ");
    DEBUG_SERIAL.println(moisture);

    sendSensorData(moisture);
  }
  else if(status == -1) {
    DEBUG_SERIAL.println("DHT Timeout");
  }
  else if(status == -2) {
    DEBUG_SERIAL.println("Checksum Error");
  }

  // --- 2. Motor Movement & Servo Routine ---
  moveForward();
  delay(2000); 

  stopMotors();
  drop_sensor(); // Activate servo when stopped
  delay(1000); 

  moveForward();
  delay(2000); 
  
  stopMotors();
  drop_sensor(); // Activate servo when stopped
  delay(1000); 

  moveForward();
  delay(1000); 

  stopMotors();
  drop_sensor(); // Activate servo when stopped
  delay(1000);

 moveForward();
  delay(1000); 

  stopMotors();
  drop_sensor(); // Activate servo when stopped
  delay(2000); // Wait before repeating the whole loop
}

// ===============================
// SERVO FUNCTION
// ===============================
void drop_sensor() {
  DEBUG_SERIAL.println("Dropping sensor...");
  for(angle = 0; angle <= 120; angle++) {
    myservo.write(angle);             
    delay(15); // Added small delay for a smooth physical sweep
  }
  
  delay(3000); // Keep sensor dropped for 3 seconds
  
  DEBUG_SERIAL.println("Retracting sensor...");
  for(angle = 120; angle >= 0; angle--) {
    myservo.write(angle);             
    delay(15); // Added small delay for a smooth physical sweep
  }
}

// ===============================
// SENSOR FUNCTIONS
// ===============================
int read_dht11() {
  uint8_t bits[5] = {0,0,0,0,0};
  uint8_t i, j=0;
  uint16_t timeout;

  pinMode(DHT11_PIN, OUTPUT);
  digitalWrite(DHT11_PIN, LOW);
  delay(18);

  digitalWrite(DHT11_PIN, HIGH);
  delayMicroseconds(30);

  pinMode(DHT11_PIN, INPUT);

  timeout = 10000;
  while(digitalRead(DHT11_PIN)==LOW) { if(--timeout==0) return -1; }

  timeout = 10000;
  while(digitalRead(DHT11_PIN)==HIGH) { if(--timeout==0) return -1; }

  for(j=0; j<5; j++) {
    uint8_t result=0;
    for(i=0; i<8; i++) {
      timeout = 10000;
      while(digitalRead(DHT11_PIN)==LOW) { if(--timeout==0) return -1; }
      
      delayMicroseconds(30);

      if(digitalRead(DHT11_PIN)==HIGH) {
        result |= (1<<(7-i));
        timeout = 10000;
        while(digitalRead(DHT11_PIN)==HIGH) { if(--timeout==0) return -1; }
      }
    }
    bits[j] = result;
  }

  humidity_int = bits[0];
  humidity_dec = bits[1];
  temp_int = bits[2];
  temp_dec = bits[3];
  checksum = bits[4];

  if((uint8_t)(humidity_int + humidity_dec + temp_int + temp_dec) != checksum)
    return -2;

  return 0;
}

// ===============================
// WIFI & ESP FUNCTIONS
// ===============================
void connectWiFi() {
  char cmd[128];
  sprintf(cmd, "AT+CWJAP=\"%s\",\"%s\"", ssid, password);

  DEBUG_SERIAL.println("Connecting WiFi...");
  sendCommand(cmd, 15000);
  delay(3000);

  sendCommand("AT+CIFSR", 3000);
}

void sendSensorData(int moisture) {
  char json[200];
  sprintf(json,
    "{\"device_id\":\"aries_v2\",\"temperature\":%d.%d,\"humidity\":%d.%d,\"soil_moisture\":%d}",
    temp_int, temp_dec, humidity_int, humidity_dec, moisture);

  DEBUG_SERIAL.print("JSON: ");
  DEBUG_SERIAL.println(json);

  char request[350];
  sprintf(request,
    "POST /sensor-data HTTP/1.1\r\n"
    "Host: %s:%d\r\n"
    "Content-Type: application/json\r\n"
    "Content-Length: %d\r\n"
    "\r\n"
    "%s",
    serverIP, serverPort, strlen(json), json);

  char cipStart[64];
  sprintf(cipStart, "AT+CIPSTART=\"TCP\",\"%s\",%d", serverIP, serverPort);
  sendCommand(cipStart, 5000);

  char sendCmd[32];
  sprintf(sendCmd, "AT+CIPSEND=%d", strlen(request));
  sendCommand(sendCmd, 2000);

  DEBUG_SERIAL.println("Sending HTTP Request...");
  espSerial.print(request);
  delay(2000);

  sendCommand("AT+CIPCLOSE", 2000);
}

void sendCommand(const char* command, const int timeout) {
  DEBUG_SERIAL.print("Sending: ");
  DEBUG_SERIAL.println(command);

  espSerial.println(command);
  unsigned long time = millis();

  while((time + timeout) > millis()) {
    while(espSerial.available()) {
      char c = espSerial.read();
      DEBUG_SERIAL.print(c);
    }
  }
}

// ==========================================
// MOVEMENT FUNCTIONS
// ==========================================
void moveForward() {
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  digitalWrite(in3, HIGH);
  digitalWrite(in4, LOW);  
  analogWrite(enA, SPEED);
  analogWrite(enB, SPEED);  
}

void moveBackward() {
  digitalWrite(in1, LOW);
  digitalWrite(in2, HIGH);
  digitalWrite(in3, LOW);
  digitalWrite(in4, HIGH);  
  analogWrite(enA, SPEED);
  analogWrite(enB, SPEED);  
}

void turnRight() {
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  digitalWrite(in3, LOW);
  digitalWrite(in4, HIGH);  
  analogWrite(enA, SPEED);
  analogWrite(enB, SPEED);  
}

void turnLeft() {
  digitalWrite(in1, LOW);
  digitalWrite(in2, HIGH);
  digitalWrite(in3, HIGH);
  digitalWrite(in4, LOW);  
  analogWrite(enA, SPEED);
  analogWrite(enB, SPEED);  
}

void stopMotors() {
  digitalWrite(in1, LOW);
  digitalWrite(in2, LOW);
  digitalWrite(in3, LOW);
  digitalWrite(in4, LOW);  
  analogWrite(enA, 0);
  analogWrite(enB, 0);  
}
