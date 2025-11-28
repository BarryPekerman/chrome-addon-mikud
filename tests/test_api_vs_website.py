#!/usr/bin/env python3
"""
Test script to compare API results with official website results
Uses Selenium to interact with the Israeli Post Office website
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import requests
from urllib.parse import quote

class ZipCodeTester:
    def __init__(self, headless=False):
        """Initialize the tester with Selenium WebDriver"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        self.api_base_url = "https://services.israelpost.co.il/zip_data.nsf/SearchZip"
        self.website_url = "https://doar.israelpost.co.il/locatezip"
        
    def search_via_api(self, city, street, house, entrance=""):
        """Search zip code using the API - matches extension's encoding logic"""
        try:
            # Custom encoding: encode special chars and Hebrew, but preserve spaces for Street
            # This matches the extension's buildUrl() function
            def encode_param(param, preserve_spaces=False):
                if preserve_spaces:
                    # For Street: encode everything except spaces (matches JS encodeParam with preserveSpaces=true)
                    result = []
                    for char in param:
                        if char == ' ':
                            result.append(' ')  # Keep space as literal space
                        elif char.isalnum():
                            result.append(char)  # Keep alphanumeric
                        else:
                            result.append(quote(char))  # Encode special chars and Hebrew
                    return ''.join(result)
                else:
                    # For other params: encode normally (matches JS encodeURIComponent)
                    return quote(param)
            
            # Build URL with proper encoding - Street uses literal spaces
            encoded_city = encode_param(city)
            encoded_street = encode_param(street, preserve_spaces=True)  # Critical: preserve spaces
            encoded_house = encode_param(house)
            encoded_entrance = encode_param(entrance)
            
            # API requires specific parameter order: House and Entrance before Street
            url = f"{self.api_base_url}?OpenAgent&Location={encoded_city}&POB=&House={encoded_house}&Entrance={encoded_entrance}&Street={encoded_street}"
            
            print(f"\n[API] Requesting: {url}")
            print(f"[API] Note: Street parameter uses literal spaces (not %20)")
            
            # Use requests with proper handling
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            result_text = response.text.strip()
            print(f"[API] Raw response: {result_text}")
            
            # Parse RES format: "RES73327233" -> "3327233"
            if result_text.startswith('RES'):
                zip_code = result_text[4:]  # Skip "RES" and first digit
                if zip_code.isdigit() and len(zip_code) >= 5:
                    return {'zipCode': zip_code, 'raw': result_text, 'source': 'api'}
            
            # Try to extract zip code from response
            import re
            zip_match = re.search(r'\b\d{5,7}\b', result_text)
            if zip_match:
                return {'zipCode': zip_match.group(), 'raw': result_text, 'source': 'api'}
            
            return {'error': 'No zip code found in response', 'raw': result_text, 'source': 'api'}
                
        except Exception as e:
            print(f"[API] Error: {e}")
            return {'error': str(e), 'source': 'api'}
    
    def search_via_website(self, city, street, house, entrance=""):
        """Search zip code using the official website via Selenium"""
        try:
            print(f"\n[Website] Navigating to: {self.website_url}")
            self.driver.get(self.website_url)
            time.sleep(2)  # Wait for page load
            
            # Wait for the form to be available
            wait = WebDriverWait(self.driver, 10)
            
            # Find and fill city field
            # The website uses Hebrew labels, so we need to find inputs by their structure
            print("[Website] Looking for form fields...")
            
            # Try to find input fields - they might be in a form or have specific IDs/classes
            # We'll use a more flexible approach
            city_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[contains(@placeholder, 'יישוב') or contains(@name, 'city') or contains(@id, 'city')]")))
            city_input.clear()
            city_input.send_keys(city)
            print(f"[Website] Entered city: {city}")
            time.sleep(0.5)
            
            # Find street field
            street_input = self.driver.find_element(By.XPATH, "//input[contains(@placeholder, 'רחוב') or contains(@name, 'street') or contains(@id, 'street')]")
            street_input.clear()
            street_input.send_keys(street)
            print(f"[Website] Entered street: {street}")
            time.sleep(0.5)
            
            # Find house number field
            house_input = self.driver.find_element(By.XPATH, "//input[contains(@placeholder, 'מספר בית') or contains(@name, 'house') or contains(@id, 'house')]")
            house_input.clear()
            house_input.send_keys(house)
            print(f"[Website] Entered house: {house}")
            time.sleep(0.5)
            
            # Find entrance field if provided
            if entrance:
                try:
                    entrance_input = self.driver.find_element(By.XPATH, "//input[contains(@placeholder, 'כניסה') or contains(@name, 'entrance') or contains(@id, 'entrance')]")
                    entrance_input.clear()
                    entrance_input.send_keys(entrance)
                    print(f"[Website] Entered entrance: {entrance}")
                    time.sleep(0.5)
                except:
                    print("[Website] Entrance field not found, skipping")
            
            # Find and click search button
            search_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'חיפוש') or contains(text(), 'מיקוד')]")
            search_button.click()
            print("[Website] Clicked search button")
            
            # Wait for results
            time.sleep(3)
            
            # Try to extract zip code from results
            # The zip code might be in various formats on the page
            zip_code = None
            
            # Try different selectors to find the zip code
            selectors = [
                "//div[contains(@class, 'result')]//strong",
                "//div[contains(@class, 'zip')]",
                "//span[contains(@class, 'mikud')]",
                "//*[contains(text(), 'מיקוד')]/following-sibling::*",
                "//*[contains(text(), 'מיקוד')]",
            ]
            
            for selector in selectors:
                try:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    for element in elements:
                        text = element.text.strip()
                        # Look for 5-7 digit numbers
                        import re
                        zip_match = re.search(r'\b\d{5,7}\b', text)
                        if zip_match:
                            zip_code = zip_match.group()
                            print(f"[Website] Found zip code: {zip_code}")
                            break
                    if zip_code:
                        break
                except:
                    continue
            
            if not zip_code:
                # Fallback: get page source and search for zip codes
                page_source = self.driver.page_source
                import re
                zip_matches = re.findall(r'\b\d{5,7}\b', page_source)
                if zip_matches:
                    zip_code = zip_matches[0]
                    print(f"[Website] Found zip code in page source: {zip_code}")
            
            return {'zipCode': zip_code, 'source': 'website'} if zip_code else {'error': 'Zip code not found', 'source': 'website'}
            
        except Exception as e:
            print(f"[Website] Error: {e}")
            # Take screenshot for debugging
            self.driver.save_screenshot('error_screenshot.png')
            return {'error': str(e), 'source': 'website'}
    
    def compare_results(self, city, street, house, entrance=""):
        """Compare API and website results"""
        print(f"\n{'='*60}")
        print(f"Testing: {city}, {street}, {house}" + (f", Entrance: {entrance}" if entrance else ""))
        print(f"{'='*60}")
        
        api_result = self.search_via_api(city, street, house, entrance)
        website_result = self.search_via_website(city, street, house, entrance)
        
        comparison = {
            'input': {
                'city': city,
                'street': street,
                'house': house,
                'entrance': entrance
            },
            'api': api_result,
            'website': website_result,
            'match': False
        }
        
        if 'zipCode' in api_result and 'zipCode' in website_result:
            if api_result['zipCode'] == website_result['zipCode']:
                comparison['match'] = True
                print(f"\n✅ MATCH: Both returned zip code {api_result['zipCode']}")
            else:
                print(f"\n❌ MISMATCH:")
                print(f"   API:     {api_result.get('zipCode', 'N/A')}")
                print(f"   Website: {website_result.get('zipCode', 'N/A')}")
        else:
            print(f"\n⚠️  One or both searches failed:")
            print(f"   API:     {api_result.get('error', api_result.get('zipCode', 'N/A'))}")
            print(f"   Website: {website_result.get('error', website_result.get('zipCode', 'N/A'))}")
        
        return comparison
    
    def close(self):
        """Close the browser"""
        self.driver.quit()

