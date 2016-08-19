var frameModule = require("ui/frame");

exports.onContactUsTap = function (args) {
    console.log("Navigating to the Contact Us page.");
    frameModule.topmost().navigate("contact-us");
};