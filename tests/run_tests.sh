#!/bin/bash
# Test suite runner for Mikud Extension

echo "Mikud Extension Test Suite"
echo "========================="
echo ""
echo "1. Unit tests (extension logic)"
echo "2. Compare API vs Website (integration)"
echo "3. Probe for valid addresses"
echo "4. Run all tests"
echo ""
read -p "Select option (1-4): " choice

case $choice in
    1)
        echo "Running unit tests..."
        python3 test_extension_utils.py
        ;;
    2)
        echo "Running API vs Website comparison..."
        python3 test_api_vs_website.py
        ;;
    3)
        echo "Probing for valid addresses..."
        python3 probe_addresses.py
        ;;
    4)
        echo "Running all tests..."
        echo ""
        echo "=== Unit Tests ==="
        python3 test_extension_utils.py
        echo ""
        echo "=== Probing Addresses ==="
        python3 probe_addresses.py
        echo ""
        echo "=== API vs Website Comparison ==="
        python3 test_api_vs_website.py
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac




