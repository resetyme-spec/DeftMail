export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-center">
        <h1 className="text-6xl font-bold mb-4">
          DeftMail
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Professional Email Hosting for Businesses
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/signup"
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-lg border border-input px-6 py-3 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-2">Custom Domains</h3>
          <p className="text-muted-foreground">
            Use your own domain for professional email addresses
          </p>
        </div>
        <div className="p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-2">Modern Webmail</h3>
          <p className="text-muted-foreground">
            Gmail-like interface with powerful features
          </p>
        </div>
        <div className="p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
          <p className="text-muted-foreground">
            SPF, DKIM, DMARC, and encryption built-in
          </p>
        </div>
      </div>
    </main>
  );
}
