import { createLogger , Logger as LoggerInstance, LoggerOptions, transports, format } from 'winston'

export class Logger {
  private logger: LoggerInstance

  constructor(level: string) {
    // Initialization inside the constructor
    this.logger = createLogger({
      level,
      format: format.combine(
        format.colorize(),
        format.timestamp(() => new Date().toISOString()),
        format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`),
      ),
      transports: [new transports.Console()],
    })
  }

  public info(message: string | object) {
    if (typeof message === 'string') {
      this.logger.info(message)
    } else {
      this.logger.info(JSON.stringify(message))
    }
  }

  public error(message: string | object) {
    if (typeof message === 'string') {
      this.logger.error(message)
    } else {
      this.logger.error(JSON.stringify(message))
    }
  }
}
