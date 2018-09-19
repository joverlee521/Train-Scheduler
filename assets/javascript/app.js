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

$("#submitInput").on("click", function(){
    event.preventDefault();
    trainName = $("#trainNameInput").val();
    destination = $("#destinationInput").val();
    firstTime = $("#firstTimeInput").val();
    frequency = parseInt($("#frequencyInput").val());
    database.ref().push({
        trainName: trainName,
        destination: destination,
        firstTime: firstTime,
        frequency: frequency
    });
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
    newRow.append(newTrainName,newDestination,newFrequency);
    $("#trainSchedule").append(newRow);
}, function(error){
    console.log("There was an error " + error.code);
})