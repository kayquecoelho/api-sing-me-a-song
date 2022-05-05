import { Request, Response, Router } from "express";
import { prisma } from "../database.js";

const adminRouter = Router();

adminRouter.delete("/database", async (req: Request, res: Response) => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`;

  res.sendStatus(200);
});

export default adminRouter;
