import { ORGANIZATIONS } from "./organizations.js";

const displayData = (data) => {
  var mainContainer = document.getElementById("event__info");

  if (data == null || data.length == 0) {
    var event__item = document.createElement("div");
    event__item.className = "event__item";
    event__item.innerText = "No Upcoming Events";
    event__item.style.justifyContent = "center";
    event__item.style.fontSize = "1rem";
    mainContainer.appendChild(event__item);
    return;
  }

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
      event__icon.src = data[i].event_icon+ "?preset=med-sq";
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

    if (ORGANIZATIONS.includes(data[i].event_organizer)) {
      var event__tag = document.createElement("div");
      event__tag.className = "event__tag";
      event__tag.innerHTML = `<i class="fa-solid fa-award fa-lg"></i>Recommended`;
      event__details.appendChild(event__tag);
    }

    var event__calendar = document.createElement("div");
    event__calendar.className = "event__calendar";
    event__calendar.innerHTML = `<i class="fa-regular fa-calendar-plus fa-2xl" title="Add to Google Calendar" value=${data[i].event_url}></i>`;
    event__calendar.addEventListener("click", addToCalendar);

    event__item.appendChild(event__icon);
    event__item.appendChild(event__details);
    event__item.appendChild(event__calendar);

    mainContainer.appendChild(event__item);
  }
}

const addToCalendar = (event) => {
  event.preventDefault();
  window.open(event.target.getAttribute("value") + "/googlepublish", "_blank");
}

const addNotificationToggle = (notification_status) => {
  const event__toggle = document.getElementById("event__toggle")

  var toggleElement = document.createElement("input");
  toggleElement.type = "checkbox";
  toggleElement.checked = (notification_status === "ON");

  toggleElement.addEventListener("click", () => {
    chrome.runtime.sendMessage({notification_status: toggleElement.checked ? "ON" : "OFF"});
  });

  var label = document.createElement("label");

  event__toggle.appendChild(toggleElement);
  event__toggle.appendChild(label);
}

const addThemeToggle = (theme_status) => {
  const theme__button = document.getElementById("theme__button");

  const darkModeOn = () => {
    theme__button.classList["remove"]("fa-moon");
    theme__button.classList["add"]("fa-sun");
    document.documentElement.classList["add"]("dark-mode");
  }

  const darkModeOff = () => {
    theme__button.classList["remove"]("fa-sun");
    theme__button.classList["add"]("fa-moon");
    document.documentElement.classList["remove"]("dark-mode");
  }

  if (theme_status == "light-mode") {
    darkModeOff();
  }
  else if (theme_status == "dark-mode"){
    darkModeOn();
  }

  const theme__toggle = document.getElementById("theme__toggle");

  theme__toggle.addEventListener("click", () => {
    if (theme__button.classList.contains("fa-moon")) {
      chrome.runtime.sendMessage({theme_status: "dark-mode"});
      darkModeOn();
    }
    else if (theme__button.classList.contains("fa-sun")){
      chrome.runtime.sendMessage({theme_status: "light-mode"});
      darkModeOff();
    }
  });
}

chrome.storage.local.get(["theme_status", "notification_status", "events_data"], (result) => {
  const {theme_status, notification_status, events_data} = result;

  if (theme_status == null) {
    let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark-mode" : "light-mode";
    chrome.runtime.sendMessage({theme_status: theme});
    addThemeToggle(theme);
  }
  else {
    addThemeToggle(theme_status);
  }

  addNotificationToggle(notification_status);
  displayData(events_data);
})

chrome.runtime.sendMessage({popupOpen: true});
