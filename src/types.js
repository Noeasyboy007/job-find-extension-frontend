/**
 * @typedef {Object} ApiResponse
 * @property {boolean} is_error
 * @property {number} status
 * @property {string} message
 * @property {unknown} [data]
 */

/**
 * @typedef {Object} AuthSession
 * @property {string} accessToken
 * @property {string} refreshToken
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} first_name
 * @property {string | null} last_name
 * @property {string} email
 * @property {boolean} is_verified
 * @property {string} user_role
 */

/**
 * @typedef {Object} Resume
 * @property {number} id
 * @property {string} file_name
 * @property {string} file_type
 * @property {number | null} file_size
 * @property {string} status
 * @property {string | null} file_url
 * @property {string | null} error_message
 * @property {string | null} raw_text
 * @property {Record<string, unknown> | null} parsed_data
 */

/**
 * @typedef {Object} Job
 * @property {number} id
 * @property {string} title
 * @property {string} company_name
 * @property {string} description
 * @property {string} source_platform
 * @property {string} status
 * @property {string | null} location
 * @property {string | null} source_url
 * @property {string[] | null} skills
 */

/**
 * @typedef {Object} JobAnalysis
 * @property {number} id
 * @property {number} job_id
 * @property {number} user_id
 * @property {'queued'|'processing'|'completed'|'failed'} status
 * @property {number | null} fit_score
 * @property {Record<string, unknown> | null} result
 * @property {string | null} error_message
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

export {};

