#!/usr/bin/env python3
"""
Script to gently probe the website and find valid test addresses
This script will try common Israeli city/street combinations to find working addresses
"""

import time
import json
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import requests
from urllib.parse import quote

class AddressProber:
    def __init__(self, headless=True):
        """Initialize the prober with Selenium WebDriver"""
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
        
        # Common Israeli cities
        self.cities = [
            'תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'נתניה',
            'אשדוד', 'רמת גן', 'פתח תקווה', 'אשקלון', 'רחובות',
            'בני ברק', 'בת ים', 'כפר סבא', 'הרצליה', 'רעננה'
        ]
        
        # Common street names
        self.streets = [
            'הרצל', 'בן גוריון', 'ויצמן', 'רוטשילד', 'דיזנגוף',
            'אלנבי', 'שדרות העצמאות', 'הכרמל', 'הנביאים', 'המלך ג\'ורג\''
        ]
        
        self.valid_addresses = []
    
    def test_address_via_api(self, city, street, house, entrance=""):
        """Test if an address returns a valid zip code via API - matches extension encoding"""
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
            
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            
            result_text = response.text.strip()
            
            # Check if we got a valid RES response
            if result_text.startswith('RES') and len(result_text) > 4:
                zip_code = result_text[4:]  # Extract zip code
                if zip_code.isdigit() and len(zip_code) >= 5:
                    return {'valid': True, 'zipCode': zip_code, 'raw': result_text}
            
            # Try regex extraction as fallback
            import re
            zip_match = re.search(r'\b\d{5,7}\b', result_text)
            if zip_match:
                return {'valid': True, 'zipCode': zip_match.group(), 'raw': result_text}
            
            return {'valid': False, 'raw': result_text}
            
        except Exception as e:
            return {'valid': False, 'error': str(e)}
    
    def probe_random_addresses(self, num_tests=20, delay=2):
        """Probe random address combinations"""
        print(f"Probing {num_tests} random address combinations...")
        print("This may take a while. Please be patient and respectful of the server.\n")
        
        for i in range(num_tests):
            city = random.choice(self.cities)
            street = random.choice(self.streets)
            house = str(random.randint(1, 200))
            entrance = random.choice(['', 'א', 'ב', '1', '2'])
            
            print(f"[{i+1}/{num_tests}] Testing: {city}, {street}, {house}" + (f", {entrance}" if entrance else ""))
            
            result = self.test_address_via_api(city, street, house, entrance)
            
            if result.get('valid'):
                address_info = {
                    'city': city,
                    'street': street,
                    'house': house,
                    'entrance': entrance,
                    'zipCode': result['zipCode']
                }
                self.valid_addresses.append(address_info)
                print(f"  ✅ Valid! Zip code: {result['zipCode']}")
            else:
                print(f"  ❌ Invalid or no result")
            
            # Be gentle - wait between requests
            time.sleep(delay)
        
        return self.valid_addresses
    
    def probe_specific_combinations(self, combinations):
        """Probe specific city/street combinations"""
        print(f"Probing {len(combinations)} specific combinations...\n")
        
        for combo in combinations:
            city = combo.get('city', '')
            street = combo.get('street', '')
            house = combo.get('house', '1')
            entrance = combo.get('entrance', '')
            
            print(f"Testing: {city}, {street}, {house}" + (f", {entrance}" if entrance else ""))
            
            result = self.test_address_via_api(city, street, house, entrance)
            
            if result.get('valid'):
                address_info = {
                    'city': city,
                    'street': street,
                    'house': house,
                    'entrance': entrance,
                    'zipCode': result['zipCode']
                }
                self.valid_addresses.append(address_info)
                print(f"  ✅ Valid! Zip code: {result['zipCode']}")
            else:
                print(f"  ❌ Invalid or no result")
            
            time.sleep(2)  # Be gentle
        
        return self.valid_addresses
    
    def save_results(self, filename='valid_addresses.json'):
        """Save found valid addresses to a file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.valid_addresses, f, ensure_ascii=False, indent=2)
        print(f"\n✅ Saved {len(self.valid_addresses)} valid addresses to {filename}")
    
    def close(self):
        """Close the browser"""
        self.driver.quit()

def main():
    """Main probing function"""
    prober = AddressProber(headless=True)
    
    try:
        # Option 1: Probe random combinations
        # prober.probe_random_addresses(num_tests=30, delay=3)
        
        # Option 2: Probe specific known combinations
        specific_combinations = [
            {'city': 'חיפה', 'street': 'כנרת', 'house': '7', 'entrance': 'א'},
            {'city': 'תל אביב', 'street': 'דיזנגוף', 'house': '50'},
            {'city': 'ירושלים', 'street': 'המלך ג\'ורג\'', 'house': '1'},
            # Add more specific addresses you want to test
        ]
        
        prober.probe_specific_combinations(specific_combinations)
        
        # Save results
        if prober.valid_addresses:
            prober.save_results()
            print(f"\nFound {len(prober.valid_addresses)} valid addresses:")
            for addr in prober.valid_addresses:
                print(f"  - {addr['city']}, {addr['street']} {addr['house']}: {addr['zipCode']}")
        else:
            print("\nNo valid addresses found. Try different combinations.")
        
    finally:
        prober.close()

if __name__ == '__main__':
    main()




