
import * as crypto from 'crypto'
import { logger } from '../services'

interface IOptions {
    password: string,
}

export class EncryptionHandlerService {
    private password: string
    private ALGORITHM_NAME = 'aes-128-gcm'
    private ALGORITHM_NONCE_SIZE = 12
    private ALGORITHM_TAG_SIZE = 16
    private ALGORITHM_KEY_SIZE = 16
    private PBKDF2_NAME = 'sha256'
    private PBKDF2_SALT_SIZE = 16
    private PBKDF2_ITERATIONS = 32767

    constructor(options: IOptions) {
        this.password = options.password
        logger.info('Pusher => Connected')
    }

    public encryptString(plaintext: string) {
        const salt = crypto.randomBytes(this.PBKDF2_SALT_SIZE)
        const key = crypto.pbkdf2Sync(
            new Buffer(this.password, 'utf8'),
            salt,
            this.PBKDF2_ITERATIONS,
            this.ALGORITHM_KEY_SIZE,
            this.PBKDF2_NAME,
        )
        const ciphertextAndNonceAndSalt = Buffer.concat([
            salt,
            this.encrypt(new Buffer(plaintext, 'utf8'), key),
        ])
        return ciphertextAndNonceAndSalt.toString('base64')
    }

    public decryptString(base64CiphertextAndNonceAndSalt: string) {
        const ciphertextAndNonceAndSalt = new Buffer(base64CiphertextAndNonceAndSalt, 'base64')
        const salt = ciphertextAndNonceAndSalt.slice(0, this.PBKDF2_SALT_SIZE)
        const ciphertextAndNonce = ciphertextAndNonceAndSalt.slice(this.PBKDF2_SALT_SIZE)
        const key = crypto.pbkdf2Sync(
            new Buffer(this.password, 'utf8'),
            salt,
            this.PBKDF2_ITERATIONS,
            this.ALGORITHM_KEY_SIZE,
            this.PBKDF2_NAME,
        )
        return this.decrypt(ciphertextAndNonce, key).toString('utf8')
    }

    private encrypt(plaintext, key) {
        const nonce = crypto.randomBytes(this.ALGORITHM_NONCE_SIZE)
        const cipher: any = crypto.createCipheriv(this.ALGORITHM_NAME, key, nonce)
        const ciphertext = Buffer.concat([ cipher.update(plaintext), cipher.final() ])
        return Buffer.concat([ nonce, ciphertext, cipher.getAuthTag() ])
    }

    private decrypt(ciphertextAndNonce, key) {
        const nonce = ciphertextAndNonce.slice(0, this.ALGORITHM_NONCE_SIZE)
        const ciphertext = ciphertextAndNonce.slice(
            this.ALGORITHM_NONCE_SIZE,
            ciphertextAndNonce.length - this.ALGORITHM_TAG_SIZE,
        )
        const tag = ciphertextAndNonce.slice(ciphertext.length + this.ALGORITHM_NONCE_SIZE)
        const cipher: any = crypto.createDecipheriv(this.ALGORITHM_NAME, key, nonce)
        cipher.setAuthTag(tag)
        return Buffer.concat([ cipher.update(ciphertext), cipher.final() ])
    }
}
