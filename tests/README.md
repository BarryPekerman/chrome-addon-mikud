# Testing Suite for Mikud Extension

This directory contains test scripts to validate the extension's API integration and compare it with the official website.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install ChromeDriver:**
   - The scripts use `webdriver-manager` which will automatically download ChromeDriver
   - Make sure you have Chrome browser installed

## Test Scripts

### 1. `test_extension_utils.py` (NEW - Unit Tests)

Tests the extension's core logic without requiring browser or API access.

**Usage:**
```bash
python3 test_extension_utils.py
```

**Features:**
- Tests URL encoding logic (verifies spaces are preserved for Street parameter)
- Tests zip code parsing logic (matches extension's parseResponse function)
- Tests input validation logic (matches extension's Validation utility)
- Tests parameter order (verifies House and Entrance come before Street)
- Fast execution - no network requests needed

**What it tests:**
- ✅ URL encoding preserves literal spaces for Street (not %20)
- ✅ Zip code parsing handles RES format and regex extraction
- ✅ Input validation for city, street, house number, entrance
- ✅ Parameter order matches API requirements

### 2. `test_api_vs_website.py` (Integration Tests)

Compares API results with the official website results using Selenium.

**Usage:**
```bash
python3 test_api_vs_website.py
```

**Features:**
- Tests addresses via both API and website
- Uses correct URL encoding (matches extension's implementation)
- Compares results and reports matches/mismatches
- Saves results to `test_results.json`
- Takes screenshots on errors

**Configuration:**
- Edit the `test_cases` list in `main()` to add your test addresses
- Set `headless=True` for faster execution (default) or `False` to see browser

### 3. `probe_addresses.py` (Address Discovery)

Gently probes the API to find valid test addresses.

**Usage:**
```bash
python3 probe_addresses.py
```

**Features:**
- Tests random or specific address combinations
- Uses correct URL encoding (matches extension's implementation)
- Identifies valid addresses that return zip codes
- Saves valid addresses to `valid_addresses.json`
- Respects rate limits with delays between requests

**Configuration:**
- Edit `cities` and `streets` lists to customize search
- Adjust `num_tests` and `delay` parameters
- Add specific combinations in `probe_specific_combinations()`

### 4. `run_tests.sh` (Test Runner)

Convenient script to run all tests.

**Usage:**
```bash
./run_tests.sh
```

**Options:**
1. Unit tests (extension logic)
2. Compare API vs Website (integration)
3. Probe for valid addresses
4. Run all tests

## Important Notes

### URL Encoding Fix
All test scripts now use the **correct URL encoding** that matches the extension:
- **Street parameter**: Uses literal spaces (not %20 or +)
- **Other parameters**: Normal URL encoding
- **Parameter order**: House and Entrance come before Street

This ensures tests accurately reflect how the extension works.

### Rate Limiting
⚠️ **Be Respectful:**
- Integration tests make requests to the Israeli Post Office servers
- Always include delays between requests (2-3 seconds minimum)
- Don't run too many tests at once
- Use these scripts responsibly and for testing purposes only
- Unit tests (`test_extension_utils.py`) don't make network requests

## Example Test Cases

You can add test cases like:

```python
test_cases = [
    {'city': 'חיפה', 'street': 'כנרת', 'house': '7', 'entrance': 'א'},
    {'city': 'תל אביב', 'street': 'דיזנגוף', 'house': '50'},
    {'city': 'ירושלים', 'street': 'המלך ג\'ורג\'', 'house': '1'},
]
```

## Troubleshooting

**ChromeDriver issues:**
- Make sure Chrome is up to date
- `webdriver-manager` should handle driver installation automatically

**Selenium errors:**
- If website structure changes, update the XPath selectors in the scripts
- Check `error_screenshot.png` for visual debugging

**API errors:**
- Check your internet connection
- Verify the API endpoint is still valid
- Check rate limiting (add longer delays if needed)




