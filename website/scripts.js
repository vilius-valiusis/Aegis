//values gotten for adding driver 
var driverToRemove = document.getElementById("DriverToRemove");
var userId;


var config = {
    apiKey: "AIzaSyCH6ZU9ioqOgY6eHQGSud8tjv9B7bHJyWE",
    authDomain: "aegisdb-d2621.firebaseapp.com",
    databaseURL: "https://aegisdb-d2621.firebaseio.com",
    storageBucket: "aegisdb-d2621.appspot.com",
    messagingSenderId: "704168915813"
  };
firebase.initializeApp(config);
var secondaryApp= firebase.initializeApp(config,"secondaryApp");
//inital setup of database  

var currentVehicleRegAsString= localStorage.getItem('searchedVehicle') || null;
firebase.auth().onAuthStateChanged(function(user) {
  if (!user) 
  {
	document.getElementById("logout").style.visibility="hidden";
	if(document.getElementById("welcomeNavBar")!=null)
	{
		document.getElementById("welcomeNavBar").style.visibility="hidden";
	}
	
  } 
  else
  {
	document.getElementById("login").style.visibility="hidden";  
	
  }
});

function checkAuth(functToRun){
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
   	userId=user.uid;
	runner(functToRun);
  } 
});
}


function runner(functToRun)
{
	if (functToRun === "List Drivers")
	{
		listDrivers();
	}
	else if(functToRun === "List Vehicles")
	{
		listVechicle();
	}
	else if(functToRun === "Remove driver")
	{
		removeDriver();
	}
	else if(functToRun === "Read analytics")
	{
		readAnalytics();
	}
	else if(functToRun === "GPS")
	{
		loadCords();
	}
	else if(functToRun === "Hotspots")
	{
		loadHotspots();
	}
	else if (functToRun === "add Driver")
	{
		populateSelect();
	}
	
	
}





var theftListRef = firebase.database().ref('THEFTS');
//code for changing log in with log out

function populateSelect()
{
	var selectTag = document.getElementById("vehicleDropDown");
	
	firebase.database().ref('CORPORATE/'+userId+'/V_KEYS').on('child_added',function(snapshot){
		var option = document.createElement("option"); 
		option.setAttribute("value",snapshot.key);
		var	optionText =document.createTextNode(snapshot.key);
		option.appendChild(optionText);
		document.getElementById("vehicleDropDown").appendChild(option);
	});
}

//end code for changing log in with log out

//code for adding drivers to the firebase
function createNewAuthUser()//add callback
{
	var emailImput = document.getElementById("driverEmail");
	var passwordInput = document.getElementById("password");
	var driverEmail =emailImput.value;
	var driverPassword = passwordInput.value;
	var driverKey;
	secondaryApp.auth().createUserWithEmailAndPassword(driverEmail, driverPassword).then(function(firebaseUser) {
    driverKey=firebaseUser.uid;
    //I don't know if the next statement is necessary 
    secondaryApp.auth().signOut();
	addDriver(driverEmail,driverKey);
});
}  
function addDriver(driverEmail,driverKey)
{	
	
	var empNumInput = document.getElementById("employeeID");
	var firstNameInput = document.getElementById("firstName");
	var lastNameInput = document.getElementById("lastName");
	var mobileInput = document.getElementById("mobile");
	var vehicleRegInput = document.getElementById("vehicleDropDown");
	
	
	var employeeNumber = empNumInput.value;
	var driverFirstName = firstNameInput.value;
	var driverLastName = lastNameInput.value;
	var driverMobile = mobileInput.value;
	var driversVehicleReg = vehicleRegInput.options[vehicleRegInput.selectedIndex].value;
	
	
	var newDriver = firebase.database().ref('CORPORATE/' + userId + '/DRIVERS').child(driverKey).set({
	'EMAIL': driverEmail,
	'EMP_ID': employeeNumber,
	'FIRSTNAME': driverFirstName,
	'LASTNAME':driverLastName,
	'MOBILE':driverMobile,
	'VEH_REG':driversVehicleReg
	}); //create new child on driver table with attibutes of name and employeeNum with values entered by user
	var newDriver = firebase.database().ref('CORPORATE/'+userId+'/D_KEYS').push().set(driverKey);
	
	firebase.database().ref('CORPORATE/'+userId+'/V_KEYS').on('child_added',function(vKey,prevVkey){
		if (vKey.key === driversVehicleReg)
		{
			var newDriver = firebase.database().ref('CORPORATE/'+userId+'/VEHICLES/'+vKey.key+'/DRIVERS').push().set(employeeNumber);
			window.alert("Driver successfully added!");
			window.location.href="ManagmentFeatures.html";
		}
	});
	
	
	
}
//code for adding driver to firebase ends here

