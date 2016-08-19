var viewModel = require("./pokedex-view-model");
var colorModule = require("color");
var animationModule = require("ui/animation");
var observableModule = require("data/observable");
var page;

function onLoaded(args) {
    page = args.object;
    page.bindingContext = viewModel.pokedexViewModel;

    //
    // the pokedex view model has several properties
    // - image of the pokemen, i.e. 001.png
    // - name
    // - description
    // - id number
    // - height
    // - category
    // - weight
    // - stats (HP, Attack, Defense, Special Attack, Special Defense, and Speed)
    // - prev pokemon name & id
    // - next pokemon name & id   
    // - navigate to prev/next pokemon
    // - say the name
    //

    //
    // listen for when the data-bound data source has a property changed event, then
    // fire the stats animation
    viewModel.pokedexViewModel
        .addEventListener(observableModule.Observable.propertyChangeEvent, 
            function (args) {
                if (args.propertyName === "stats") {
                    animateStats(args.value);
                } 
            });

    // tell the initial pokemon loaded to animate it's stats
    animateStats(viewModel.pokedexViewModel.stats);

}
exports.onLoaded = onLoaded;

//
// animates the coloring of the stat boxes, based upon the pokemon's stat level
//
// concepts: 
// - fillMeter(): fills a meter up to the level specified 
// - drainMeter(): drains a meter to the level specified
//
// - each function returns a promise for chained commands
// - a start delay and end delay can be added in milliseconds
function animateStats(meterValues) {

    //
    // collection of UI ids for each of the stat meters
    var meterIds = 
        ["hpMeter", "attackMeter", "defenseMeter", 
            "specialAttackMeter", "specialDefenseMeter", "speedMeter"];

    //
    // STEPS
    // 1. drain to zero (resets)
    // 2. pick an initial level to fillto (random)
    // 3. fill to the initial level
    // 4. drain to zero
    // 5. fill to the data-bound stat level
    var controlMeter = function (meter, initialLevel, level, delay) {
        setTimeout(function() {
            drainMeter(meter, 10, 0, 500)
                .then(function() { return fillMeter(meter, 0, initialLevel, 0); })
                .then(function() { return drainMeter(meter, initialLevel, 0, 500); })
                .then(function() { return fillMeter(meter, 0, level, 0); });
        }, delay);
    };

    //
    // shuffles an array
    var shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    };

    //
    // STEPS: 
    // 1. establish a start delay of 250 milliseconds 
    // 2. randomize the order in which the stats are anuimated
    // 3. run the animation in the randomized order, passing in a random initial value
    var delay = 0;
    var delayOffset = 250;
    var order = shuffle([0,1,2,3,4,5]);
    for (var i = 0; i < order.length; i++) {
        var initialLevel = Math.floor((Math.random() * 10) + 1);
        controlMeter(meterIds[order[i]], initialLevel, meterValues[order[i]], delay);
        delay += delayOffset;
    }
}



function fillMeter(id, fromLevel, toLevel, beginDelay, endDelay) {
    var meter = getMeterById(id);
    return fillRecurse(meter, toLevel, fromLevel, 1, "#30A7D7", endDelay);
}

function drainMeter(id, fromLevel, toLevel, endDelay) {
    var meter = getMeterById(id);
    return fillRecurse(meter, toLevel-1, fromLevel-1, -1, "white", endDelay);    
}

function fillRecurse(meter, level, current, step, color, endDelay) {
    if (current === level) return new Promise(function(resolve,error) {
        setTimeout(function() {
            resolve();
        }, endDelay);
    });

    //
    // MAGIC HAPPENS HERE
    // call the animate() function of NativeScript, changing the color with a duration
    return meter[current].animate({
        backgroundColor: new colorModule.Color(color),
        duration: 40
    }).then(function() {
        return fillRecurse(meter, level, current+step, step, color, endDelay);
    });
}

function getMeterById(id) {
    var meter = new Array();

    var meterContainer = page.getViewById(id);
    var childrenCount = meterContainer.getChildrenCount();
    for (var i = childrenCount-2; i >= 0; i--) {
        meter[meter.length] = meterContainer.getChildAt(i);
    }

    return meter;
}