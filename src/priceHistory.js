//get current window url
let url = window.location.href;

//get JSON,
let parsedID = parseToID(url);
if (parsedID !== null) {
    console.log("fetching json with ID:",parsedID);
    fetchJSON(parsedID);
} else throw TypeError("ID could not be parsed!");

function fetchJSON(listing) {
    try {
        $.getJSON("https://www.grailed.com/api/listings/"+listing, fetchJSONCallback);
    } catch (e) {
        console.log("Error Getting JSON! Bad ID?",e);
    }
}

//what to do once the JSON has been fetched.
function fetchJSONCallback(data) {
    console.log("JSON data", data);

    //get price history from JSON,
    let priceHistoryData = data["data"]["price_drops"];

    //grab location to place price info,
    let pageLocation = document.getElementsByClassName("ListingPage-Price")[0];
    console.warn(pageLocation);

    //fill out price history contents
    if (priceHistoryData.length !== 0) {
        listPriceHistory(priceHistoryData, pageLocation);
        getExpectedDrop(data["data"], pageLocation);
    } else {
        //say no price drops
        pageLocation.innerHTML += "There are no price drops on record for this listing."
    }

    //add seller account creation date
    let locationForAccountCreationDate = document.getElementsByClassName("listing-description-wrapper")[0];
    console.log("locationForAccCreateDate",locationForAccountCreationDate);
    let creationDate = new Date(data["data"]["seller"]["created_at"]);
    locationForAccountCreationDate.insertAdjacentText("beforebegin", "Account Creation Date: " + creationDate.toDateString());

    //add "Raw JSON" Button.
    let locationForRawJSON = document.getElementsByClassName("-metadata")[0];
    locationForRawJSON.outerHTML += "<div class=''><button class='button _large _border' title='meta-data' id='meta-data' onclick='window.open(\"https://www.grailed.com/api/listings/"+ parsedID + "\");'><span>Listing Meta-data <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-external-link\"><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path><polyline points=\"15 3 21 3 21 9\"></polyline><line x1=\"10\" y1=\"14\" x2=\"21\" y2=\"3\"></line></svg></span></button></div>"

}

//puts the price history and deltas.
function listPriceHistory(data, listLocation) {

    //variable for new HTML content to be built in
    let contentToAdd = "";

    contentToAdd += "<b>Price History:</b> ";
    for (let i = 0; i < (data.length-1); i++) {
        contentToAdd += "$" + data[i] + ", ";
    }
    contentToAdd += "$" + data[data.length-1] + ". <em>\(total drops: " + data.length + "\)</em>";

    //Price Deltas
    //if price drop is 10% and has dropped more than once give warning (seller intentionally dropping just enough to bump)
    let avgPercentDrop = getDeltaPercent(data);
    if (avgPercentDrop === 10 && data.length > 2) {
        //warning condition
        contentToAdd += "</br><b>Avg. Price Drop:</b> <span class='alert'>" + avgPercentDrop + "%</span> ($" + Math.round(getDelta(data)) + ") <a href='https://github.com/RVRX/grailed-plus/wiki/Average-Drop-is-10%25' target='_blank' title='What is this?'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"red\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-help-circle\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"></line></svg></a>";
    } else {
        //normal condition
        contentToAdd += "</br><b>Avg. Price Drop:</b> " + avgPercentDrop + "% ($" + Math.round(getDelta(data)) + ")";
    }

    //add span class around content to add (for styles)
    contentToAdd = "</br><span class='Text Body'>" + contentToAdd + "</span>"
    console.warn(contentToAdd);

    //add to page
    listLocation.innerHTML += contentToAdd;
}

//estimates when the seller will next drop the price. returns days till next drop.
function getExpectedDrop(data, pageLocation) {
    let dateUpdated = new Date(data["price_updated_at"]);
    let dateCreated = new Date(data["created_at"]);
    let nextExpectedDropMS = (dateUpdated - dateCreated)/(data["price_drops"].length) - (Date.now() - dateUpdated);
    let expectedDropEndResult = nextExpectedDropMS/8.64e+7;

    //if expected result is older than 30 days give date, otherwise give next expected drop
    if (expectedDropEndResult >= -30) {
        //set values
        pageLocation.innerHTML += "</br><b>Next Expected Drop In:</b> " + Math.round(nextExpectedDropMS/8.64e+7) + " days <a href='https://github.com/RVRX/grailed-plus/wiki/About-%22Next-Expected-Drop%22-Feature' target='_blank' title='What is this?'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-help-circle\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"></line></svg></a>";
    } else {
        pageLocation.innerHTML += "</br><b>Next Expected Drop In:</b> " + "Listing Appears Inactive. Last Update Was " + dateUpdated.toDateString() + " <a href='https://github.com/RVRX/grailed-plus/wiki/About-%22Next-Expected-Drop%22-Feature' target='_blank' title='What is this?'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-help-circle\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"></line></svg></a>";
    }
}

//gets the avg. price change (Helper for listPriceHistory)
function getDelta(data) {
    let deltas = [];
    for (let i = 0; i < data.length-1; i++) {
        deltas.push(data[i]-data[i+1]);
    }
    let avg = 0;
    for (let i = 0; i < deltas.length; i++) {
        avg += deltas[i];
    }
    return avg/deltas.length;

}

//gets the av,g price change, returns percent. (Helper for listPriceHistory)
function getDeltaPercent(data) {
    let percents = [];
    for (let i = 0; i < data.length - 1; i++) {
        percents.push(100-(data[i+1]/data[i])*100);
    }
    let avg = 0;
    for (let i = 0; i < percents.length; i++) {
        avg += percents[i];
    }
    return Math.floor(avg/percents.length);
}


    /*-----------------------PARSING FUNCTIONS--------------------------*/

//Parses the into to an ID, returns null if invalid.
function parseToID(input) {
    if (isValidID(input)) {
        return input;
    } else if (isValidURL(input)) {
        for (let i = 0; i < input.length; i++) { //i=1, to skip potential trailing backslashes
            if (/^\/+$/.test(input.charAt(input.length-(i+2)))) { //input.length-(i+2), to go from back to front, and skip last item
                let lastSlash = input.length-(i+1);
                for (let j = lastSlash; j < input.length; j++) { //from the lastSlash to end, look for '-', remove dash and everything after it.
                    if (/^-+$/.test(input.charAt(j))) {
                        return input.slice(lastSlash,j);
                    }
                }
            }
        }
        //parse URL into id
        return input.replace(/\D/g,''); //keeping regex here in-case there are no dashes
        // return input
    } else {
        console.warn("This is not a valid URL or ID! " + input);
        return null;
    }
}

//checks if arg only contains [0-9]
function isValidID(id) {
    //regex for [0-9]
    return /^\d+$/.test(id);
}

//checks if arg contains "grailed.com/listing"
function isValidURL(url) {
    return url.includes("grailed.com/listing");
}