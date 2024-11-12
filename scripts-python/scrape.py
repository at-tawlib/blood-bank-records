from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import json

def scrape_data():
    # Initialize Selenium with Chrome
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")  # Run headless for background operation
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
    
    # Example URL and scraping logic
    driver.get("https://example.com")
    data = driver.find_element(By.TAG_NAME, "h1").text  # Scrape data

    driver.quit()
    return {"data": data}

if __name__ == "__main__":
    result = scrape_data()
    print(json.dumps(result))  # Print JSON output for Node to read
