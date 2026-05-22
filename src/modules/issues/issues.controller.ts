import type { Request, Response } from 'express';
import issuesService from './issues.service';
import { sendResponse } from '../../utils/sendResponse';
import type { JwtPayload } from 'jsonwebtoken';
import type { IReporter } from './issues.interface';

class IssuesController{
   async createIssues(req:Request,res:Response){
    const user=req.user as JwtPayload
       const result=await issuesService.createIssuesDB(req.body,user.id )

       if(result?.rows?.length===0)
       {
          sendResponse(res,{message:'Issue created successfully',status:400,success:false})
       }

       sendResponse(res,{message:'issues  created successfully',status:201,success:true, data:result.rows[0]})
    }
    async getAllIssues(req:Request,res:Response){
          
    }
    async singleIssues(req:Request,res:Response)
    {   
        //  const user=req.user as IReporter
        //  if(!user)
        //  {
        //      sendResponse(res,{message:'unathorized access',status:401,success:false})
        //  }
        // const result=await issuesService.singleIssuesDB(user.id)

        // const issuesData={

        // }
    }
    async updateIssues(req:Request,res:Response){

    }
    async deleteIssues(req:Request,res:Response){

    }
}

export default new IssuesController()