var httpModule = require("http");
var dialogModule = require("ui/dialogs");
var page;

// capture a reference to the current page after it loads
// we'll need this later to access the text boxes on the screen
exports.onLoaded = function onLoaded(args) {
    page = args.object;
};

exports.onTap = function onTap(args) {

    // step 1: get data out of text field and text view
    var subject = page.getViewById("subject").text;
    var message = page.getViewById("message").text;

    console.log("Submitting: " + subject + ", " + message);

    // step 2: submit data to Tekmo

    // step 2.1: assemble data to send
    var data = JSON.stringify({
        "subject": subject,
        "message": message
    });

    // step 2.2: send the request toa remote web service
    httpModule
        .request({
            url: "https://nstweet.brosteins.com/api/message",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: data })
        .then(function(response) {
            // success: tell the user
            console.log("Received a response: HTTP " + response.statusCode);
            dialogModule.alert("Thank you for your feedback!");
        }, function(e) {
            // error: oh snap
            console.log("Error occurred: " + e);
            dialogModule.alert("We couldn't send your message right now. Try again later.");
        });
};