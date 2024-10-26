import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authToken = req.headers.authorization
        if (authToken == null) {
          return res.status(401).end()
        }
    
        const [, token] = authToken.split(' ')

        verify(
          token,
          process.env.SECRET ?? ''
        )
  
  
        next()
      } catch (error) {
        return res.status(401).end()
      }
}
