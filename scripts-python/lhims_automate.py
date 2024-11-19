import time
import json
from decouple import config

from selenium import webdriver
from selenium.common import NoSuchElementException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

LHIMS_url = config('LHIMS_URL')
chrome_driver_path = config('CHROME_DRIVER_PATH')
LHIMS_username = config('LHIMS_USERNAME')
LHIMS_password = config('LHIMS_PASSWORD')

class LHIMSAutomator:

    def __init__(self, username, password):
        # self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        self.section = None
        self.username = username
        self.password = password
        self.driver = webdriver.Chrome(service=Service(chrome_driver_path))

    def login(self):
        """Open the LHIMS link and login"""
        print("Logging in.....")
        self.driver.get(LHIMS_url)
        self.driver.find_element(By.ID, "idUsername").send_keys(self.username)
        self.driver.find_element(By.ID, "idPassword").send_keys(self.password)
        self.driver.find_element(By.ID, "idSecureLoginButton").click()
        print("Completed logging in.....")

    def open_blood_bank_lab_services(self):
        """ logins then > Opens Dashboard > Blood Bank Dashboard > Blood Bank - Lab Services"""
        self.login()

        print("Opening the blood bank dashboard...")
        self.driver.find_element(By.LINK_TEXT, "Blood Bank Dashboard").click()
        time.sleep(1)
        self.section = self.driver.find_element(By.ID, "idBloodBank")
        Select(self.section).select_by_value("2")
        self.driver.find_element(By.ID, "idLockBloodBank").click()
        time.sleep(2)
        self.driver.find_element(By.CSS_SELECTOR, "#buttonContainer > a:nth-child(6)").click()
        print("Blood bank dashboard opened..........")
       
    def bill_patient(self, lhims_number):
        """
            Opens Dashboard > Blood Bank Dashboard > Blood Bank - Lab Services > Add Lab Test
            Enters lhims_number and selects procedure then bills the patient, waits for user to confirm
        """
        self.open_blood_bank_lab_services()

        print("Billing patient........")
        self.driver.find_element(By.LINK_TEXT, "Add Lab Test").click()
        time.sleep(2)
        Select(self.driver.find_element(By.ID, "idLabTestFor")).select_by_value("3")
        # open the dropdown input
        self.driver.find_element(By.XPATH, '//*[@id="select2-idPatientSearch-container"]/span').click()

        # enter the search term in the input field
        # TODO: use this for all elements and add a error handler
        input_field = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '/html/body/span/span/span[1]/input'))
        )
        input_field.send_keys(lhims_number)

        # Wait for and retrieve the search result
        # result_item = WebDriverWait(self.driver, 10).until(
        #     EC.visibility_of_element_located((By.XPATH, '//*[@id="select2-idPatientSearch-results"]/li'))
        # )

        result_item = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, '/html/body/span/span/span[2]/ul/li'))
        )

        print(result_item)
        result_item.click()
        print("Getting result text...")
        # result_text = result_item.text
        # print("Result text: " + result_text)

       

        # select the first result
        # WebDriverWait(self.driver, 10).until(
        #     EC.visibility_of_element_located((By.XPATH, '//*[@id="select2-idPatientSearch-results"]/li'))
        # ).click()
        # input_field.send_keys("enter")
        # self.section = self.driver.find_element(By.ID, "idPatientSearch")
        # Select(self.section).select_by_index(0)


        # Check if the result matches the input
        # if lhims_number.lower() in result_text.lower():
        #     result_item.click()
        #     time.sleep(1)
        #     try:
        #         checkbox = self.driver.find_element(By.XPATH, '//*[@id="idAddToIPDBill"]')
        #         if checkbox.is_selected():
        #             print("check box is selected")
        #             checkbox.click()
        #     except NoSuchElementException:
        #         print("Element not found. Continuing without it.")
        
        print("Finished billing patient........")


    def open_lab_test_listing(self):
        """
        Opens Dashboard > Blood Bank Dashboard > Blood Bank - Lab Services > Lab Test Listing
        """
        self.open_blood_bank_lab_services()

        print("Opening the Lab test listing")
        self.driver.find_element(By.LINK_TEXT, "Lab Test Listing").click()
        time.sleep(1)

        self.driver.find_element(By.ID, "select2-idServiceID-container").click()
        time.sleep(1)

        self.driver.find_element(By.XPATH, '/html/body/span/span/span[1]/input').send_keys("GROUPING AND CROSS MATCHING")
        time.sleep(3)

          # Wait for the list to appear
        # wait = WebDriverWait(driver, 10)
        # first_list_item = wait.until(
        #     EC.presence_of_element_located((By.CSS_SELECTOR, "select2-idServiceID-results > li"))  # Replace the CSS selector
        # )

        # # Click the first list item
        # first_list_item.click()


        self.driver.find_element(By.CSS_SELECTOR, '#select2-idServiceID-results > li').click()
        time.sleep(1)

        #select2-idServiceID-results > li


        data = []
        table = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '#idTableBloodBankLabTestListing'))
        )
        # Loop through each in the table (skipping the header row)
        rows = table.find_elements(By.TAG_NAME, "tr")[1:]
        time.sleep(3)
        for row in rows:
            columns = row.find_elements(By.TAG_NAME, "td")
            if len(columns) > 1:
                patient = columns[3].text.split("\n", 1)
                print(patient)
                data.append({"name": patient[0], "lhimsNumber": patient[1]})

        print(data)
        print(json.dumps(data))
        print("Finished................")

    def quit_driver(self):
        time.sleep(50)
        self.driver.quit()

    def run(self, method_name):
        """
        Dynamically invoke a method by name 
        """
        try:
            method = getattr(self, method_name, None)
            if not method:
                raise ValueError(f"Method {method_name} not found.")
            return method()
        finally:
            self.quit_driver()


if __name__ == "__main__":
    import sys

    # Get arguments from node js/electron
    method_name = sys.arg[1] if len(sys.argv) > 2 else None
    user = sys.arg[2] if len(sys.argv) > 2 else None

    if method_name:
        result = automator.run(method_name=method_name)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No method specified"}))
    

    automator = LHIMSAutomator(username=user.username, password=user.password)
    
    # openLHIMS = LHIMSAutomator(username=LHIMS_username, password=LHIMS_password)
    # openLHIMS.login()
    # openLHIMS.open_blood_bank_lab_services()
    # time.sleep(1)
    # openLHIMS.bill_patient(lhims_number="AC-A02-ABL5329")
    # openLHIMS.open_lab_test_listing()
    # openLHIMS.quit_driver()
