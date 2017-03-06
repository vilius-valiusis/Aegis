var nameInput = document.getElementById("driverName");
var empNumInput = document.getElementById("employeeNum");//values gotten for adding driver 
var driverToRemove = document.getElementById("DriverToRemove");
var user;


var config = {
    apiKey: "AIzaSyCH6ZU9ioqOgY6eHQGSud8tjv9B7bHJyWE",
    authDomain: "aegisdb-d2621.firebaseapp.com",
    databaseURL: "https://aegisdb-d2621.firebaseio.com",
    storageBucket: "aegisdb-d2621.appspot.com",
    messagingSenderId: "704168915813"
  };
firebase.initializeApp(config);
//inital setup of database  


var currentVehicleRegAsString= localStorage.getItem('searchedVehicle') || null;
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    document.getElementById("login").innerHTML="logout";
	document.getElementById("login").setAttribute("href","logout.html");
	} 
  else{
	document.getElementById("login").innerHTML="login";
	document.getElementById("login").setAttribute("href","login.html");
  }
});

function checkAuth(functToRun){
	console.log(functToRun);
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
   	window.alert(user.uid);
	runner(functToRun);
  } 
  else{
	window.alert("Error you are not logged in");
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
	else if(functToRun === "Add driver")
	{
		addDriver();
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
	
	
}





var theftListRef = firebase.database().ref('THEFTS');
//code for changing log in with log out



//end code for changing log in with log out

//code for adding drivers to the firebase  
function addDriver()
{	
	var driverName = nameInput.value; 
	var employeeNumber = empNumInput.value;
	var key = JSON.parse(currentCompanyRefAsString);
	
	var newDriver = corporateRef.child(key).child('DRIVERS').push(); //create new child on driver table with attibutes of name and employeeNum with values entered by user
	/*newDriver.set({
	'EMAIL':
	'EMP_ID': employeeNumber
	'FIRSTNAME': driverName,
	'LASTNAME':
	'MOBILE':
	'VEH_REG':*/
	//});
}
//code for adding driver to firebase ends here

//code for removeing drivers from firebase
function removeDriver()
{	
	var key = JSON.parse(currentCompanyRefAsString);
	var driverIDToRemove = document.getElementById("DriverToRemove").value; 
	corporateRef.child(key).child('DRIVERS').on('child_added',function(snapshot,prev){ //look through all divers on table and delete the one who's employee ID matches the one entered
		if(snapshot.child("Employee Number").val() == driverIDToRemove)
		{
			snapshot.ref.remove();
		}	
	});
}
//code for removing driver from datbase ends here
function listVechicle(){
//add vehicle from database to table
var VehicleTable = document.getElementById("VehicleTable");
var counter=0;
//add row to table for every child in object, then populate row with reg num,make,colour,model
console.log("I hate you");
var user = firebase.auth().currentUser;
firebase.database().ref('CORPORATE/'+user.uid+'/V_KEYS').on('child_added',function(vKey,prevVkey){
	console.log("hi");
	firebase.database().ref('CORPORATE/'+user.uid+'/VEHICLES/'+ vKey.key).once('value',function(snapshot){
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
var user = firebase.auth().currentUser;


firebase.database().ref('CORPORATE/'+user.uid+'/D_KEYS').on('child_added',function(driverKey,prevDKey){
	
	firebase.database().ref('CORPORATE/'+user.uid+'/DRIVERS/'+driverKey.key).once('value',function(snapshot){
	
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
	var key = JSON.parse(currentCompanyRefAsString);
	var Veh_Reg = JSON.parse(currentVehicleRegAsString);
	corporateRef.child(key).child('VEHICLES').child(Veh_Reg).child('LOCATION').once('value',function(snapshot){ //look at the current gps coords object for the vehicle
	var longLocationFl=parseFloat(snapshot.child("LONG").val());  //get lat and long values from object then cast it to float
	var latLocationFl=parseFloat(snapshot.child("LAT").val());
	pos = {//create veriable for the new current lat/long
		lat: latLocationFl,
		lng: longLocationFl
		};
	GPSmap.setCenter(pos);  //update map and marker with new postion
	currentPosition.setPosition(pos);
    });
  corporateRef.child(key).child('VEHICLES').child(Veh_Reg).child('LOCATION').on('child_changed',function(snapshot,prev){	
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
    var loginEmail=document.getElementById("email address").value;
	var loginPassword=document.getElementById("password").value;
	firebase.auth().signInWithEmailAndPassword(loginEmail,loginPassword).then(function(){
		window.alert("login successful");
		user = firebase.auth().currentUser;
		setObjects();
	},function(error) {
		window.alert("An error occured loging you in");
	});
  
}
  //login code ends
//logout code 
function logout()
{
	firebase.auth().signOut().then(function() {
		clearObjects();
		window.alert("logout sucessful");
		
  window.location.href = "welcomePage.html";
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
var user = firebase.auth().currentUser;
	firebase.database().ref('CORPORATE/'+user.uid+'/V_KEYS').on('child_added',function(vKey,prev){
		if (vKey.key == reg.value)
		{
			console.log(vKey.key)
			localStorage.setItem('searchedVehicle',JSON.stringify(vKey.key));
			 window.location.href = "options.html";
		}
	});
	
	
}

function readAnalytics()
{
	var Veh_Reg = JSON.parse(currentVehicleRegAsString);
	var travelLog = document.getElementById("travelLog");
	var counter=0;
	var JourneyNum=1;
	
var user = firebase.auth().currentUser;

firebase.database().ref('CORPORATE/' +user.uid+'/VEHICLES/'+Veh_Reg+'/LOG').on('child_added',function(snapshot){

		var latln = {lat: parseFloat(snapshot.child('LAT').val()) , lng: parseFloat(snapshot.child('LONG').val())}
		var geocoder = new google.maps.Geocoder;
		var string="";
		if((counter%2) == 0)
		{
			geocoder.geocode({'location':latln},function(results, status){
				
				if (status === 'OK')
				{
				
					string+=results[1].formatted_address;
				}
				
			});
			string+="<h3>Journey " + JourneyNum + "</h3>";
			string+="<BR>Starting date:";
			string+=snapshot.child('DATE').val();
			string+="<BR>Starting location:";
			
			
			string+="<BR>Starting time:";
			string+=snapshot.child('TIME').val();
			
		}
		else
		{
			string+="<BR>Ending date:";
			string+=snapshot.child('DATE').val();
			geocoder.geocode({'location':latln},function(results,status){
				if(status === 'OK')
				{	
					string+="<BR>Ending location:";
					string+=results[1].formatted_address;
				}
			});
			
			string+="<BR>Ending time:";
			string+=snapshot.child('TIME').val();

			string+="<HR>";
			JourneyNum++;
			
		}
		travelLog.innerHTML+=string;
		counter++;
	}); 
}