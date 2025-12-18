import crypto from 'crypto'

export class DKIMService {
  static generateDKIMKeys(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    })

    // Extract public key for DNS record
    const publicKeyBase64 = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\n/g, '')

    return {
      publicKey: publicKeyBase64,
      privateKey,
    }
  }

  static formatDKIMRecord(publicKey: string, selector: string = 'default'): string {
    return `v=DKIM1; k=rsa; p=${publicKey}`
  }
}
