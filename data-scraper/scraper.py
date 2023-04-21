from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import json
import math
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup


class CampusLabsScraper:
    def __init__(self, url, event_url, driver):
      self.url = url
      self.event_url = event_url
      self.driver = driver
      self.events_list = self.create_events_list()

    #  Clicks the load more button so that entries can load
    def get_button(self):
        self.driver.execute_script("const buttons = document.getElementsByTagName('button'); buttons[buttons.length - 1].click()")

    #  Scrolls the page down so most recent entries can be viewed
    def scroll_down(self):
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

    #  Export all events data to json file
    def export_data(self):
        file = open('./data-scraper/campuslabs_events_data.json', 'w+', encoding="utf-8")
        file.write(json.dumps(self.events_list, indent=4))
        print(f"{len(self.events_list)} events exported to file")

    def get_reload_times(self):
        num_of_events = self.driver.find_element(By.XPATH,"//div[@id='event-discovery-list']/following-sibling::div").find_element(By.XPATH,".//*").text.rsplit(None, 1)[1][:-1]
        print(f'There are {num_of_events} upcoming events.')
        return math.ceil(int(num_of_events)/15) - 1

    def create_events_list(self):
        print("Running...")
        self.driver.get(self.url)
        time.sleep(2)

        event_url_list = []
        reload_times = self.get_reload_times()
        while reload_times:
            self.scroll_down()
            time.sleep(2)
            self.get_button()
            reload_times-=1

        for child in BeautifulSoup(driver.page_source, 'lxml').find('div', {'id': 'event-discovery-list'}).find_all('a'):
            event_url_list.append(child['href'])

        events_list = []

        for url in event_url_list:
            #  goes to specific website url
            specific_url = self.event_url + url.rsplit('/', 1)[1]
            self.driver.get(specific_url)
            #  sleeps for 2 second to prevent loading errors
            time.sleep(2)

            #  creates soup of html
            soup = BeautifulSoup(driver.page_source, "lxml")
    
            #  finds all needed information
            event_name = soup.find_all('h1')[0].string
            event_time_from = soup.find_all('p')[0].contents[0]
            event_time_to = soup.find_all('p')[1].contents[0]
            event_location = soup.find_all('p')[2].string

            temp = {}
            temp["event_name"] = str(event_name).strip()
            temp["event_time_from"] = str(event_time_from).strip()
            temp["event_time_to"] = str(event_time_to).strip()
            temp["event_location"] = str(event_location).strip()
            temp["event_url"] = str(specific_url).strip()
            events_list.append(temp)

            # print(f'{event_name} happens from {event_time_from} to {event_time_to} at {event_location}')

        return events_list


url = "https://depauw.campuslabs.com/engage/events"
event_url = "https://depauw.campuslabs.com/engage/event/"

service = Service(executable_path="./data-scraper/chromedriver")
driver = webdriver.Chrome(service=service)
scraper = CampusLabsScraper(url,event_url,driver)
scraper.export_data()
driver.quit()
