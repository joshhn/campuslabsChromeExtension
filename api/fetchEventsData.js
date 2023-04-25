const EVENTS_ENDPOINT = "https://raw.githubusercontent.com/joshhn/TigerHacks2023_DPU/main/data-scraper/campuslabs_events_data.json"

export default function fetchEvents() {
  fetch(EVENTS_ENDPOINT)
    .then(response => response.json())
    .then(data => {
      chrome.storage.local.set({events: data})
      console.log(data);
    })
    .catch(err => {
      console.log(err);
    })
}
