import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'
import * as express from 'express'
import { createServer, Server } from 'http'
import environment from '../environment'

import { AuthRoutes } from './routes/auth.routes'

export class Express {
  app: express.Express
  server: Server

  static origins: string[]

  constructor() {
    this.app = express()

    Express.origins = ['http://localhost:4200']
    if (environment.production) {
      Express.origins = [
        `https://${environment.domain}`,
        `https://www.${environment.domain}`,
      ]
    } else {
      Express.origins.push(`https://${environment.domain}`)
      Express.origins.push(`https://www.${environment.domain}`)
    }
    this.app.use(
      cors({
        origin: Express.origins,
        optionsSuccessStatus: 200,
        credentials: true,
      })
    )

    this.app.set('trust proxy', true)
    this.app.use(bodyParser.json())
    this.app.use(
      express.json({
        verify: (req: any, res, buff) => {
          req.rawBody = buff
        },
      })
    )
    this.app.use(cookieParser())

    new AuthRoutes('auth', this.app)

    this.app.get('/', (req, res) => res.status(200).send('Backend reached'))

    this.app.use((err, req, res, next) => {
      if (res.headersSent) return next(err)
      res.sendStatus(500)
      next(err)
    })
  }

  async start(portOverride?: number): Promise<express.Express> {
    return new Promise((resolve, reject) => {
      this.server = createServer(this.app)
      this.server.listen(portOverride || environment.PORT)
      this.server.on('error', (error) => {
        console.error(error)
        reject(error)
      })
      this.server.on('listening', () => resolve(this.app))
    })
  }
}
