const EVENTS_ENDPOINT = 'https://raw.githubusercontent.com/joshhn/temp/main/campuslabs_events_data.json';

export default function fetchEvents() {
  fetch(EVENTS_ENDPOINT)
    .then((response) => response.json())
    .then((data) => {
      chrome.storage.local.set({ events_data: data });
    })
    .catch((err) => {
      console.log(err);
    });
}
