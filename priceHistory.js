// import "jquery-3.5.1.min";

document.body.style.border = "5px solid red";
console.info("Starting priceHistory v0.1.0");

//get current window url
let url = window.location.href;

//get JSON,
let parsedID = parseToID(url);
if (parsedID !== null) {
    console.log("fetching json with ID:",parsedID);
    fetchJSON(parsedID);
}

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

    //grab location to place button,
    let pageLocation = document.getElementsByClassName("listing-price")[0];

    //create button at location,
    pageLocation.innerHTML += "<button type='button'>View Price History</button>";


    //add button onclick event,

    //fill out table
    console.info("Gunna make a table!")
    makeTable(priceHistoryData, pageLocation);
}

function makeTable(rowData, tableLocation) {
    tableLocation.innerHTML += "<table id='price-history-table' style='padding: 0 !important;'></table>";
    // let table = document.createElement('table');
    let table = document.getElementById("price-history-table");
    // let tableHead = table.createTHead();
    // tableHead.insertRow(0).insertCell(0).innerHTML = "Price";
    table.createTHead().insertRow(0).insertCell(0).innerHTML = "Price";
    //iterate over each element
    table.createTBody();
    for (let i = 0; i < rowData.length; i++) {
        table.insertRow().insertCell(0).innerHTML = rowData[i];
    }
    // table.createTBody().insertRow(0).insertCell(0).innerHTML = null;
}

//create button table.
let buttonContents = document.createElement('div');
buttonContents.innerHTML = ""; //table
document.body.appendChild(buttonContents);






//create button,

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
        return null;//TODO throw an exception?
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