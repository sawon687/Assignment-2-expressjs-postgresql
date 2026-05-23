import type { Request, Response } from "express";
import issuesService from "./issues.service";
import { sendResponse } from "../../utils/sendResponse";
import type { JwtPayload } from "jsonwebtoken";
import type { IIssues, IReIssues, IReporter } from "./issues.interface";
import type { IReturnUser } from "../auth/auth.interface";

class IssuesController {
  // crearteIssues
  async createIssues(req: Request, res: Response) {
    const user = req.user as JwtPayload;
    const result = await issuesService.createIssuesDB(req.body, user.id);

    if (result?.rows?.length === 0) {
      sendResponse(res, {
        message: "Issue created successfully",
        status: 400,
        success: false,
      });
    }

    sendResponse(res, {
      message: "issues  created successfully",
      status: 201,
      success: true,
      data: result.rows[0],
    });
  }
//   Get All Issues
  async getAllIssues(req: Request, res: Response) {
    const query = req.query;
    console.log("query", query);
    const result = await issuesService.AllIssuesDB(query);
    if (result.length === 0) {
      sendResponse(res, {
        message: "issues not found",
        success: true,
        status: 200,
      });
    }

    sendResponse(res, { success: true, status: 200, data: result });
  }
// get single Issues
  async singleIssues(req: Request, res: Response) {
    const user = req?.user as IReporter;
    if (!user) {
      throw new Error("unauthorize access ");
    }
    const { id } = req.params;

    const result = await issuesService.singleIssuesDB(id as string);

    if (result.rows.length == 0) {
      sendResponse(res, {
        success: false,
        message: "Issue not found",
        status: 404,
      });
      return;
    }

    const issues = result.rows[0] as Omit<IReIssues, "reporter">;
    const reporterdata = await issuesService.getReporter(
      issues.reporter_id as number,
    );
    const resultData: IReIssues = {
      id: issues.id,
      title: issues.title,
      description: issues.description,
      type: issues.type,
      status: issues.status,
      reporter: reporterdata,
      created_at: issues.created_at,
      updated_at: issues.updated_at,
    };

    sendResponse(res, { success: true, data: resultData, status: 201 });
  }
//   update Issues
  async updateIssues(req: Request, res: Response) {
    const user = req?.user as Omit<IReturnUser, "created_at" | "updated_at">;
    console.log("user req", user);
    const { id } = req.params;
    console.log("boyd issues", req.body);
    const result = await issuesService.updateIssuesDB(
      user,
      req.body,
      id as string,
    );

    sendResponse(res, {
      success: true,
      message: "Issue updated successfully",
      status: 200,
      data: result,
    });
  }
//   delete issues
  async deleteIssues(req: Request, res: Response) {
    const user = req?.user as IReporter;

    if (!user) {
      throw new Error("unauthorize access ");
    }
    const { id } = req.params;

    const result = await issuesService.deleteIssuesDB(id as string);

    if (result.rows.length === 1) {
      sendResponse(res, {
        success: true,
        message: "Issue deleted successfully",
        status: 200,
      });
      return;
    }

    sendResponse(res, {
      success: true,
      message: "Issue deleted not successfully",
      status: 201,
    });
  }
}

export default new IssuesController();
