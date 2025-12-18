'use client'

export default function DashboardPage() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">DeftMail</h1>
              <div className="flex space-x-4">
                <a href="/dashboard" className="text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
                  Dashboard
                </a>
                <a href="/dashboard/domains" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm">
                  Domains
                </a>
                <a href="/dashboard/email-users" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm">
                  Email Users
                </a>
                <a href="/dashboard/settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm">
                  Settings
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to DeftMail! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Your email hosting platform is ready. Here's what you can do:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">📧 Domains</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Add and verify your custom domains
                  </p>
                  <a href="/dashboard/domains" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Manage Domains →
                  </a>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">👤 Email Users</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Create and manage email accounts
                  </p>
                  <a href="/dashboard/email-users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Create User →
                  </a>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">✉️ Webmail</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Access your email inbox
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Open Webmail →
                  </button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">🚀 Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Add your first domain</li>
                  <li>Configure DNS records</li>
                  <li>Create email users</li>
                  <li>Start sending emails!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
