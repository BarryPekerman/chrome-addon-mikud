// Input validation utility

const Validation = {
  /**
   * Validate city name
   * @param {string} city - City name to validate
   * @returns {boolean}
   */
  validateCity(city) {
    if (!city || typeof city !== 'string') {
      return false;
    }

    const trimmed = city.trim();
    
    // Basic validation: at least 2 characters, no special characters that would break API
    if (trimmed.length < 2) {
      return false;
    }

    // Allow Hebrew, English, numbers, spaces, and common punctuation
    // This is a basic check - API will do final validation
    return trimmed.length <= 100;
  },

  /**
   * Validate street name (required)
   * @param {string} street - Street name to validate
   * @returns {boolean}
   */
  validateStreet(street) {
    if (!street || typeof street !== 'string') {
      return false;
    }

    const trimmed = street.trim();
    
    // Basic validation: at least 2 characters (required field)
    if (trimmed.length < 2) {
      return false;
    }

    // Allow Hebrew, English, numbers, spaces, and common punctuation
    return trimmed.length <= 100;
  },

  /**
   * Validate house number (required)
   * @param {string} houseNumber - House number to validate
   * @returns {boolean}
   */
  validateHouseNumber(houseNumber) {
    if (!houseNumber || typeof houseNumber !== 'string') {
      return false; // Required field
    }

    const trimmed = houseNumber.trim();
    
    // Required field - must have at least 1 character
    if (trimmed.length === 0) {
      return false;
    }

    return trimmed.length <= 20;
  },

  /**
   * Validate entrance (optional)
   * @param {string} entrance - Entrance to validate
   * @returns {boolean}
   */
  validateEntrance(entrance) {
    if (!entrance || typeof entrance !== 'string') {
      return true; // Optional field
    }

    const trimmed = entrance.trim();
    
    // Optional field
    if (trimmed.length === 0) {
      return true;
    }

    return trimmed.length <= 20;
  },

  /**
   * Validate complete address
   * @param {string} city - City name (required)
   * @param {string} street - Street name (required)
   * @param {string} houseNumber - House number (required)
   * @param {string} entrance - Entrance (optional)
   * @returns {Object} - { valid: boolean, errors: Array<string> }
   */
  validateAddress(city, street = '', houseNumber = '', entrance = '') {
    const errors = [];

    if (!this.validateCity(city)) {
      errors.push('שם העיר אינו תקין');
    }

    if (!this.validateStreet(street)) {
      errors.push('שם הרחוב אינו תקין (חובה)');
    }

    if (!this.validateHouseNumber(houseNumber)) {
      errors.push('מספר הבית אינו תקין (חובה)');
    }

    if (entrance && !this.validateEntrance(entrance)) {
      errors.push('מספר הכניסה אינו תקין');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validation;
}

