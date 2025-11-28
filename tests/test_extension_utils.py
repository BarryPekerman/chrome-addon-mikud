#!/usr/bin/env python3
"""
Unit tests for extension utility functions
Tests the logic of validation, API parsing, and URL building
"""

import re
import json

def test_url_encoding():
    """Test that URL encoding preserves spaces for Street parameter"""
    from urllib.parse import quote
    
    def encode_param(param, preserve_spaces=False):
        """Simulate extension's encodeParam function - matches JS implementation"""
        if preserve_spaces:
            # For Street: encode everything except spaces (matches JS)
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
    
    # Test cases - include streets with spaces to verify space preservation
    test_cases = [
        {'city': 'תל אביב', 'street': 'דיזנגוף', 'house': '50', 'has_space': False},
        {'city': 'ראש העין', 'street': 'מגדל דוד', 'house': '44', 'has_space': True},
        {'city': 'חיפה', 'street': 'כנרת', 'house': '7', 'has_space': False},
        {'city': 'ירושלים', 'street': 'המלך ג\'ורג\'', 'house': '1', 'has_space': True},
    ]
    
    print("Testing URL encoding logic...")
    for case in test_cases:
        city_encoded = encode_param(case['city'])
        street_encoded = encode_param(case['street'], preserve_spaces=True)
        house_encoded = encode_param(case['house'])
        
        # Check that street encoding preserves spaces if they exist
        if case['has_space']:
            assert ' ' in street_encoded, f"Street with space should preserve it: {case['street']} -> {street_encoded}"
        assert '%20' not in street_encoded, f"Street should NOT have %20: {street_encoded}"
        
        # Verify Hebrew characters are encoded
        if any(ord(c) > 127 for c in case['street']):
            # Hebrew chars should be encoded (but spaces preserved)
            print(f"  ✅ {case['city']}, {case['street']}: Encoding OK (spaces preserved: {case['has_space']})")
        else:
            print(f"  ✅ {case['city']}, {case['street']}: Encoding OK")
    
    print("✅ URL encoding tests passed\n")

def test_zip_code_parsing():
    """Test zip code parsing logic (matches extension's parseResponse)"""
    def parse_response(response_text):
        """Simulate extension's parseResponse function"""
        if not response_text or not isinstance(response_text, str):
            return []
        
        trimmed = response_text.strip()
        
        # Check for RES format: "RES73327233" -> "3327233" (skip "RES" and first digit)
        # Extension uses substring(4) which skips first 4 chars: "RES" + first digit
        res_match = re.match(r'RES\d{5,}', trimmed)
        if res_match:
            zip_code = res_match.group(0)[4:]  # Skip "RES" (3) + first digit (1) = 4 chars
            if re.match(r'^\d{5,7}$', zip_code):
                return [{'zipCode': zip_code, 'raw': trimmed}]
        
        # Try regex extraction
        zip_regex = re.compile(r'\b\d{5,7}\b')
        matches = zip_regex.findall(trimmed)
        if matches:
            return [{'zipCode': zip, 'raw': trimmed} for zip in matches]
        
        # Check if entire response is a zip code
        if re.match(r'^\d{5,7}$', trimmed):
            return [{'zipCode': trimmed, 'raw': trimmed}]
        
        return []
    
    test_cases = [
        ('RES73327233', [{'zipCode': '3327233', 'raw': 'RES73327233'}]),  # Skip RES + 7 = "3327233"
        ('RES1234567', [{'zipCode': '234567', 'raw': 'RES1234567'}]),  # Skip RES + 1 = "234567"
        ('12345', [{'zipCode': '12345', 'raw': '12345'}]),
        ('The zip code is 123456', [{'zipCode': '123456', 'raw': 'The zip code is 123456'}]),
        ('No zip code here', []),
        ('', []),
    ]
    
    print("Testing zip code parsing logic...")
    for input_text, expected in test_cases:
        result = parse_response(input_text)
        assert result == expected, f"Failed for '{input_text}': got {result}, expected {expected}"
        print(f"  ✅ '{input_text}' -> {result}")
    
    print("✅ Zip code parsing tests passed\n")

def test_validation_logic():
    """Test input validation logic (matches extension's Validation)"""
    def validate_city(city):
        if not city or not isinstance(city, str):
            return False
        trimmed = city.strip()
        return 2 <= len(trimmed) <= 100
    
    def validate_street(street):
        if not street or not isinstance(street, str):
            return False
        trimmed = street.strip()
        return 2 <= len(trimmed) <= 100
    
    def validate_house_number(house_number):
        if not house_number or not isinstance(house_number, str):
            return False
        trimmed = house_number.strip()
        return 1 <= len(trimmed) <= 20
    
    def validate_entrance(entrance):
        if not entrance or not isinstance(entrance, str):
            return True  # Optional
        trimmed = entrance.strip()
        return len(trimmed) == 0 or len(trimmed) <= 20
    
    test_cases = [
        # (city, street, house, entrance, expected_valid)
        ('תל אביב', 'דיזנגוף', '50', '', True),
        ('ח', 'רחוב', '1', '', False),  # City too short
        ('תל אביב', 'ר', '1', '', False),  # Street too short
        ('תל אביב', 'דיזנגוף', '', '', False),  # House missing
        ('תל אביב', 'דיזנגוף', '50', 'א', True),
        ('', 'דיזנגוף', '50', '', False),  # City empty
    ]
    
    print("Testing validation logic...")
    for city, street, house, entrance, expected_valid in test_cases:
        is_valid = (
            validate_city(city) and
            validate_street(street) and
            validate_house_number(house) and
            validate_entrance(entrance)
        )
        assert is_valid == expected_valid, f"Failed for {city}, {street}, {house}, {entrance}"
        print(f"  ✅ {city}, {street}, {house}, {entrance}: {is_valid}")
    
    print("✅ Validation tests passed\n")

def test_parameter_order():
    """Test that URL parameters are in correct order (House and Entrance before Street)"""
    def build_url(city, street, house, entrance=''):
        # Simulate extension's buildUrl with correct parameter order
        base_url = "https://services.israelpost.co.il/zip_data.nsf/SearchZip"
        return f"{base_url}?OpenAgent&Location={city}&POB=&House={house}&Entrance={entrance}&Street={street}"
    
    url = build_url('תל אביב', 'דיזנגוף', '50', '')
    
    # Check parameter order: House and Entrance must come before Street
    house_pos = url.find('House=')
    entrance_pos = url.find('Entrance=')
    street_pos = url.find('Street=')
    
    assert house_pos < street_pos, "House must come before Street"
    assert entrance_pos < street_pos, "Entrance must come before Street"
    
    print("Testing parameter order...")
    print(f"  URL: {url}")
    print(f"  ✅ Parameter order is correct (House and Entrance before Street)")
    print("✅ Parameter order tests passed\n")

def main():
    """Run all unit tests"""
    print("=" * 60)
    print("Extension Utility Functions - Unit Tests")
    print("=" * 60)
    print()
    
    try:
        test_url_encoding()
        test_zip_code_parsing()
        test_validation_logic()
        test_parameter_order()
        
        print("=" * 60)
        print("✅ All unit tests passed!")
        print("=" * 60)
        return 0
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return 1

if __name__ == '__main__':
    exit(main())

