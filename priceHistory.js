console.info("Starting priceHistory v0.1.0");

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
        // $.getJSON("https://cors-anywhere.herokuapp.com/https://www.grailed.com/api/listings/"+listing, fetchJSONCallback);
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
    console.log("Price History Data", priceHistoryData);

    //grab location to place price info,
    let pageLocation = document.getElementsByClassName("listing-price")[0];

    //fill out price history contents
    if (priceHistoryData.length !== 0) {
        listPriceHistory(priceHistoryData, pageLocation);
    } else {
        //say no price drops
        pageLocation.innerHTML += "There are no price drops on record for this listing."
    }

    //add "Raw JSON" Button.
    let locationForRawJSON = document.getElementsByClassName("ListingSellerCard")[0];
    locationForRawJSON.outerHTML += "<div class=''><button class='button _large _border' title='meta-data' id='meta-data' onclick='window.open(\"https://www.grailed.com/api/listings/"+ parsedID + "\");'><span>Listing Meta-data</span></button></div>"

}

//puts the price history and deltas.
function listPriceHistory(data, listLocation) {
    listLocation.innerHTML += "<b>Price History:</b> ";
    for (let i = 0; i < (data.length-1); i++) {
        listLocation.innerHTML += "$" + data[i] + ", ";
    }
    listLocation.innerHTML += "$" + data[data.length-1];

    //Price Deltas
    listLocation.innerHTML += "</br><b>Avg. Price Change:</b> -$" + getDelta(data);
}

//gets the avg. price change (Helper for listPriceHistory)
function getDelta(data) {
    let deltas = [];
    for (let i = 0; i < data.length-1; i++) {
        deltas.push(data[i]-data[i+1]);
    }
    console.log("deltas:",deltas)
    let avg = 0;
    for (let i = 0; i < deltas.length; i++) {
        avg += deltas[i];
    }
    return avg/deltas.length;

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
                        let firstDash = j;
                        console.log(input.slice(lastSlash,firstDash));
                        return input.slice(lastSlash,firstDash);
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
    // console.log(url.contains("grailed.com.listing"))
    return url.includes("grailed.com/listing");
}