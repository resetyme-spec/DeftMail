import { prisma } from '@/lib/db'
import { DKIMService } from './dkim.service'
import { DNSService } from './dns.service'

export class DomainService {
  static async createDomain(tenantId: string, domain: string) {
    // Check if domain already exists
    const existing = await prisma.domain.findFirst({
      where: { domain },
    })

    if (existing) {
      throw new Error('Domain already exists')
    }

    // Check tenant limits
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { domains: true },
    })

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    if (tenant.domains.length >= tenant.maxDomains) {
      throw new Error(`Domain limit reached (${tenant.maxDomains})`)
    }

    // Generate DKIM keys
    const { publicKey, privateKey } = DKIMService.generateDKIMKeys()
    const dkimSelector = 'default'

    // Create domain
    const newDomain = await prisma.domain.create({
      data: {
        tenantId,
        domain,
        status: 'pending',
        dkimSelector,
        dkimPublicKey: publicKey,
        dkimPrivateKey: privateKey,
      },
    })

    // Generate DNS records
    const dnsRecords = DNSService.generateDNSRecords(domain, publicKey, dkimSelector)

    return {
      domain: newDomain,
      dnsRecords,
    }
  }

  static async listDomains(tenantId: string) {
    return prisma.domain.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getDomain(domainId: string, tenantId: string) {
    const domain = await prisma.domain.findFirst({
      where: { id: domainId, tenantId },
    })

    if (!domain) {
      throw new Error('Domain not found')
    }

    const dnsRecords = DNSService.generateDNSRecords(
      domain.domain,
      domain.dkimPublicKey!,
      domain.dkimSelector
    )

    return { domain, dnsRecords }
  }

  static async verifyDomain(domainId: string, tenantId: string) {
    const domain = await prisma.domain.findFirst({
      where: { id: domainId, tenantId },
    })

    if (!domain) {
      throw new Error('Domain not found')
    }

    const dnsRecords = DNSService.generateDNSRecords(
      domain.domain,
      domain.dkimPublicKey!,
      domain.dkimSelector
    )

    const verification = await DNSService.verifyDNS(domain.domain, dnsRecords)

    // Update domain status
    const allVerified = verification.mx && verification.spf && verification.dkim && verification.dmarc

    await prisma.domain.update({
      where: { id: domainId },
      data: {
        mxVerified: verification.mx,
        spfVerified: verification.spf,
        dkimVerified: verification.dkim,
        dmarcVerified: verification.dmarc,
        status: allVerified ? 'verified' : 'pending',
        lastVerifiedAt: new Date(),
      },
    })

    return {
      ...verification,
      allVerified,
    }
  }

  static async deleteDomain(domainId: string, tenantId: string) {
    const domain = await prisma.domain.findFirst({
      where: { id: domainId, tenantId },
    })

    if (!domain) {
      throw new Error('Domain not found')
    }

    await prisma.domain.delete({
      where: { id: domainId },
    })

    return { success: true }
  }
}
