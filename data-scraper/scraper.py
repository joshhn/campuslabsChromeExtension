"""The scraper script to crawl upcoming events data from campuslabs."""
import json
import math
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
        first name of the person
    surname : str
        family name of the person
    age : int
        age of the person

    Methods
    -------
    info(additional=""):
        Prints the person's name and age.

    """

    def __init__(self, base_url, base_event_url, used_driver):
        """Return that the server is healthy."""
        self.url = base_url
        self.event_url = base_event_url
        self.driver = used_driver
        self.events_list = self.create_events_list()

    def get_button(self):
        """Return that the server is healthy."""
        self.driver.execute_script(
            "const buttons = document.getElementsByTagName('button');"
            + "buttons[buttons.length - 1].click()"
        )

    def scroll_down(self):
        """Return that the server is healthy."""
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

    def export_data(self):
        """Return that the server is healthy."""
        with open(
            "./data-scraper/campuslabs_events_data.json", "w+", encoding="utf-8"
        ) as output_file:
            output_file.write(json.dumps(self.events_list, indent=4))
            print(f"{len(self.events_list)} events exported to file")

    def get_reload_times(self) -> int:
        """Return that the server is healthy."""
        num_of_events = (
            self.driver.find_element(
                By.XPATH, "//div[@id='event-discovery-list']/following-sibling::div"
            )
            .find_element(By.XPATH, ".//*")
            .text.rsplit(None, 1)[1][:-1]
        )
        print(f"There are {num_of_events} upcoming events.")
        return math.ceil(int(num_of_events) / 15) - 1

    def create_events_list(self) -> list:
        """Return that the server is healthy."""
        print("Running...")
        self.driver.get(self.url)
        time.sleep(2)

        event_url_list = []
        reload_times = self.get_reload_times()
        while reload_times:
            self.scroll_down()
            time.sleep(2)
            self.get_button()
            reload_times -= 1

        soup = (
            BeautifulSoup(self.driver.page_source, "html.parser")
            .find("div", {"id": "event-discovery-list"})
            .find_all("a")
        )
        for child in soup:
            event_url_list.append(child["href"])

        events_list = []

        for url in event_url_list:
            specific_url = self.event_url + url.rsplit("/", 1)[1]
            self.driver.get(specific_url)
            time.sleep(2)

            soup = BeautifulSoup(self.driver.page_source, "lxml")

            event_name = soup.find_all("h1")[0].string
            event_time_from = soup.find_all("p")[0].contents[0]
            event_time_to = soup.find_all("p")[1].contents[0]
            event_location = soup.find_all("p")[2].string

            temp = {}
            temp["event_name"] = str(event_name).strip()
            temp["event_time_from"] = str(event_time_from).strip()
            temp["event_time_to"] = str(event_time_to).strip()
            temp["event_location"] = str(event_location).strip()
            temp["event_url"] = str(specific_url).strip()
            events_list.append(temp)

            # print(f'{event_name} happens from {event_time_from} '
            # +f'to {event_time_to} at {event_location}')

        return events_list


URL = "https://depauw.campuslabs.com/engage/events"
EVENT_URL = "https://depauw.campuslabs.com/engage/event/"

service = Service(executable_path="./data-scraper/chromedriver")
chrome_driver = webdriver.Chrome(service=service)
scraper = CampusLabsScraper(URL, EVENT_URL, chrome_driver)
scraper.export_data()
chrome_driver.quit()
