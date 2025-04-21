/**
 * @typedef {Object} SignUpInfo
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string} dob   // YYYY-MM-DD format
 */

/**
 * Logs in a user.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<void>}  Resolves on success, rejects on error.
 */
export function login(email, password) {
    // TODO: replace this stub with real Firebase call
    return Promise.reject(new Error('Not yet implemented'));
  }
  
  /**
   * Creates a new user and sets their profile.
   * @param {SignUpInfo} info 
   * @returns {Promise<void>}  Resolves on success, rejects on error.
   */
  export function signUp(info) {
    // TODO: replace this stub with real Firebase call
    return Promise.reject(new Error('Not yet implemented'));
  }
  