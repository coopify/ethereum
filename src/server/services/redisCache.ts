import redis, { ClientParams } from '@mcrowe/redis-promise'
import { logger } from '../services'

export { ClientParams }

/*
  This class was created based on redis for NodeJS, you can find more documentation here:
    https://www.npmjs.com/package/redis
*/
export class RedisCache {
  public connected: boolean = false
  private refreshTokens: Array<[string, string]>
  private client: any
  private readonly refreshTokenKey = 'refreshToken'
  private readonly accessTokenKey = 'accessToken'

  constructor() {
    this.refreshTokens = []
  }

  public init(options: ClientParams) {

      this.client = redis.createClient(options)
      this.client.on('error', (err) => logger.error(`Redis => Error: ${err}`))
      this.client.on('warning', (warning) => logger.info(`Redis => ${warning}`))
      this.client.on('connect', (arg) => {
        logger.info(`Redis => Connected`)
        this.connected = true
      })
  }

  public async saveAccessTokenAsync(id: string, accessToken: string) {
    await this.client.setAsync(accessToken, id)
  }

  public async deleteAccessTokenAsync(accessToken: string): Promise<boolean> {
    return (await this.client.delAsync(accessToken)) === 1
  }

  public async getAccessTokenAsync(id: string): Promise<string> {
    return await this.client.getAsync(`${id}`)
  }

  public async getUserIdAsync(accessToken: string): Promise<string> {
    return await this.client.getAsync(accessToken)
  }

  public async isValidAccessTokenAsync(accessToken: string, id: string): Promise<boolean> {
    return (await this.client.sismemberAsync(id, accessToken)) === 1
  }
}

export const redisCache: RedisCache = new RedisCache()