def main():
    """Main test function"""
    # Test addresses - includes addresses with spaces in street names
    test_cases = [
        {'city': 'חיפה', 'street': 'כנרת', 'house': '7', 'entrance': 'א'},
        {'city': 'תל אביב', 'street': 'דיזנגוף', 'house': '50'},
        {'city': 'ירושלים', 'street': 'המלך ג\'ורג\'', 'house': '1'},
        {'city': 'ראש העין', 'street': 'מגדל דוד', 'house': '44'},
        # Add more test cases with spaces in street names to verify encoding
    ]
    
    tester = ZipCodeTester(headless=True)  # Set to False to see browser
    
    results = []
    try:
        for test_case in test_cases:
            result = tester.compare_results(
                test_case['city'],
                test_case['street'],
                test_case['house'],
                test_case.get('entrance', '')
            )
            results.append(result)
            time.sleep(2)  # Be gentle with requests
        
        # Save results
        with open('test_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n{'='*60}")
        print(f"Test Summary:")
        print(f"  Total tests: {len(results)}")
        print(f"  Matches: {sum(1 for r in results if r['match'])}")
        print(f"  Mismatches: {sum(1 for r in results if not r['match'] and 'zipCode' in r.get('api', {}) and 'zipCode' in r.get('website', {}))}")
        print(f"  Results saved to: test_results.json")
        print(f"{'='*60}")
        
    finally:
        tester.close()

if __name__ == '__main__':
    main()




