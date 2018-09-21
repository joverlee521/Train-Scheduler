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

function nextTrain(){
    var timeDifference = moment(firstTime, "HHmm").diff(moment(), "minutes");
    if(timeDifference > 0){
        return convertTo12Time(firstTime);
    }
    else if(timeDifference === 0){
        return("NOW!")
    }
    else{
        newTime = moment(firstTime + " " + today, "HHmm MMDDYYYY").add(frequency, "m").format("HHmm MMDDYYYY");
        var newTimeDifference = moment(newTime, "HHmm MMDDYYYY").diff(moment(), "minutes");
        if(newTimeDifference > 0){
            return convertTo12Time(moment(newTime, "HHmm MMDDYYYY").format("HHmm"));
        }
        else{
            while(newTimeDifference < 0){
                newTime = moment(newTime, "HHmm MMDDYYYY").add(frequency, "m").format("HHmm MMDDYYYY");
                newTimeDifference = moment(newTime, "HHmm MMDDYYYY").diff(moment(), "minutes");
                if(newTimeDifference > 0){
                    return convertTo12Time(moment(newTime, "HHmm MMDDYYYY").format("HHmm"));
                }
            }
        }
    }
}

function minutesTillTrain(){
    var timeDifference = moment(firstTime, "HHmm").diff(moment(), "minutes");
    if(timeDifference > 0){
        var duration = moment(firstTime, "HHmm").diff(moment(),"minutes");
        return duration;
    }
    else if(timeDifference === 0){
        return("NONE!");
    }
    else {
        var duration = moment(newTime, "HHmm MMDDYYYY").diff(moment(), "minutes");
        return duration;
    }
}

function checkInputPresent(){
    trainName = $("#trainNameInput").val().trim();
    destination = $("#destinationInput").val().trim();
    firstTime = ($("#firstTimeInput").val()).trim().replace(/:/g,"");
    frequency = $("#frequencyInput").val().trim();
    if(trainName === "" || destination === "" || firstTime === "" || frequency === ""){
        console.log("no input");
        $("#no-input-modal").modal();
        return false;
    }
    else{return true}
}

function checkFirstTimeValidity(){
    var input = $("#firstTimeInput");
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

$("#submitInput").on("click", function(){
    event.preventDefault();
    if(!checkInputPresent()){
        return;
    }
    if(!checkFirstTimeValidity()){
        return;
    }
    trainName = $("#trainNameInput").val();
    destination = $("#destinationInput").val();
    firstTime = ($("#firstTimeInput").val()).replace(/:/g,"");
    frequency = parseInt($("#frequencyInput").val());
    nextArrival = nextTrain();
    minutesAway = minutesTillTrain();
    console.log(nextArrival);
    console.log(minutesAway);
    // database.ref().push({
    //     trainName: trainName,
    //     destination: destination,
    //     frequency: frequency,
    //     nextArrival: nextArrival,
    //     minutesAway: minutesAway
    // });
    $("#trainNameInput").val("");
    $("#destinationInput").val("");
    $("#firstTimeInput").val("");
    $("#frequencyInput").val("");
})

database.ref().on("child_added", function(data){
    console.log(data.val());
    var newRow = $("<tr>");
    var newTrainName = $("<td>").text(data.val().trainName);
    var newDestination = $("<td>").text(data.val().destination);
    var newFrequency = $("<td>").text(data.val().frequency);
    var newArrival = $("<td>").text(data.val().nextArrival);
    var newMinutes = $("<td>").text(data.val().minutesAway);
    var newKey = data.key;
    newRow.attr("data-key", newKey);
    console.log(data.key);
    newRow.append(newTrainName,newDestination,newFrequency, newArrival, newMinutes);
    $("#trainSchedule").append(newRow);
}, function(error){
    console.log("There was an error " + error.code);
})


