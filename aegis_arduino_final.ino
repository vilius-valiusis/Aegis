
#define CUSTOM_SETTINGS
#define INCLUDE_PUSH_BUTTON_SHIELD
#define INCLUDE_SMS_SHIELD
#define INCLUDE_CAMERA_SHIELD
#define INCLUDE_TWITTER_SHIELD
#define INCLUDE_FACEBOOK_SHIELD
#define INCLUDE_GPS_SHIELD
#define INCLUDE_INTERNET_SHIELD
#define INCLUDE_CLOCK_SHIELD


#include <stdlib.h>
#include <string.h>


#include <OneSheeld.h>

boolean isMessageSent = false;
int hour, minute, second, day, month, year;
const int  buttonOne = 2;
const int  buttonTwo = 4;
const int  buttonThree = 7;
const int ledOne = 13;
const int ledTwo = 12;
const int ledThree = 8;
int buttonStateOne = LOW;
int buttonStateTwo = LOW;
int buttonStateThree = LOW;
unsigned long previousMillis = 0;
const long interval = 1000;
int ledStateOne = LOW;
int ledStateTwo = LOW;
int ledStateThree = LOW;
float longitude = 0;
float latitude = 0;

void setup() {

  pinMode(buttonOne, INPUT);
  pinMode(buttonTwo, INPUT);
  pinMode(buttonThree, INPUT);
  pinMode(ledOne, OUTPUT);
  pinMode(ledTwo, OUTPUT);
  pinMode(ledThree, OUTPUT);
  // initialize serial communication:
  Serial.begin(9600);
  OneSheeld.begin();

}



void sendGPS(int choice ) {


  float longitude = GPS.getLongitude();
  float latitude = GPS.getLatitude();

  
  /*
    Convert Lat to string and connect to json
  */
  String latKey = "{\"LAT\":";
  String latToString = String(latitude, 4);
  String latValue = "\"" + latToString + "\"";
  String latCombine = latKey + latValue;

  /*
    Convert Long to string and connect to json
  */
  String longKey = "\"LONG\":";
  String longToString = String(longitude, 4);
  String longValue = "\"" + longToString + "\"}";
  String longCombine = longKey + longValue;

  String combineCoordinates = latCombine + "," + longCombine;

  /*
    --------------------------------------------------------------------------------------------
    Add Date and Time to Database
  */

  String dayToString = String(day);
  String monthToString = String(month);
  String yearToString = String(year);
  String dateFormat = dayToString + "/" + monthToString + "/" + yearToString;

  String hourToString = String(hour);
  String minuteToString = String(minute);
  String secondToString = String(second);
  String timeFormat = hourToString + ":" + minuteToString + ":" + secondToString;

  /*
     -----------------------------------------------------------------------------------------------------
     Combine the journey data
  */

  String dateKey = "{\"DATE\":";
  String dateValue = "\"" + dateFormat + "\"" + ",";
  String dateCombine = dateKey + dateValue;

  String timeKey =  "\"TIME\":";
  String timeValue = "\"" + timeFormat + "\"" + ",";
  String timeCombine = timeKey + timeValue;

  String latKeyTwo = "\"LAT\":";
  String latValueTwo = "\"" + latToString + "\"" + ",";
  String latCombineTwo = latKeyTwo + latValueTwo;

  String longKeyTwo = "\"LONG\":";
  String longValueTwo = "\"" + longToString + "\"" + "}";
  String longCombineTwo = longKeyTwo + longValueTwo;

  String combineJourney = dateCombine + timeCombine + latCombineTwo + longCombineTwo;


  if (choice == 1) {

    /*
      Send LOCATION data to Database
    */
    HttpRequest sendLocation("https://aegisdb-d2621.firebaseio.com/PRIVATE/DRIVERS/pENCUG0ZGRMfsBAT33wLW9KTZf73/LOCATION.json?auth=Egse5l7S1EqtlhNLggksqfMre8YqlIbQDbPM2fUT");
    sendLocation.setContentType("application/json");
    sendLocation.addRawData(combineCoordinates.c_str() );
    Internet.performPut(sendLocation);

  } else {
    /*
      Send Journey Data to database
    */
    HttpRequest sendJourney("https://aegisdb-d2621.firebaseio.com/PRIVATE/DRIVERS/pENCUG0ZGRMfsBAT33wLW9KTZf73/LOG.json?auth=Egse5l7S1EqtlhNLggksqfMre8YqlIbQDbPM2fUT");
    sendJourney.setContentType("application/json"); 
    sendJourney.addRawData(combineJourney.c_str() );
    Internet.performPost(sendJourney);


  }

}

