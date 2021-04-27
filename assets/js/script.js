var searchInput = document.querySelector("#srchInput");
var searchButton = document.querySelector("#srchBtn");
var historyList = document.querySelector("#historyList");
var historyTitle = document.querySelector("#historyTitle");

var wxPanel = document.querySelector("#wxPan");
var wxCont = document.querySelector("#wxCont");
var currentCity = document.querySelector("#currCity");
var currentWx = document.querySelector("#currWx");
var currentDate = currentWx.querySelector("#currDate");
var wxIcon = currentWx.querySelector("#wxIcon");
var wxCurrent = currentWx.querySelector("#wxCurrent");
var wxMin = currentWx.querySelector("#wxMin");
var wxMax = currentWx.querySelector("#wxMax");
var wxHumid = currentWx.querySelector("#wxHumid");
var wxWind = currentWx.querySelector("#wxWind");
var wxUV = currentWx.querySelector("#wxUV");

var forecastCont = document.querySelector("#fcstCont");
var forecast = document.querySelector("#fsct");

var modal = document.querySelector("#modal");
var formBody = modal.querySelector("#formBody");
var formMessage = modal.querySelector("#formMessage");

var finalCityName;
var searchArray = [];
var historyArray = [];

function getCityName(name){
    var city = name.adminArea5;
    var state = name.adminArea3;
    var country = name.adminArea1;

    console.log("cityName");
    var tempCity = [];
    if(city){tempCity.push(city);}
    if(state){tempCity.push(state);}
    if(country){tempCity.push(country);}
    return tempCity.join(", ");
}

function confirm(array){
    formBody.innerHTML = "";
    for(let i = 0; i < array.length; i++){

        var inputCont = document.createElement("div");
        inputCont.classList.add("inputRes-", "uk-form-controls", "uk-margin");
        var srchInput = document.createElement("input");
        srchInput.setAttribute("type", "radio");
        srchInput.setAttribute("id", "inputRes-"+i);
        srchInput.setAttribute("name", "inputRes-");
        srchInput.setAttribute("data-location", JSON.stringify(array[i]));
        inputCont.appendChild(srchInput);

        var modalName = getCityName(array[i]);
        var srchLabel = document.createElement("label");
        srchLabel.innerText = modalName;
        srchLabel.setAttribute("for", "inputRes-"+i);
        inputCont.appendChild(srchLabel);

        formBody.appendChild(inputCont);

    }
    UIkit.modal("#modal").show();
    console.log("confirm");
}

function saveSearch(location){
    finalCityName = getCityName(location);

    if(searchArray.includes(finalCityName)){
        var index = searchArray.indexOf(finalCityName);
        searchArray.splice(index, 1);
        historyArray.splice(index, 1);

        var nameOfCity = finalCityName.split(" ").join("+");
        var searchHistoryCity = historyList.querySelector("[cityName='" + nameOfCity + "']" );
        historyList.removeChild(searchHistoryCity);
    }

    var data = {
        cityName:  finalCityName,
        coords: location.latLng
    };

    if(searchArray.length == 5){
        searchArray.splice(0,1);
        historyArray.splice(0,1);

        var last = historyList.childNodes[4];
        historyList.removeChild(last);
    }
    searchArray.push(finalCityName);
    console.log(finalCityName + "SrchArr");
    historyArray.push(data);

    localHistory = {
        searchArr: searchArray,
        historyArr: historyArray
    };
    console.log(localHistory);
    localStorage.setItem("bigjuicer", JSON.stringify(localHistory));
    updateHistoryPanel(data);
    console.log("saveSearch");
}

function getCOORDS(keyword){
    keyword = keyword.split(" ").join("+");
    var api = "https://www.mapquestapi.com/geocoding/v1/address?key=ZJUiXdZZzhsEe05eUGvmmAsIoTPvQOHn&location=" + keyword;
    fetch(api).then(function(res){
        if(res.ok){
            res.json().then(function(data){
                var locations = data.results[0].locations;
                if(locations.length == 1){saveSearch(locations[0]); getWeather(locations[0].latLng);}
                else{confirm(locations);}
            });
        }
        else{console.log("Couldn't access API:", res.text);}
    });
    console.log("getCoords");
}

function getWeather(coords){
    var weatherMan = "https://api.openweathermap.org/data/2.5/onecall?lat=" + coords.lat + "&lon=" + coords.lng + "&units=imperial&exclude=minutely,hourly&appid=3efc587005200cdf1f242650ff091998";
    fetch(weatherMan).then(function(res){
        if(res.ok){
            res.json().then(function(data){
                displayWeather(data);
            });
        }
        else{console.log("Couldn't access API:", res.text);}
    });
    console.log("getWeather");
}

