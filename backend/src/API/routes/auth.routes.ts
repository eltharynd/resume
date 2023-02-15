import { Authpal } from 'authpal'
import { Router } from 'express'
import { Sessions } from '../../db/models/sessions.model'
import { Users } from '../../db/models/users.model'
import { Mongo } from '../../db/mongo'
import environment from '../../environment'
import { Routes } from '../classes/routes'

export class AuthRoutes extends Routes {
  static authpal: Authpal
  static authGuard

  constructor(prefix, app) {
    AuthRoutes.authpal = new Authpal({
      jwtSecret: environment.jwtSecret,
      usernameField: 'email',

      findUserByUsernameCallback: async (email) => {
        let user = await Users.findOne({ email })
        return user ? { userid: user._id.toString() } : null
      },

      findUserByIDCallback: async (userid) => {
        let user = await Users.findOne({ _id: userid })
        return user ? { userid: user._id.toString() } : null
      },
      findUserByRefreshToken: async (token) => {
        let session = await Sessions.findOne({
          token,
        })
        if (session?.expiration?.getTime() <= Date.now()) {
          await session.delete()
          return null
        }
        return session
          ? {
              userid: session.user.toString(),
            }
          : null
      },
      tokenRefreshedCallback: async (jwtPayload, token) => {
        let exists = await Sessions.findOne({
          user: Mongo.ObjectId(`${jwtPayload.userid}`),
          token: token.token,
        })
        if (exists) {
          exists.expiration = token.expiration
          await exists.save()
        } else {
          await Sessions.create({
            user: jwtPayload.userid,
            token: token.token,
            expiration: token.expiration,
          })
        }
      },
      tokenDeletedCallback: async (jwtPayload, token) => {
        let exists = await Sessions.findOne({
          user: Mongo.ObjectId(`${jwtPayload.userid}`),
          token: token.token,
        })
        if (exists) await exists.delete()
      },
      verifyPasswordCallback: async (email, password) => {
        let user = await Users.findOne({ email })
        return user?.verifyPassword(password)
      },
    })

    AuthRoutes.authGuard = (req, res, next) => {
      AuthRoutes.authpal.authorizationMiddleware(req, res, async function () {
        try {
          let user = await Users.findById(Mongo.ObjectId(req.user.userid))
          if (user?.email.endsWith('@founderstudio.io')) {
            req.user.isAdmin = true
          }
        } catch (e) {
          console.error(e)
        }
        next()
      })
    }

    super(prefix, app)
  }

  defineRoutes(router: Router) {
    /* router.post(
      '/signup',
      requestBodyGuard(['username', 'email', 'password']),
      async (req, res) => {
        let user = await Users.create({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
        })
        res.send(user.clean())
      }
    ) */

    router.post('/login', AuthRoutes.authpal.loginMiddleWare)

    router.get('/resume', AuthRoutes.authpal.resumeMiddleware)

    router.get('/logout', AuthRoutes.authpal.logoutMiddleware)

    router.get(
      '/me',
      AuthRoutes.authpal.authorizationMiddleware,
      async (req, res) => {
        let user = await Users.findById(Mongo.ObjectId(req.user.userid))
        res.json(user.clean())
      }
    )
  }
}
