
import { Router } from "express";
import { Factory } from "./factory";

export function createExpressRoutes() {
  const router = Router()
  const controllers = Factory.perform()
  router.get('/hello', controllers.get)

  return router
}