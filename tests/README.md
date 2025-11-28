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

### 1. `test_api_vs_website.py`

Compares API results with the official website results using Selenium.

**Usage:**
```bash
python test_api_vs_website.py
```

**Features:**
- Tests addresses via both API and website
- Compares results and reports matches/mismatches
- Saves results to `test_results.json`
- Takes screenshots on errors

**Configuration:**
- Edit the `test_cases` list in `main()` to add your test addresses
- Set `headless=False` to see the browser in action (useful for debugging)

### 2. `probe_addresses.py`

Gently probes the API to find valid test addresses.

**Usage:**
```bash
python probe_addresses.py
```

**Features:**
- Tests random or specific address combinations
- Identifies valid addresses that return zip codes
- Saves valid addresses to `valid_addresses.json`
- Respects rate limits with delays between requests

**Configuration:**
- Edit `cities` and `streets` lists to customize search
- Adjust `num_tests` and `delay` parameters
- Add specific combinations in `probe_specific_combinations()`

## Important Notes

⚠️ **Be Respectful:**
- These scripts make requests to the Israeli Post Office servers
- Always include delays between requests (2-3 seconds minimum)
- Don't run too many tests at once
- Use these scripts responsibly and for testing purposes only

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




