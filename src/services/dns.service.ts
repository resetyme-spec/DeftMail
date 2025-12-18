export interface DNSRecord {
  type: 'MX' | 'TXT' | 'CNAME'
  name: string
  value: string
  priority?: number
  ttl?: number
}

export class DNSService {
  static generateDNSRecords(domain: string, dkimPublicKey: string, dkimSelector: string = 'default'): DNSRecord[] {
    const mailServer = process.env.NEXT_PUBLIC_MAIL_SERVER || 'mail.deftmail.com'

    return [
      // MX Record
      {
        type: 'MX',
        name: '@',
        value: mailServer,
        priority: 10,
        ttl: 3600,
      },
      // SPF Record
      {
        type: 'TXT',
        name: '@',
        value: `v=spf1 mx include:${mailServer} ~all`,
        ttl: 3600,
      },
      // DKIM Record
      {
        type: 'TXT',
        name: `${dkimSelector}._domainkey`,
        value: `v=DKIM1; k=rsa; p=${dkimPublicKey}`,
        ttl: 3600,
      },
      // DMARC Record
      {
        type: 'TXT',
        name: '_dmarc',
        value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${mailServer}; pct=100; adkim=s; aspf=s`,
        ttl: 3600,
      },
    ]
  }

  static async verifyDNS(domain: string, expectedRecords: DNSRecord[]): Promise<{
    mx: boolean
    spf: boolean
    dkim: boolean
    dmarc: boolean
  }> {
    const dns = require('dns').promises

    const results = {
      mx: false,
      spf: false,
      dkim: false,
      dmarc: false,
    }

    try {
      // Check MX
      const mxRecords = await dns.resolveMx(domain)
      results.mx = mxRecords.some((r: any) => 
        expectedRecords.find(er => er.type === 'MX' && r.exchange.includes(er.value.split('.')[0]))
      )
    } catch (e) {
      console.log('MX verification failed:', e)
    }

    try {
      // Check SPF
      const txtRecords = await dns.resolveTxt(domain)
      const flatTxt = txtRecords.flat()
      results.spf = flatTxt.some((r: string) => r.startsWith('v=spf1'))
    } catch (e) {
      console.log('SPF verification failed:', e)
    }

    try {
      // Check DKIM
      const dkimRecord = expectedRecords.find(r => r.name.includes('._domainkey'))
      if (dkimRecord) {
        const dkimName = `${dkimRecord.name}.${domain}`
        const dkimRecords = await dns.resolveTxt(dkimName)
        results.dkim = dkimRecords.flat().some((r: string) => r.includes('v=DKIM1'))
      }
    } catch (e) {
      console.log('DKIM verification failed:', e)
    }

    try {
      // Check DMARC
      const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`)
      results.dmarc = dmarcRecords.flat().some((r: string) => r.startsWith('v=DMARC1'))
    } catch (e) {
      console.log('DMARC verification failed:', e)
    }

    return results
  }
}
