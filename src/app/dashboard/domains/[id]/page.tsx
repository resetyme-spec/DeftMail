'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface DNSRecord {
  type: string
  name: string
  value: string
  priority?: number
  ttl?: number
}

interface Domain {
  id: string
  domain: string
  status: string
  dkimSelector: string
  mxVerified: boolean
  spfVerified: boolean
  dkimVerified: boolean
  dmarcVerified: boolean
  lastVerifiedAt: string | null
}

export default function DomainDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const fetchDomain = async () => {
    try {
      const response = await fetch(`/api/domains/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setDomain(data.domain)
        setDnsRecords(data.dnsRecords)
      }
    } catch (err) {
      console.error('Failed to fetch domain:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDomain()
  }, [params.id])

  const handleVerify = async () => {
    setVerifying(true)
    setVerificationResult(null)

    try {
      const response = await fetch(`/api/domains/${params.id}/verify`, {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        setVerificationResult(data)
        fetchDomain()
      }
    } catch (err) {
      console.error('Failed to verify domain:', err)
    } finally {
      setVerifying(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this domain?')) return

    try {
      const response = await fetch(`/api/domains/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard/domains')
      }
    } catch (err) {
      console.error('Failed to delete domain:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Domain not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">DeftMail</h1>
              <div className="flex space-x-4">
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm">
                  Dashboard
                </a>
                <a href="/dashboard/domains" className="text-blue-600 px-3 py-2 text-sm font-medium">
                  Domains
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Domains
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{domain.domain}</h2>
                <p className="text-sm text-gray-500">
                  Status: <span className={`font-medium ${domain.status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {domain.status}
                  </span>
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {verifying ? 'Verifying...' : 'Verify DNS'}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="border rounded p-3">
                <div className="text-sm font-medium text-gray-500 mb-1">MX Record</div>
                <div className={`text-lg font-semibold ${domain.mxVerified ? 'text-green-600' : 'text-gray-400'}`}>
                  {domain.mxVerified ? '✓ Verified' : '✗ Not Verified'}
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm font-medium text-gray-500 mb-1">SPF Record</div>
                <div className={`text-lg font-semibold ${domain.spfVerified ? 'text-green-600' : 'text-gray-400'}`}>
                  {domain.spfVerified ? '✓ Verified' : '✗ Not Verified'}
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm font-medium text-gray-500 mb-1">DKIM Record</div>
                <div className={`text-lg font-semibold ${domain.dkimVerified ? 'text-green-600' : 'text-gray-400'}`}>
                  {domain.dkimVerified ? '✓ Verified' : '✗ Not Verified'}
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm font-medium text-gray-500 mb-1">DMARC Record</div>
                <div className={`text-lg font-semibold ${domain.dmarcVerified ? 'text-green-600' : 'text-gray-400'}`}>
                  {domain.dmarcVerified ? '✓ Verified' : '✗ Not Verified'}
                </div>
              </div>
            </div>

            {verificationResult && (
              <div className={`p-4 rounded-md mb-6 ${verificationResult.allVerified ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <p className={`font-medium ${verificationResult.allVerified ? 'text-green-800' : 'text-yellow-800'}`}>
                  {verificationResult.allVerified 
                    ? '🎉 All DNS records verified successfully!' 
                    : '⚠️ Some DNS records are not configured correctly'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">DNS Configuration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add these DNS records to your domain registrar or DNS provider:
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TTL</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dnsRecords.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {record.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono break-all max-w-md">
                        {record.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.priority || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.ttl || '3600'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)</li>
                <li>Find the DNS management section</li>
                <li>Add each record above exactly as shown</li>
                <li>Wait 5-10 minutes for DNS propagation</li>
                <li>Click "Verify DNS" button to check configuration</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
