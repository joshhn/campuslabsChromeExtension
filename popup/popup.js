const toggleElement = document.getElementById("notiId")
toggleElement.addEventListener("click", () => {
  if(toggleElement.checked){
    chrome.runtime.sendMessage({noti_status: "ON"})
  }else {
    chrome.runtime.sendMessage({noti_status: "OFF"})
  }
});

chrome.storage.local.get("noti_status, events", (result) => {
  const {noti_status} = result;
  if (noti_status === "ON") {
    toggleElement.checked = true;
  }else{
    toggleElement.checked = false;
  }
})

document.addEventListener('DOMContentLoaded', function() {
  fetch('../data-scraper/campuslabs_events_data.json')
  .then(function (response) {
      return response.json();
  })
  .then(function (data) {
      displayData(data);
  })
  .catch(function (err) {
      console.log('error: ' + err);
  });

  function displayData(data) {
    var mainContainer = document.getElementById("event__info");

    for (var i = 0; i < data.length; i++) {
      var event__item = document.createElement("a");
      event__item.className = "event__item";
      event__item.href = data[i].event_url;
      event__item.target = "_blank";

      var event__icon = document.createElement("img");
      event__icon.className = "event__icon";
      if (data[i].event_icon === "None") {
        event__icon.src = "../images/icon128.png"
      } else {
        event__icon.src = data[i].event_icon
      }


      var event__details = document.createElement("div");
      event__details.className = "event__details";

      var event__name = document.createElement("div");
      event__name.className = "event__name";
      event__name.innerText = data[i].event_name;

      var event__from = document.createElement("div");
      event__from.className = "event__from";
      event__from.innerText = data[i].event_time_from;

      var event__location = document.createElement("div");
      event__location.className = "event__location";
      event__location.innerText = data[i].event_location;

      event__details.appendChild(event__name);
      event__details.appendChild(event__from);
      event__details.appendChild(event__location);

      var event__calendar = document.createElement("div");
      event__calendar.className = "event__calendar";
      event__calendar.innerHTML = `<i class="fa-regular fa-calendar-plus fa-xl" title="Add to Google Calendar" value=${data[i].event_url}></i>`;
      event__calendar.addEventListener("click", addToCalendar);

      event__item.appendChild(event__icon);
      event__item.appendChild(event__details);
      event__item.appendChild(event__calendar);

      mainContainer.appendChild(event__item);
    }
  }

  function addToCalendar(event) {
    event.preventDefault();
    window.open(event.target.getAttribute("value") + "/googlepublish", "_blank");
  }
})