//code for removeing drivers from firebase
function removeDriver()
{	
	var driverExists = false;
	var driverIDToRemove = document.getElementById("DriverToRemove").value; 
	firebase.database().ref('CORPORATE/'+userId+'/DRIVERS/').on('child_added',function(snapshot,prev){ //look through all divers on table and delete the one who's employee ID matches the one entered
		if(snapshot.val().EMP_ID == driverIDToRemove)
		{
			driverExists=true;
			firebase.database().ref('CORPORATE/'+userId+'/V_KEYS').on('child_added',function(vKey,prevVkey){
				if (vKey.key === snapshot.val().VEH_REG)
				{
					firebase.database().ref('CORPORATE/'+userId+'/VEHICLES/'+vKey.key+'/DRIVERS').on('child_added',function(vehicleDriver,prev){
						
						if (vehicleDriver.val() == driverIDToRemove)
						{
							vehicleDriver.ref.remove();
						}
					});
					firebase.database().ref('CORPORATE/'+userId+'/D_KEYS').on('child_added',function(driverKey,prev){
						if(driverKey.val() === snapshot.key)
						{
							driverKey.ref.remove();
						}
					});
					snapshot.ref.remove();
					window.alert("Driver removed");
					window.location.href="ManagmentFeatures.html";
				}
		
			});
	
		}	
	});
	setTimeout(function(){
	if(driverExists == false)
	{
		window.alert("No driver with that driver ID exists please try a valid one");
	}	
	},3000);
	
}
//code for removing driver from datbase ends here
function listVechicle(){
//add vehicle from database to table
var VehicleTable = document.getElementById("VehicleTable");
var counter=0;
//add row to table for every child in object, then populate row with reg num,make,colour,model


firebase.database().ref('CORPORATE/'+userId+'/V_KEYS').on('child_added',function(vKey,prevVkey){
	firebase.database().ref('CORPORATE/'+userId+'/VEHICLES/'+ vKey.key).once('value',function(snapshot){
		console.log(vKey.key);
		var row = VehicleTable.insertRow(counter);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);
		var cell4 = row.insertCell(3);
		cell1.innerHTML = snapshot.val().COLOUR;
		cell2.innerHTML = snapshot.val().MAKE;
		cell3.innerHTML = snapshot.val().MODEL;
		cell4.innerHTML = snapshot.val().VEH_REG;
		counter++;	
	});
});
//code for adding vehicle from database ends here
}
function listDrivers()
{//add drivers to table code
var DriversTable = document.getElementById("driverTable");
var counter=0;//make counter for insertRow perposes
//add a row to the table for every child in the object. then populate it with employee number and name

//companyRef


firebase.database().ref('CORPORATE/'+userId+'/D_KEYS').on('child_added',function(driverKey,prevDKey){
	firebase.database().ref('CORPORATE/'+userId+'/DRIVERS/'+driverKey.val()).once('value',function(snapshot){
			var row = DriversTable.insertRow(counter);
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);
			var cell4 = row.insertCell(3);
			var cell5 = row.insertCell(4);
			var cell6 = row.insertCell(5);
			cell1.innerHTML = snapshot.val().EMAIL;
			cell2.innerHTML = snapshot.val().EMP_ID;
			cell3.innerHTML = snapshot.val().FIRSTNAME;
			cell4.innerHTML = snapshot.val().LASTNAME;
			cell5.innerHTML = snapshot.val().MOBILE;
			cell6.innerHTML = snapshot.val().VEH_REG;
			counter++;	
	});
});
//add drivers to table code ends
}
//Real time map code
var GPSmap; 
var currentPosition; //create veriables for map and real time tracking marker
function initRealTimeMap() {
		 //get location from database
        GPSmap = new google.maps.Map(document.getElementById('map'), { //until location from firebase is gotten use this default
          center: {lat: 51.50, lng: -8.53},
			zoom: 16
		});
		//make default marker for new positions from database to overrite
		currentPosition = new google.maps.Marker({
			postion:{lat:51.50, lng:-8.53},
			map:GPSmap
		});		
}
var pos;
function loadCords(){ //load cords from firebase and cast it to float. then change location and center for map and marker
	
	var Veh_Reg = JSON.parse(currentVehicleRegAsString);
	firebase.database().ref('CORPORATE/'+userId+'/VEHICLES/'+Veh_Reg+'/LOCATION').once('value',function(snapshot){ //look at the current gps coords object for the vehicle

	var longLocationFl=parseFloat(snapshot.child("LONG").val());  //get lat and long values from object then cast it to float
	var latLocationFl=parseFloat(snapshot.child("LAT").val());
	pos = {//create veriable for the new current lat/long
		lat: latLocationFl,
		lng: longLocationFl
		};
	GPSmap.setCenter(pos);  //update map and marker with new postion
	currentPosition.setPosition(pos);
    });
	firebase.database().ref('CORPORATE/'+userId+'/VEHICLES/'+Veh_Reg+'/LOCATION').on('child_changed',function(snapshot,prev){	
	//if a child(cords) is changed do the loadCords method again
	loadCords(); 
	}); 
}	
//real time map code finish

