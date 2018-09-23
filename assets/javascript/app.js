// Initialize Firebase
var config = {
    apiKey: "AIzaSyCSBtmL2JihCFsiqOve95k60rFtGaZenOY",
    authDomain: "train-scheduler-c1a68.firebaseapp.com",
    databaseURL: "https://train-scheduler-c1a68.firebaseio.com",
    projectId: "train-scheduler-c1a68",
    storageBucket: "train-scheduler-c1a68.appspot.com",
    messagingSenderId: "1067464721353"
};
firebase.initializeApp(config);
var database = firebase.database();

// Variable Declarations
var trainName = "";
var destination = "";
var firstTime = 0;
var frequency = 0;
var nextArrival = 0;
var minutesAway = 0;
var today = moment().format("MMDDYYYY");
var hours24;
var hour;
var amPM;
var minute;
var newTime = 0;

// Converts Military Time to 12 Hour Time
function convertTo12Time(time){
    hours24 = parseInt(time.substring(0,2));
    hour = ((hours24 + 11) % 12) + 1;
    minute = time.substring(2);
    if(hours24 > 11){
        amPM = "PM"
    }
    else{
        amPM = "AM"
    }
    return(hour + ":" + minute + " " + amPM);
}
// Calculates the time of the next train
function nextTrain(firstTime, frequency){
    var timeDifference = moment(firstTime, "HHmm").diff(moment(), "minutes");
    // If the first train is later than current time, next train is first train
    if(timeDifference > 0){
        return convertTo12Time(firstTime);
    }
    // If there is no time difference, the train is coming now!
    else if(timeDifference === 0){
        return("NOW!")
    }
    else{
        // Calculate the second train by adding frequency to first train time
        newTime = moment(firstTime + " " + today, "HHmm MMDDYYYY").add(frequency, "m").format("HHmm MMDDYYYY");
        var newTimeDifference = moment(newTime, "HHmm MMDDYYYY").diff(moment(), "minutes");
        // If the second train is later than current time, next train is the second train
        if(newTimeDifference > 0){
            return convertTo12Time(moment(newTime, "HHmm MMDDYYYY").format("HHmm"));
        }
        else if(newTimeDifference === 0){
            return("NOW!")
        }
        else{
            // Keep adding frequency to new time until the next train is later than current time
            while(newTimeDifference < 0){
                newTime = moment(newTime, "HHmm MMDDYYYY").add(frequency, "m").format("HHmm MMDDYYYY");
                newTimeDifference = moment(newTime, "HHmm MMDDYYYY").diff(moment(), "minutes");
                // Return the new time once it is later than current time
                if(newTimeDifference > 0){
                    return convertTo12Time(moment(newTime, "HHmm MMDDYYYY").format("HHmm"));
                }
            }
        }
    }
}
// Calculates minutes till next train
function minutesTillTrain(firstTime){
    var timeDifference = moment(firstTime, "HHmm").diff(moment(), "minutes");
    // If the next train is the first train, calculate time difference between now and first train time
    if(timeDifference > 0){
        var duration = moment(firstTime, "HHmm").diff(moment(),"minutes");
        return duration;
    }
    else if(timeDifference === 0){
        return("NONE!");
    }
    // If next train is coming at the new time, calculate time difference between now and new time
    else {
        var duration = moment(newTime, "HHmm MMDDYYYY").diff(moment(), "minutes");
        return duration;
    }
}
// Checks all input for form has been entered
function checkInputPresent(){
    // Grabs and stores input
    trainName = $("#trainNameInput").val().trim();
    destination = $("#destinationInput").val().trim();
    firstTime = ($("#firstTimeInput").val()).trim().replace(/:/g,"");
    frequency = $("#frequencyInput").val().trim();
    // If any of the input sections are empty, show modal
    if(trainName === "" || destination === "" || firstTime === "" || frequency === ""){
        $("#no-input-modal").modal();
        return false;
    }
    else{return true}
}
// Checks validity of input
function checkValidity(check){
    var input = $(check);
    // If input is not valid according to preset rules in HTML, then display popover
    if(!input[0].checkValidity()){
        input.popover({
            content: "Please enter valid input",
            placement: "top"
        });
        input.popover("show");
        setTimeout(function(){input.popover("hide")}, 1500)
        return false;
    }
    else{
        return true;
    }
}
// Displays Firebase data to the DOM
function displayData(data){
    var newRow = $("<tr class='data-row'>");
    var newTrainName = $("<td contenteditable='true' class='trainName'>").text(data.val().trainName);
    var newDestination = $("<td contenteditable='true' class='destination'>").text(data.val().destination);
    var newFirstTime = $("<td contenteditable='true' class='firstTime'>").text(convertTo12Time(data.val().firstTrain));
    var newFrequency = $("<td contenteditable='true' class='frequency'>").text(data.val().frequency);
    var newArrival = $("<td>").text(data.val().nextArrival);
    var newMinutes = $("<td>").text(data.val().minutesAway);
    var deleteButton = $("<button class='my-2 delete-button'>").text("X");
    var newKey = data.key;
    deleteButton.attr("data-key", newKey);
    newRow.attr("id", newKey);
    newRow.append(newTrainName, newDestination, newFirstTime, newFrequency, newArrival, newMinutes, deleteButton);
    $("#trainSchedule").append(newRow);
}
// Clicking delete button
$(document).on("click",".delete-button", function(){
    var thisKey = $(this).attr("data-key");
    // Delete from Firebase using the key stored in button
    database.ref().child(thisKey).remove();
    // Remove row from the DOM
    $("#" + thisKey).remove();
});
// Clicking submit button
$("#submitInput").on("click", function(){
    event.preventDefault();
    // Run checkInputPresent function, if returned false, then exit function
    if(!checkInputPresent()){
        return;
    }
    // Run checkValidity function for firstTime input, if returned false, then exit function
    if(!checkValidity("#firstTimeInput")){
        return;
    }
    // Run checkValidity function for frequency input, if returned false, then exit function
    if(!checkValidity("#frequencyInput")){
        return;
    }
    // Grab user input if passed all previous checkpoints
    trainName = $("#trainNameInput").val();
    destination = $("#destinationInput").val();
    firstTime = ($("#firstTimeInput").val()).replace(/:/g,"");
    frequency = parseInt($("#frequencyInput").val());
    nextArrival = nextTrain(firstTime, frequency);
    minutesAway = minutesTillTrain(firstTime);
    // Local object to store data to be sent to Firebase
    var newData = {
        trainName: trainName,
        destination: destination,
        frequency: frequency,
        firstTrain: firstTime,
        nextArrival: nextArrival,
        minutesAway: minutesAway
    }
    // Push data to Firebase
    database.ref().push(newData);
    // Empty input fields
    $("#trainNameInput").val("");
    $("#destinationInput").val("");
    $("#firstTimeInput").val("");
    $("#frequencyInput").val("");
});
// Update data displayed in Train Schedule
function updateData(){
    // For each row of the Train schedule
    $(".data-row").each(function(){
        var that = this
        var key = $(that).attr("id");
        var storedFirstTime;
        // Call on Firebase data for the row once
        database.ref(key).once("value").then(function(data){
            // Grab stored firstTime and frequency from Firebase
            storedFirstTime = data.val().firstTrain;
            storedFrequency = data.val().frequency;
            // Calculate nextArrival and minutesAway based on current time
            var newNextArrival = nextTrain(storedFirstTime, storedFrequency);
            var newMinutesAway = minutesTillTrain(storedFirstTime);
            // Update Firebase with new data
            database.ref(key).child("nextArrival").set(newNextArrival);
            database.ref(key).child("minutesAway").set(newMinutesAway);
            // Update DOM with new data
            $(that)[0].children[4].innerHTML = newNextArrival;
            $(that)[0].children[5].innerHTML = newMinutesAway;
        });
    });
}
// Set interval to updateData every minute
var updateFirebase = setInterval(updateData, 60000);

// Loop through each child in Firebase and display data 
database.ref().on("child_added", function(data){
   displayData(data);
}, function(error){
   console.log("There was an error " + error.code);
});

