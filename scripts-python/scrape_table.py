from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import json

def scrape_population_table():
    # Initialize Selenium with ChromeDriver
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in headless mode
    # driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)

    # URL of the target page (a Wikipedia page with a table of countries by population)
    url = "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population"
    driver.get(url)

    # Locate the table on the page
    table = driver.find_element(By.CSS_SELECTOR, "table.wikitable")

    # Initialize a list to hold table data
    data = []

    # Loop through each row in the table (skipping the header row)
    rows = table.find_elements(By.TAG_NAME, "tr")[1:]
    for row in rows:
        columns = row.find_elements(By.TAG_NAME, "td")
        if len(columns) > 1:
            country = columns[1].text.strip()
            population = columns[2].text.strip()
            # Append as a dictionary
            data.append({"country": country, "population": population})

    driver.quit()  # Close the browser

    # Print data as JSON string to read it from Node.js
    print(json.dumps(data))

if __name__ == "__main__":
    scrape_population_table()
