#!/bin/bash
# Simple script to run tests

echo "Mikud Extension Test Suite"
echo "========================="
echo ""
echo "1. Compare API vs Website"
echo "2. Probe for valid addresses"
echo "3. Run both"
echo ""
read -p "Select option (1-3): " choice

case $choice in
    1)
        echo "Running API vs Website comparison..."
        python3 test_api_vs_website.py
        ;;
    2)
        echo "Probing for valid addresses..."
        python3 probe_addresses.py
        ;;
    3)
        echo "Running both tests..."
        echo "First: Probing addresses..."
        python3 probe_addresses.py
        echo ""
        echo "Then: Comparing API vs Website..."
        python3 test_api_vs_website.py
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac




