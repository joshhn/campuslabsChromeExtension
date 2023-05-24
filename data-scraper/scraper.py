"""The scraper script to crawl upcoming events data from campuslabs."""
import json
import math
import re
import time

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By


class CampusLabsScraper:
    """
    A class to represent a CampusLabs Scraper.

    ...

    Attributes
    ----------
    url : str
        the base url to campuslabs
    event_url : str
        the base url to a specific event
    driver : Any
        the webdriver used to access webpage

    Methods
    -------
    get_button():
        Click the load more button to load more entries.
    scroll_down():
        Scroll the page down so most recent entries can be viewed.
    export_data(events_list):
        Export data to json file.
    get_reload_times() -> int:
        Get number of times to reload the page.
    get_reload_times() -> int:
        Get number of times to reload the page.
    create_url_list() -> list:
        Return the event url list.
    create_events_list(url_list) -> list:
        Return the events list.

    """

    def __init__(self, base_url, base_event_url, used_driver):
        """Initialize attributes of class."""
        self.url = base_url
        self.event_url = base_event_url
        self.driver = used_driver

    def get_button(self):
        """Click the load more button to load more entries."""
        self.driver.execute_script(
            "const buttons = document.getElementsByTagName('button');"
            + "buttons[buttons.length - 1].click()"
        )

    def scroll_down(self):
        """Scroll the page down so most recent entries can be viewed."""
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

    def export_data(self, events_list: list):
        """Export data to json file."""
        with open(
            "./data-scraper/campuslabs_events_data.json",
            "w+",
            encoding="utf-8",
        ) as output_file:
            output_file.write(json.dumps(events_list, indent=4))
            print(f"{len(events_list)} events exported to file")

    def get_reload_times(self) -> int:
        """Get number of times to reload the page."""
        num_of_events = (
            self.driver.find_element(
                By.XPATH, "//div[@id='event-discovery-list']/following-sibling::div"
            )
            .find_element(By.XPATH, ".//*")
            .text.rsplit(None, 1)[1][:-1]
        )
        print(f"There are {num_of_events} upcoming events.")
        return math.ceil(int(num_of_events) / 15) - 1

    def create_url_list(self) -> list:
        """Return the url list."""
        print("Creating URL list...")
        self.driver.get(self.url)
        time.sleep(2)

        url_list = []
        reload_times = self.get_reload_times()
        while reload_times:
            self.scroll_down()
            time.sleep(2)
            self.get_button()
            time.sleep(2)
            reload_times -= 1

        soup = (
            BeautifulSoup(self.driver.page_source, "html.parser")
            .find("div", {"id": "event-discovery-list"})
            .find_all("a")
        )
        for child in soup:
            url_list.append(child["href"])

        return url_list

    def create_events_list(self, url_list: list) -> list:
        """Return the events list."""
        print("Creating events list...")

        events_list = []

        for url in url_list:
            specific_url = self.event_url + url.rsplit("/", 1)[1]
            self.driver.get(specific_url)
            time.sleep(5)

            soup = BeautifulSoup(self.driver.page_source, "html.parser")

            event_name = soup.find_all("h1")[0].string
            event_time_from = soup.find_all("p")[0].contents[0]
            event_time_to = soup.find_all("p")[1].contents[0]
            event_location = soup.find_all("p")[2].string
            event_organizer = soup.find_all("h3")[0].string
            icon_img = soup.find_all("img")
            event_icon = "None"
            if icon_img:
                event_icon = icon_img[len(icon_img) - 1]["src"]
            print(event_icon)

            temp = {}
            temp["event_name"] = str(event_name).strip()
            temp["event_time_from"] = str(event_time_from).strip()
            temp["event_time_to"] = str(event_time_to).strip()
            temp["event_location"] = str(event_location).strip()
            temp["event_url"] = str(specific_url).strip()
            temp["event_organizer"] = str(event_organizer).strip()
            if re.search(
                "^https://se-images.campuslabs.com/clink/images/.*?preset=small-sq$",
                event_icon,
            ):
                event_icon = str(event_icon).strip()
                temp["event_icon"] = event_icon[: len(event_icon) - 16]
            else:
                temp["event_icon"] = "None"
            events_list.append(temp)

            # print(f'{event_name} happens from {event_time_from} '
            # +f'to {event_time_to} at {event_location}')

        return events_list


URL = "https://depauw.campuslabs.com/engage/events"
EVENT_URL = "https://depauw.campuslabs.com/engage/event/"
service = Service(executable_path="./data-scraper/chromedriver")
chrome_driver = webdriver.Chrome(service=service)

scraper = CampusLabsScraper(URL, EVENT_URL, chrome_driver)
events_url_list = scraper.create_url_list()
events_data_list = scraper.create_events_list(events_url_list)
scraper.export_data(events_data_list)
chrome_driver.quit()