void alertOwner(){
  
  if (!isMessageSent)
    {
      /* Send the SMS. */
      SMS.send("0879554823", "Someone is trying to break into your car!");
      /* Set the flag. */
      isMessageSent = true;

      /*Send GPS to Database*/
      sendGPS(1);
      /*
        Loop For taking pics
      */
      int count = 2;
      while (count > 1) {
        /* Wait for 10 seconds. */
        OneSheeld.delay(3000);

        Camera.setFlash(ON);
        /* Take the picture. */
        Camera.rearCapture();
        /* Wait for 10 seconds. */
        OneSheeld.delay(10000);
        /* Post the picture on Twitter. */
        //Twitter.tweetLastPicture("Posted by @MS6023dcom");

        Facebook.postLastPicture("Intruder Alert" , 0);
        //HttpRequest oneSheeld("gs://aegisdb-d2621.appspot.com/Test/");
        //oneSheeld.addLastImageAsRawEntity(0);

        count --;
      }

    }
    else
    {
      /* Reset the flag. */
      isMessageSent = false;
    } 
    

  }



void loop() {

  Clock.queryDateAndTime();
  

  hour = Clock.getHours();
  minute = Clock.getMinutes();
  second = Clock.getSeconds();
  day = Clock.getDay();
  month = Clock.getMonth();
  year = Clock.getYear();

  buttonStateOne = digitalRead(buttonOne);
  buttonStateTwo = digitalRead(buttonTwo);
  buttonStateThree = digitalRead(buttonThree);
  unsigned long currentMillis = millis();


  if(ledStateThree == HIGH){
    delay(30000);

    sendGPS(1);
    }
  //--------------------------------------------------------------------------------

  if (buttonStateTwo == HIGH && ledStateThree == LOW) {
    
    if (ledStateTwo == HIGH) {
      delay(1000);
      ledStateTwo = LOW;
      digitalWrite(ledTwo, ledStateTwo);
    } else {
      ledStateTwo = HIGH;
      digitalWrite(ledTwo, ledStateTwo);
    }
  }
  //----------------------------------------------------------------------------
  if (buttonStateThree == HIGH && ledStateTwo == LOW) {

    
    
    if (buttonStateThree == HIGH) {
      delay(1000);
      if (ledStateThree == HIGH) {
        ledStateThree = LOW;
        digitalWrite(ledThree, ledStateThree);
      } else {
        ledStateThree = HIGH;
        digitalWrite(ledThree, ledStateThree);
      }
    }
    sendGPS(0); //not tested
  }
  //-----------------------------------------------------------------------------

  if (buttonStateOne == HIGH && ledStateTwo == HIGH ) {

    /*if (currentMillis - previousMillis >= interval) {
      // save the last time you blinked the LED
      previousMillis = currentMillis;
      }*/

      
    if (buttonStateOne == HIGH) {
      delay(1000);
      if (ledStateOne == HIGH) {
        ledStateOne = LOW;
        digitalWrite(ledOne, ledStateOne);
      } else {
        ledStateOne = HIGH;
        digitalWrite(ledOne, ledStateOne);
        alertOwner();
      }
    }

  }
}









