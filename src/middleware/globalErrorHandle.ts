
import type { NextFunction, Request, Response } from "express";

const globalErrorHandle = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error:err.stack
  });

};

export default globalErrorHandle;