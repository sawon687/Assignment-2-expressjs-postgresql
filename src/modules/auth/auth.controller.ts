import AuthServices from "./auth.service";
import type { IReturnUser } from "./auth.interface";
import { sendResponse } from "../../utils/sendResponse";
import type { Request, Response } from "express";
import authService from "./auth.service";
import jwt from "jsonwebtoken";
class AuthController {
  async signup(req: Request, res: Response) {
    console.log("data", req.body);
    const result = await AuthServices.createUser(req.body);
    if (result.rows.length===0) {
      return sendResponse(res, {
        message: "user not registered successfully ",
        success: false,
        status: 400,
        error: true,
      });
    }
    return sendResponse(res, {
      message: "User registered successfully",
      status: 201,
      success: true,
      data: result.rows[0],
    });
  }

  async login(req: Request, res: Response) {
    console.log("req body", req.body);
    const result = await authService.loginUser(req.body);
    const { refershToken, ...userData} = result;
    sendResponse(res, {
      message: "Login successfully",
      status: 200,
      success: true,
      data: userData,
    });
    res.cookie("refreshToken", refershToken, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    });
  }
}

export default new AuthController();
