import fetchEvents from "../api/fetchEventsData.js"

chrome.runtime.onInstalled.addListener(details => {
  fetchEvents()
})

chrome.runtime.onMessage.addListener(data => {
  const {noti_status} = data
  chrome.storage.local.set(data)
  if(noti_status === "ON"){
    turnNotificationOn();
  }else {
    turnNotificationOff();
  }
});

const turnNotificationOn = () => {
  console.log("Received on");
}

const turnNotificationOff = () => {
  console.log("Received off");
}
