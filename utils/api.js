// API integration utility for Israeli Post Office legacy endpoint

const API = {
  BASE_URL: 'https://services.israelpost.co.il/zip_data.nsf/SearchZip',

  buildUrl(city, street, houseNumber, entrance = '') {
    const trimmedCity = city.trim();
    const trimmedStreet = street.trim();
    const trimmedHouse = houseNumber.trim();
    const trimmedEntrance = (entrance.trim() || '');
    
    // Custom encoding: encode special characters and Hebrew, but preserve spaces as literal spaces
    // The API requires plain spaces in Street parameter, not %20 or +
    const encodeParam = (str, preserveSpaces = false) => {
      if (preserveSpaces) {
        // For Street: encode everything except spaces
        return str
          .split('')
          .map(char => {
            if (char === ' ') return ' '; // Keep spaces as-is
            // Encode special characters and non-ASCII
            if (/[a-zA-Z0-9]/.test(char)) return char;
            return encodeURIComponent(char);
          })
          .join('');
      } else {
        // For other params: encode normally
        return encodeURIComponent(str);
      }
    };
    
    const encodedCity = encodeParam(trimmedCity);
    const encodedStreet = encodeParam(trimmedStreet, true); // Preserve spaces for Street
    const encodedHouse = encodeParam(trimmedHouse);
    const encodedEntrance = encodeParam(trimmedEntrance);
    
    // API requires specific parameter order: House and Entrance must come before Street
    // Construct URL manually - Street will have literal spaces
    return `${this.BASE_URL}?OpenAgent&Location=${encodedCity}&POB=&House=${encodedHouse}&Entrance=${encodedEntrance}&Street=${encodedStreet}`;
  },

  async makeRequest(url) {
    // Use XMLHttpRequest instead of fetch to avoid automatic space encoding
    // The API requires literal spaces, not %20
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept-Language', 'he');
      xhr.withCredentials = true;
      
      xhr.onload = function() {
        // Create a Response-like object for compatibility
        const response = {
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          statusText: xhr.statusText,
          text: async () => xhr.responseText,
          headers: {
            get: (name) => xhr.getResponseHeader(name)
          }
        };
        resolve(response);
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error'));
      };
      
      xhr.send();
    });
  },

  async searchZipCode(city, street, houseNumber, entrance = '') {
    try {
      const url = this.buildUrl(city, street, houseNumber, entrance);
      console.log('=== API REQUEST ===');
      console.log('Full URL:', url);

      const response = await this.makeRequest(url);
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const lowerText = responseText.toLowerCase();
      if (lowerText.includes('captcha') ||
          lowerText.includes('shieldsquare') ||
          (lowerText.includes('bot') && lowerText.includes('blocked')) ||
          lowerText.includes('access denied')) {
        throw new Error('השרת חסם את הבקשה (CAPTCHA)');
      }

      const parsed = this.parseResponse(responseText);
      if (!parsed || parsed.length === 0) {
        throw new Error('לא נמצא מיקוד עבור הכתובת המבוקשת');
      }
      return parsed;
    } catch (error) {
      console.error('=== API ERROR ===', error);
      throw new Error(`שגיאה בחיפוש: ${error.message}`);
    }
  },

  parseResponse(responseText) {
    if (!responseText || typeof responseText !== 'string') {
      return [];
    }

    const trimmed = responseText.trim();

    const resMatch = trimmed.match(/RES\d{5,}/);
    if (resMatch) {
      const zipCode = resMatch[0].substring(4);
      if (/^\d{5,7}$/.test(zipCode)) {
        return [{ zipCode: String(zipCode), raw: trimmed }];
      }
    }

    const zipCodeRegex = /\b\d{5,7}\b/g;
    const matches = trimmed.match(zipCodeRegex);
    if (matches && matches.length > 0) {
      return matches.map(zip => ({ zipCode: zip, raw: trimmed }));
    }

    if (/^\d{5,7}$/.test(trimmed)) {
      return [{ zipCode: trimmed, raw: trimmed }];
    }

    return [];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}

