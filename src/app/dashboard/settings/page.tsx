'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [stalwartHealth, setStalwartHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStalwartHealth()
  }, [])

  const checkStalwartHealth = async () => {
    try {
      const response = await fetch('/api/stalwart/health')
      const data = await response.json()
      setStalwartHealth(data)
    } catch (error) {
      setStalwartHealth({ available: false, error: 'Connection failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">System configuration and status</p>
      </div>

      {/* Stalwart Mail Server Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Mail Server Status</h2>
          <button
            onClick={checkStalwartHealth}
            className="text-blue-600 hover:underline text-sm"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-gray-600">Checking status...</div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${stalwartHealth?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                Stalwart Mail Server: {stalwartHealth?.available ? 'Online' : 'Offline'}
              </span>
            </div>

            {!stalwartHealth?.available && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm mb-2">
                  ⚠️ Mail server is not available
                </p>
                <p className="text-yellow-700 text-sm">
                  Email users are saved in the database but won't be able to send/receive emails until the mail server is running.
                </p>
                {stalwartHealth?.error && (
                  <p className="text-xs text-yellow-600 mt-2">
                    Error: {stalwartHealth.error}
                  </p>
                )}
              </div>
            )}

            {stalwartHealth?.available && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ Mail server is running and accepting connections
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SMTP/IMAP Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Mail Server Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Incoming Mail (IMAP)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Server:</span>
                <span className="font-mono">mail.deftmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Port:</span>
                <span className="font-mono">993</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Security:</span>
                <span>SSL/TLS</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Outgoing Mail (SMTP)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Server:</span>
                <span className="font-mono">mail.deftmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Port:</span>
                <span className="font-mono">587</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Security:</span>
                <span>STARTTLS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Use these settings to configure email clients like Outlook, Thunderbird, or mobile apps
          </p>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">Stalwart API URL:</span>
            <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
              {process.env.NEXT_PUBLIC_STALWART_URL || 'http://localhost:8080'}
            </code>
          </div>
          <div className="text-xs text-gray-500 mt-4">
            Configure these in your <code className="bg-gray-100 px-1 rounded">.env</code> file:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><code>STALWART_API_URL</code> - Stalwart API endpoint</li>
              <li><code>STALWART_ADMIN_TOKEN</code> - Admin authentication token</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