//hotspots code 
var hotspotsMap;
var theftLocations=[];
var theftTimes=[];  
var theftMarkers=[];    //create map and marker veriables
function initHotspotsMap() {
//		loadHotspots(); //load cordenets from database while initsing map
		hotspotsMap = new google.maps.Map(document.getElementById('map'), {
          zoom: 5,
          center:{lat:51.50,lng:-8.53}   //coded to start with a few view of Ireland
        });
		  var input = document.getElementById("pac-input");
        var searchBox = new google.maps.places.SearchBox(input);
        hotspotsMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
		
		hotspotsMap.addListener('bounds_changed', function() {
          searchBox.setBounds(hotspotsMap.getBounds());
        });
		
		
		searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

         
          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            
            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          hotspotsMap.fitBounds(bounds);
        });
	   
 
}
     
function loadHotspots(){	
  
	  theftListRef.on('child_added',function(snapshot,prev){    //look through all childeren in then theft object
		  var longLocationFlHS=parseFloat(snapshot.child("LONG").val());  //get lat and long values from object then cast it to float
		  var latLocationFlHS=parseFloat(snapshot.child("LAT").val());
		  var time=snapshot.child("TIME").val();
		  time = time.substring(0,time.length -3);
		  theftLocations.push({lat:latLocationFlHS,lng:longLocationFlHS});
		  theftTimes.push(time);
		  	
	  });
	  
	  theftListRef.once("value",function(snapshot){
			
	  theftMarkers=theftLocations.map(function(theftLocation , i){
		  return new google.maps.Marker({
            position: theftLocation,
            label: theftTimes[i % theftTimes.length]
			
		});
	  });
		var markerCluster = new MarkerClusterer(hotspotsMap, theftMarkers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
			
	  });
}
  //hotspots code finish

  
  //login code
function login()
{
    var loginEmail=document.getElementById("emailAddress").value;
	var loginPassword=document.getElementById("password").value;
	var isValid=true;
	if(loginEmail=="")
	{
		isValid=false;
		window.alert("Email address must be filled out");
	}
	else if (!loginEmail.includes("@") || !loginEmail.includes("."))
	{
		isValid=false;
		window.alert("Not a valid email address");
	}
	if (loginPassword == "")
	{
		isValid=false;
		window.alert("Password must be filled in");
	}
	if(isValid)
	{
		firebase.auth().signInWithEmailAndPassword(loginEmail,loginPassword).then(function(){
			window.alert("login successful");
			user = firebase.auth().currentUser;
			setObjects();
		},function(error) {
			window.alert("An error occured loging you in");
		});
	}
}
  //login code ends
//logout code 
function logout()
{
	firebase.auth().signOut().then(function() {
		clearObjects();
		window.alert("logout sucessful");
		window.location.href = "index.html";
}, function(error) {
  window.alert("an error has occured signing you out ");
});
}
//end logout code  
function setObjects()
{
	var ref =firebase.database().ref('CORPORATE/C_KEYS'); 
	ref.on('child_added',function(snapshot,prev){
		
		if(snapshot.getKey() === user.uid)
		{
			
			localStorage.setItem('currentCompany',JSON.stringify(snapshot.getKey()));
			window.location.href="FeaturesPage.html";
		}
			
		
	});
}
function clearObjects()
{
	localStorage.clear();
}

function searchCarReg()
{
	var reg = document.getElementById("search");
	if(reg.value!="")
	{
		var isFound =false;
		var user = firebase.auth().currentUser;
		firebase.database().ref('CORPORATE/'+userId+'/V_KEYS').on('child_added',function(vKey,prev){
			if (vKey.key == reg.value)
			{
				isFound=true;
				console.log(vKey.key)
				localStorage.setItem('searchedVehicle',JSON.stringify(vKey.key));
				 window.location.href = "options.html";
			}
		});
		if(!isFound)
		{
			window.alert("No vehicle matches that reg number");
		}
	}
	else
	{
		window.alert("Please enter a reg number");
	}
	
}
function validateRemove()
{
	var empNum = document.getElementById("DriverToRemove");
	
	if(empNum.value!="")
	{
		checkAuth('Remove driver');	
	}
	else
	{
		window.alert("Please enter a Employee Number");
	}
}

function validateAdd()
{
	var fName = document.getElementById("firstName");
	var lName = document.getElementById("lastName");
	var email = document.getElementById("driverEmail");
	var phone = document.getElementById("mobile");
	var empNum = document.getElementById("employeeID");
	var password = document.getElementById("password");
	var isValidated=true;
	
	if (fName.value=="")
	{
		isValidated=false; 
		window.alert("First name must be filled out");
	}
	if(/\d/g.test(fName.value))
	{
		isValidated=false;
		window.alert("First name cannot contain numbers");
	}
	
	
	if (lName.value=="")
	{
		isValidated=false; 
		window.alert("Last name must be filled out");
	}
	if(/\d/g.test(lName.value))
	{
		isValidated=false;
		window.alert("Last name cannot contain numbers");
	}
	
	if (email.value=="")
	{
		isValidated=false; 
		window.alert("Email must be filled out");
	}
	
	else if (!email.value.includes("@") || !email.value.includes("."))
	{
		isValidated=false;
		window.alert("Not a valid email address");
	}
	
	if (phone.value=="")
	{
		isValidated=false; 
		window.alert("Mobile phone number must be filled out");
	}
	if(isNaN(phone.value))
	{
		isValidated=false;
		window.alert("Phone number should be numeric only.");
	}
	
	if (empNum.value=="")
	{
		isValidated=false; 
		window.alert("Employee number must be filled out");
	}
	
	
	
	if (password.value=="")
	{
		isValidated=false; 
		window.alert("Password must be filled out");
	}
	else if (password.value.length <6)
	{
		isValidated=false;
		window.alert("Password is weak, please have atleast 6 characters");
	}
	
	if(isValidated)
	{
		console.log("Form valid");
		createNewAuthUser();
	}
}

function getTravelLogChildren(callback)
{
	var travelLog = document.getElementById("travelLog");
	var Veh_Reg = JSON.parse(currentVehicleRegAsString);
	var counter=0;
	var journyNum=1;
	var journys=[];
	firebase.database().ref('CORPORATE/'+userId+'/VEHICLES/'+Veh_Reg+'/LOG').on('child_added',function(snapshot)
	{
		
		locationForTravelLog(snapshot,counter,travelLog,journyNum);
		
	
		counter++;
		if((counter%2) ==0)
		{
			journyNum++;
		}
	});
	
}



function locationForTravelLog(snapshot , counter,travelLog,journyNum)
{
	
		
	var latln = {lat: parseFloat(snapshot.child('LAT').val()) , lng: parseFloat(snapshot.child('LONG').val())}
	var geocoder = new google.maps.Geocoder;
		
		
	setTimeout(function(){
	geocoder.geocode({'location':latln},function(results, status){
		if (status == 'OK')
		{
			
				populateTravelLog(snapshot,results,counter,travelLog,journyNum);
					
			
		}
		else
		{
			alert('Geocode was not successful for the following reason: ' + status);
		}
				
	});},counter*1500);

		
}
function populateTravelLog(snapshot,results,counter,travelLog,journyNum)
{
	var output="";
	if((counter%2) == 0)
	{
			output+="<h3>Journey " +journyNum+ "</h3>";
			output+="<BR>Starting date:";
			output+=snapshot.child('DATE').val();
			output+="<BR>Starting location:";
			output+=results[1].formatted_address;
			output+="<BR>Starting time:";
			output+=snapshot.child('TIME').val();
			
	}
	else
	{
			output+="<BR>Ending date:";
			output+=snapshot.child('DATE').val();
			output+="<BR>Ending location:";
			output+=results[1].formatted_address;			
			output+="<BR>Ending time:";
			output+=snapshot.child('TIME').val();
			output+="<HR>";
			journyNum++;			
	}
		travelLog.innerHTML+=output;
		return true;
}
function readAnalytics()
{
	var Veh_Reg = JSON.parse(currentVehicleRegAsString);
	var assignedDrivers= document.getElementById("assignedDrivers");
	var counter=0;
	var JourneyNum=1;
	

firebase.database().ref('CORPORATE/'+userId+'/VEHICLES/'+Veh_Reg+'/DRIVERS').on('child_added',function(snapshot){
	assignedDrivers.innerHTML+=snapshot.val()+"<BR>";
});

getTravelLogChildren(function(){
	console.log("tttt");
});
}