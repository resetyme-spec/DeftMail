import axios from 'axios'

const STALWART_API_URL = process.env.STALWART_API_URL || 'http://localhost:8080'
const STALWART_ADMIN_TOKEN = process.env.STALWART_ADMIN_TOKEN || 'admin-secret-token'

export class StalwartService {
  private static client = axios.create({
    baseURL: STALWART_API_URL,
    headers: {
      'Authorization': `Bearer ${STALWART_ADMIN_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  /**
   * Create an email account in Stalwart
   */
  static async createAccount(email: string, password: string, displayName?: string) {
    try {
      const response = await this.client.post('/api/v1/accounts', {
        email,
        password,
        name: displayName || email.split('@')[0],
        quota: 1073741824, // 1GB default
        enabled: true
      })
      return response.data
    } catch (error: any) {
      console.error('Stalwart create account error:', error.response?.data || error.message)
      throw new Error(`Failed to create Stalwart account: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Update account password in Stalwart
   */
  static async updatePassword(email: string, newPassword: string) {
    try {
      const response = await this.client.put(`/api/v1/accounts/${email}`, {
        password: newPassword
      })
      return response.data
    } catch (error: any) {
      console.error('Stalwart update password error:', error.response?.data || error.message)
      throw new Error(`Failed to update Stalwart password: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Delete an email account in Stalwart
   */
  static async deleteAccount(email: string) {
    try {
      const response = await this.client.delete(`/api/v1/accounts/${email}`)
      return response.data
    } catch (error: any) {
      console.error('Stalwart delete account error:', error.response?.data || error.message)
      // Don't throw error if account doesn't exist
      if (error.response?.status === 404) {
        return { success: true }
      }
      throw new Error(`Failed to delete Stalwart account: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Update account quota in Stalwart
   */
  static async updateQuota(email: string, quotaMb: number) {
    try {
      const quotaBytes = quotaMb * 1024 * 1024
      const response = await this.client.put(`/api/v1/accounts/${email}`, {
        quota: quotaBytes
      })
      return response.data
    } catch (error: any) {
      console.error('Stalwart update quota error:', error.response?.data || error.message)
      throw new Error(`Failed to update Stalwart quota: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Enable/disable an email account in Stalwart
   */
  static async setAccountStatus(email: string, enabled: boolean) {
    try {
      const response = await this.client.put(`/api/v1/accounts/${email}`, {
        enabled
      })
      return response.data
    } catch (error: any) {
      console.error('Stalwart set account status error:', error.response?.data || error.message)
      throw new Error(`Failed to update Stalwart account status: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get account information from Stalwart
   */
  static async getAccount(email: string) {
    try {
      const response = await this.client.get(`/api/v1/accounts/${email}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      console.error('Stalwart get account error:', error.response?.data || error.message)
      throw new Error(`Failed to get Stalwart account: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Check if Stalwart is available
   */
  static async healthCheck() {
    try {
      const response = await this.client.get('/api/v1/health')
      return { available: true, data: response.data }
    } catch (error: any) {
      console.error('Stalwart health check failed:', error.message)
      return { available: false, error: error.message }
    }
  }

  /**
   * Sync email user with Stalwart
   */
  static async syncEmailUser(email: string, password: string, displayName?: string, quotaMb?: number) {
    try {
      // Check if account exists
      const existing = await this.getAccount(email)
      
      if (existing) {
        // Update existing account
        await this.updatePassword(email, password)
        if (quotaMb) {
          await this.updateQuota(email, quotaMb)
        }
        return { synced: true, created: false }
      } else {
        // Create new account
        await this.createAccount(email, password, displayName)
        if (quotaMb) {
          await this.updateQuota(email, quotaMb)
        }
        return { synced: true, created: true }
      }
    } catch (error: any) {
      console.error('Stalwart sync error:', error.message)
      throw error
    }
  }
}
