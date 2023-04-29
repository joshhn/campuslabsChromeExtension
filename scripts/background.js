import fetchEvents from "../api/fetchEventsData.js"

const UPDATE_DATA_ALARM_NAME = "UPDATE_DATA_ALARM"
const DAILY_NOTIFICATION_NAME = "DAILY_NOTIFICATION"
const DAY_IN_MINUTES = 1.0

const changeBadge = (badgeText, badgeColor) => {
  chrome.action.setBadgeText({text: badgeText}, () => {
    chrome.action.setBadgeBackgroundColor({color: badgeColor})
  })
};

const createAlarm = (alarmName, alarmPeriod) => {
  console.log("Alarm is created!")
  chrome.alarms.get(alarmName, (existingAlarm) => {
    if(!existingAlarm){
      chrome.alarms.create(alarmName, {periodInMinutes: alarmPeriod});
    }
  })
}

// Keep for future use
// const stopAlarm = (alarmName) => {
//   console.log("Alarm is stopped!")
//   chrome.alarms.clear(alarmName)
// }

const createNotification = (notificationName) => {
  console.log("Notification is created!")
  chrome.notifications.create(notificationName,
    {
      title: "Wassup!!!",
      message: "There are upcoming events on campus. Let's check it out!",
      iconUrl: "../images/depauw-icon.png",
      type: "basic"
    })
}

const stopNotification = (notificationName) => {
  console.log("Notification is stopped!")
  chrome.notifications.clear(notificationName)
}

// Keep for future use
// const turnNotificationOn = () => {
//   console.log("Received on");
//
// }

const turnNotificationOff = () => {
  console.log("Received off");
  stopNotification(DAILY_NOTIFICATION_NAME)
}

chrome.alarms.onAlarm.addListener(() => {
  chrome.storage.local.get("notification_status", (result) => {
    const {notification_status} = result;
    if (notification_status === "ON") {
      createNotification(DAILY_NOTIFICATION_NAME);
    }
    console.log("Alarm is working...");
    changeBadge(' ', '#F55050');
    fetchEvents();
  })
});

chrome.runtime.onInstalled.addListener(() => {
  fetchEvents()
  createAlarm(UPDATE_DATA_ALARM_NAME, DAY_IN_MINUTES);
  console.log("Alarm for updating data created!");
  chrome.storage.local.set({notification_status: "OFF"});
});

chrome.runtime.onMessage.addListener(data => {
  chrome.storage.local.set(data)
  if(data.popupOpen) {
    changeBadge('', '#F55050');
  } else if(data.theme_status){
    chrome.storage.local.set({theme_status: data.theme_status});
  } else if(data.notification_status === "OFF"){
    turnNotificationOff();
  }
});

chrome.notifications.onClicked.addListener(() => {
  console.log("Notification is clicked");
  chrome.tabs.create({ url: "https://depauw.campuslabs.com/engage/events"})
});