function updateHistoryPanel(historyData){
    historyTitle.style.display = "block";

    var newC = document.createElement("div");
    newC.classList = "uk-card-default uk-card uk-card-body uk-card-hover uk-card-small uk-text-center";
    newC.textContent = historyData.cityName;
    newC.setAttribute("cityName", historyData.cityName.split(" ").join("+"));
    historyList.insertBefore(newC, historyList.firstChild);
    console.log("updatedHistory");
}

function start(){
    var loadedHistory = JSON.parse(localStorage.getItem("bigjuicer"));
    if(loadedHistory){
        searchArray = loadedHistory.searchArr;
        console.log(searchArray);
        historyArray = loadedHistory.historyArr;
        for(var i = 0; i < searchArray.length; i++){
            if(!searchArray.includes(historyArray[i])){
                console.log("updatePanel"); updateHistoryPanel(historyArray[i]);
            }
        }
    }
    console.log("started...");
}

function getIcon(elem, img, desc){
    var icon = "https://openweathermap.org/img/w/" + img + ".png";
    elem.setAttribute("src", icon);
    elem.setAttribute("alt", desc);
    console.log("getIcon");
}

function displayWeather(data){
    currentCity.textContent = finalCityName;

    var wxDate = moment.unix(data.current.dt).format("dddd, MMMM Do");
    currentDate.textContent = wxDate;

    var iconWx = data.current.weather[0].icon;
    var wxDesc = data.current.weather[0].description + " icon";
    getIcon(wxIcon, iconWx, wxDesc); 

    var humidity = data.current.humidity;
    wxHumid.textContent = "Humidity: " + humidity + "%";

    var tempCurrent = Math.floor(data.current.temp);
    wxCurrent.textContent = "Temperature: " + tempCurrent + "°F";

    var minTemp = Math.floor(data.daily[0].temp.min);
    wxMin.textContent = "Low: " + minTemp + "°F";

    var maxTemp = Math.floor(data.daily[0].temp.max);
    wxMax.textContent = "High: " + maxTemp + "°F";

    var speed = data.current.wind_speed;
    wxWind.textContent = "Wind Speed: " + speed + " mph";

    wxUV.innerHtml = "";
    wxUV.textContent = "UV Index: ";
    var uvSpan = document.createElement("span");
    var uvIndex = data.current.uvi;
    uvSpan.textConent = uvIndex;
    if(uvIndex >= 8){uvSpan.classList.add("uk-text-danger");}
    else if(uvIndex >=3){uvSpan.classList.add("uk-text-warning");}
    else{uvSpan.classList.add("uk-text-success");}
    wxUV.appendChild(uvSpan);

    wxPanel.style.display = "block";
    wxCont.style.display = "block";

    displayForecast(data.daily);
    console.log("displayWeather");
}

function displayForecast(data){
    for(var i = 1; i < 6; i++){
        var dateElem = document.querySelector("#fcstDate"+i);
        dateElem.textContent = moment.unix(data[i].dt).format("MMMM Do");

        var fcstIcon = document.querySelector("#fcstIcon"+i);
        var iconWx = data[i].weather[0].icon;
        var wxDesc = data[i].weather[0].description;
        getIcon(fcstIcon, iconWx, wxDesc);
        
        var minTempElem = document.querySelector("#fcstMin"+i);
        var minTemp = Math.floor(data[i].temp.min);
        minTempElem.textContent = "Low: " + minTemp + "°F";

        var maxTempElem = document.querySelector("#fcstMax"+i);
        var maxTemp = Math.floor(data[i].temp.min);
        maxTempElem.textContent = "High: " + maxTemp + "°F";

        var humidElem = document.querySelector("#fcstHumid"+i)
        var humidity = data.humidty;
        humidElem.textContent = "Humidity: " + humidity + "%";
    }
    forecastCont.style.display = "block";
    console.log("displayForecast");
}
//click handlers

function searchHandler(event){
    event.preventDefault();
    modal.querySelector("#formMessage").classList.remove("uk-text-primary");
    console.log("SEARCH BTN");
    var value = searchInput.value;
    if(value){
        getCOORDS(value);
        searchInput.value = "";
    }
}

function historyHandler(event){
    if(event.target.classList.contains("#historyList")){
        var city = event.target.getAttribute("#cityName");
        getCOORDS(city);
    }
}

function modalHandler(event){
    event.preventDefault();
    var choice;
    var radios = document.getElementsByName("inputRes-");
    for(var i = 0; i < radios.length; i++){
        if(radios[i].checked){choice = JSON.parse(radios[i].getAttribute("data-location"));}
    }

    if(choice){
        UIkit.modal("#modal").hide();
        saveSearch(choice);
        getWeather(choice.latLng);
        modal.querySelector("#formMessage").classList.remove("uk-text-primary");
    }
    else{modal.querySelector("#formMessage").classList.add("uk-text-primary");}
}

start();
searchButton.addEventListener("click", searchHandler);
historyList.addEventListener("click", historyHandler);
modal.addEventListener("submit", modalHandler);
