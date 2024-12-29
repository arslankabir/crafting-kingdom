import * as crypto from 'crypto';

class SecretsManager {
  private static instance: SecretsManager;
  private encryptionKey: string;

  private constructor() {
    // Generate a secure encryption key (in production, this should come from a secure key vault)
    this.encryptionKey = process.env.ENCRYPTION_PASSWORD || this.generateSecureKey();
  }

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  private generateSecureKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  public encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', 
        Buffer.from(this.encryptionKey.slice(0, 32)), 
        iv
      );
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  public decrypt(encryptedData: string): string {
    try {
      const [ivHex, encryptedHex] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', 
        Buffer.from(this.encryptionKey.slice(0, 32)), 
        iv
      );
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  public maskSensitiveData(data: string): string {
    if (!data) return '';
    return data.slice(0, 4) + '*'.repeat(data.length - 8) + data.slice(-4);
  }
}

export default SecretsManager.getInstance();
