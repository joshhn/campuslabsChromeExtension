import fetchEvents from "../api/fetchEventsData.js"

const NOTIFICATION_ALARM_NAME = "NOTIFICATION_ALARM"
const UPDATE_DATA_ALARM_NAME = "UPDATE_DATA_ALARM"
const DAILY_NOTIFICATION_NAME = "DAILY_NOTIFICATION"
const DAY_IN_MINUTES = 1440.0

chrome.runtime.onInstalled.addListener(() => {
  fetchEvents()
  createAlarm(UPDATE_DATA_ALARM_NAME, DAY_IN_MINUTES);
  console.log("Alarm for updating data created!")
})

chrome.runtime.onMessage.addListener(data => {
  chrome.storage.local.set(data)
  if(data.notification_status === "ON"){
    turnNotificationOn();
  }else {
    turnNotificationOff();
  }
});

const turnNotificationOn = () => {
  console.log("Received on");
  createAlarm(NOTIFICATION_ALARM_NAME, DAY_IN_MINUTES);
}

const turnNotificationOff = () => {
  console.log("Received off");
  stopAlarm(NOTIFICATION_ALARM_NAME);
  stopNotification(DAILY_NOTIFICATION_NAME)
}

const createAlarm = (alarmName, alarmPeriod) => {
  console.log("Alarm is created!")
  chrome.alarms.get(alarmName, existingAlarm => {
    if(!existingAlarm){
      chrome.alarms.create(alarmName, {periodInMinutes: alarmPeriod});
    }
  })
}

const stopAlarm = (alarmName) => {
  console.log("Alarm is stopped!")
  chrome.alarms.clear(alarmName)
}

chrome.alarms.onAlarm.addListener(() => {
  console.log("Alarm is working...")
  createNotification(DAILY_NOTIFICATION_NAME)
})

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

chrome.notifications.onClicked.addListener(() => {
  console.log("Notification is clicked");
  chrome.tabs.create({ url: "https://depauw.campuslabs.com/engage/events"})
})
