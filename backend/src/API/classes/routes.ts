import { Router } from 'express'
import environment from '../../environment'

export abstract class Routes {
  constructor(prefix, app) {
    let router = Router()
    this.defineRoutes(router)
    app.use(`${environment.apiBase}${prefix}`, router)
  }

  abstract defineRoutes(router: Router)
}

/**
 * Express middleware to check the presence of all required parameters in body.
 *
 * @remarks If any of the specified parameters are missing from the request, returns a BAD_REQUEST with an array listing the missing parameters
 *
 * @param required - An array of strings listing the names of required parameters
 * @returns void (sends a 400 BAD_REQUEST response if not present)
 **/
export const requestBodyGuard = (required: string[]) => {
  return (req, res, next) => {
    if (!required || required.length === 0) return next()

    let missing = []
    for (let param of required) if (!req.body[param]) missing.push(param)
    if (missing.length === 0) return next()

    let string = ``
    for (let m of missing)
      string += `${string.length === 0 ? 'Missing parameters: ' : ''}${m}, `

    return res.status(400).send(string.slice(0, -2))
  }
}
