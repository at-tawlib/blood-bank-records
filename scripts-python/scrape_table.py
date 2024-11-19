from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import json
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


class Scraper:
    """
    A flexible scraper class to handle multiple scraping tasks with error handling.
    """

    def __init__(self, headless=True):
        """
        Initialize the Selenium driver with the specified options.
        """
        try:
            options = webdriver.ChromeOptions()
            if headless:
                options.add_argument("--headless")
            self.driver = webdriver.Chrome(
                service=ChromeService(ChromeDriverManager().install()), options=options
            )
            logging.info("Selenium driver initialized successfully.")
        except Exception as e:
            logging.error("Failed to initialize Selenium driver: %s", e)
            raise

    def scrape_population_table(self):
        """
        Scrape the population table from Wikipedia.
        """
        try:
            url = "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population"
            logging.info("Accessing URL: %s", url)
            self.driver.get(url)

            # Find the population table
            table = self.driver.find_element(By.CSS_SELECTOR, "table.wikitable")
            rows = table.find_elements(By.TAG_NAME, "tr")[1:]  # Skip header row

            # Extract data
            data = []
            for row in rows:
                columns = row.find_elements(By.TAG_NAME, "td")
                if len(columns) > 1:
                    country = columns[1].text.strip()
                    population = columns[2].text.strip()
                    data.append({"country": country, "population": population})

            logging.info("Population table scraped successfully.")
            return data

        except Exception as e:
            logging.error("Failed to scrape population table: %s", e)
            return {"error": "Failed to scrape population table.", "details": str(e)}

    def scrape_gdp_table(self):
        """
        Scrape the GDP table from Wikipedia (example implementation).
        """
        try:
            url = "https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)"
            logging.info("Accessing URL: %s", url)
            self.driver.get(url)

            # Add GDP scraping logic here
            # Placeholder data for demonstration purposes
            data = [
                {"name": "Samuel Appiah", "id": "AC-A12-XZP1234"},
                {"name": "John Mensah", "id": "AC-B34-QWE5678"},
                {"name": "Elizabeth Tetteh", "id": "AC-C56-RFT9012"},
                {"name": "Yaw Owusu", "id": "AC-D78-ZXD3456"},
                {"name": "Ama Asantewaa", "id": "AC-E90-RTG7890RTG7890RTG7890"},
                {"name": "Kwame Boateng", "id": "AC-F23-FTY2345"},
                {"name": "Kojo Antwi", "id": "AC-G45-MNB6789"},
                {"name": "Akosua Nyarko", "id": "AC-H67-ASD1234"},
                {"name": "Efua Annan", "id": "AC-I89-DSF5678"},
                {"name": "Kofi Adjei", "id": "AC-J01-WER9012"},
                {"name": "Yaw Darko", "id": "AC-K23-RTY3456"},
                {"name": "Ama Nyame", "id": "AC-L45-SAD7890"},
                {"name": "Esi Frimpong", "id": "AC-M67-KLM2345"},
                {"name": "Akua Acheampong", "id": "AC-N89-VBN6789"},
                {"name": "Mavis Badu", "id": "AC-O12-POI1234"},
                {"name": "Yaw Ankomah", "id": "AC-P34-UYT5678"},
                {"name": "Kojo Akoto", "id": "AC-Q56-XCV9012"},
                {"name": "Ama Mensah", "id": "AC-R78-QAZ3456"},
                {"name": "Akosua Agyeman", "id": "AC-S90-WSD7890"},
                {"name": "Kwadwo Ofori", "id": "AC-T23-ZXF2345"},
                {"name": "Esi Yeboah", "id": "AC-U45-LKG6789"},
                {"name": "Yaw Baah", "id": "AC-V67-NHJ1234"},
                {"name": "Kwame Danso", "id": "AC-W89-UIO5678"},
                {"name": "Efua Nkrumah", "id": "AC-X01-PLM9012"},
            ]
            logging.info("GDP table scraped successfully.")
            return data

        except Exception as e:
            logging.error("Failed to scrape GDP table: %s", e)
            return {"error": "Failed to scrape GDP table.", "details": str(e)}

    def close(self):
        """
        Close the Selenium driver.
        """
        try:
            self.driver.quit()
            logging.info("Selenium driver closed successfully.")
        except Exception as e:
            logging.warning("Failed to close Selenium driver: %s", e)

    def run(self, method_name):
        """
        Dynamically invoke a method by name and handle exceptions.
        """
        try:
            # Dynamically call the requested method
            method = getattr(self, method_name, None)
            if not method:
                raise ValueError(f"Method '{method_name}' not found.")
            logging.info("Running method: %s", method_name)
            return method()  # Call the method
        except ValueError as ve:
            logging.error("Invalid method name: %s", ve)
            return {"error": str(ve)}
        except Exception as e:
            logging.error(
                "Error occurred while running method '%s': %s", method_name, e
            )
            return {"error": "An unexpected error occurred.", "details": str(e)}
        finally:
            self.close()


if __name__ == "__main__":
    scraper = None
    try:
        # Get the method name from command-line arguments
        method_name = sys.argv[1] if len(sys.argv) > 1 else None
        if not method_name:
            raise ValueError(
                "No method specified. Provide a method name as an argument."
            )

        # Initialize scraper and run the specified method
        scraper = Scraper(headless=True)
        result = scraper.run(method_name)
        print(json.dumps(result))

    except ValueError as ve:
        logging.error("Error: %s", ve)
        print(json.dumps({"error": str(ve)}))

    except Exception as e:
        logging.error("Unexpected error: %s", e)
        print(json.dumps({"error": "An unexpected error occurred.", "details": str(e)}))

    finally:
        # Ensure the Selenium driver is closed properly
        if scraper:
            scraper.close()
