import type { Request, Response } from 'express';
import issuesService from './issues.service';
import { sendResponse } from '../../utils/sendResponse';
import type { JwtPayload } from 'jsonwebtoken';
import type { IReIssues, IReporter } from './issues.interface';

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
          const query=req.query
          console.log('query',query)
          const result=await issuesService.AllIssuesDB(query)
          if(result.length===0)
          {
             sendResponse(res,{message:'issues not found', success:true,status:200,})
          }

          sendResponse(res,{success:true,status:200,data:result})
    }
    async singleIssues(req:Request,res:Response)
    {  
         const user=req?.user as IReporter
         if(!user)
         {
            throw new Error('unauthorize access ')
         }
         const {id}=req.params
      
     
        const result=await issuesService.singleIssuesDB(id as string)
   
        if(result.rows.length==0)
        {
            sendResponse(res,{message:'not found issues',status:404,success:false})
            return
        }
          const issues=result.rows[0] as Omit<IReIssues,'reporter'>
        const resultData:IReIssues={
            id:issues.id,
            title:issues.title,
            description:issues.description,
            type:issues.type,
            status:issues.status,
            reporter:{
                id:user.id,
                name:user.name,
                role:user.role
            },
            created_at:issues.created_at,
            updated_at:issues.updated_at
            
            
        }

        sendResponse(res,{success:true,data:resultData,status:201})
    }
    async updateIssues(req:Request,res:Response){

    }
    async deleteIssues(req:Request,res:Response){
               const user=req?.user as IReporter
         if(!user)
         {
            throw new Error('unauthorize access ')
         }
         const {id}=req.params
      
     
        const result=await issuesService.deleteIssuesDB(id as string)
        console.log('result',result)
   
        if(result.rows.length===1)
        {
             sendResponse(res,{success:true,message:'Issue deleted successfully',status:201})
        }

        sendResponse(res,{success:true,message:'Issue deleted not successfully',status:201})
    }
}

export default new IssuesController()