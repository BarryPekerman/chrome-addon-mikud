# Privacy Policy for Mikud - Israeli Zip Code Search

**Last Updated:** November 19, 2025

## Introduction

Mikud ("we", "our", or "the extension") is a Chrome browser extension that helps users search for Israeli zip codes (מיקוד) using the Israeli Post Office API. This privacy policy explains how we handle your data.

## Data Collection

### What Data We Collect

The extension collects and stores the following data locally on your device:

- **Search History**: When you perform a zip code search, the extension may store:
  - City name
  - Street name
  - House number
  - Entrance number (if provided)
  - Zip code results
  - Timestamp of the search

### What Data We Do NOT Collect

- We do NOT collect any personal identification information
- We do NOT collect browsing history or website data
- We do NOT use analytics or tracking services
- We do NOT collect location data
- We do NOT share any data with third parties (except as described below)

## Data Usage

### How We Use Your Data

- **Search History**: Stored locally to allow you to quickly reuse previous searches. This feature can be disabled in the extension settings.
- **Settings**: Your preferences (history enabled/disabled, maximum history items, debug mode) are stored to remember your choices.

### Data Processing

All data processing occurs locally on your device. No data is sent to our servers or any third-party analytics services.

## Data Storage

### Local Storage

- **Search History**: Stored using Chrome's `chrome.storage.local` API, which keeps data on your device only
- **Settings**: Stored using Chrome's `chrome.storage.sync` API, which syncs across your Chrome browsers (if you're signed into Chrome)

### Data Retention

- Search history is retained until you manually clear it using the "Clear History" button
- You can limit the number of history items stored (10-200 items) in the extension settings
- You can disable history storage entirely in the extension settings

## Third-Party Services

### Israeli Post Office API

When you perform a search, the extension sends your search query (city, street, house number, entrance) to the Israeli Post Office API at `services.israelpost.co.il`. This is necessary to retrieve zip code information.

- **What is sent**: Only the address information you enter (city, street, house number, entrance)
- **What is NOT sent**: No personal information, browsing data, or any other identifying information
- **Data handling**: We have no control over how the Israeli Post Office handles this data. Please refer to their privacy policy for more information.

## User Rights

You have full control over your data:

- **Disable History**: You can disable search history storage in the extension settings
- **Clear History**: You can clear all stored search history at any time using the "Clear History" button
- **Delete Extension**: Uninstalling the extension will remove all locally stored data

## Security

We take data security seriously:

- All data is stored locally on your device
- No data is transmitted to our servers (we don't operate any servers)
- Data is stored using Chrome's secure storage APIs
- We do not use any external analytics or tracking services

## Children's Privacy

This extension is not intended for children under the age of 13. We do not knowingly collect data from children.

## Changes to This Privacy Policy

We may update this privacy policy from time to time. The "Last Updated" date at the top of this policy indicates when changes were made. We encourage you to review this policy periodically.

## Contact Information

If you have questions about this privacy policy or how we handle your data, please:

- Open an issue on the GitHub repository: [Repository URL]
- Contact the extension developer through the repository

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) principles
- Best practices for browser extension privacy

---

**Note**: This extension is open source. You can review the source code to verify our privacy practices.


