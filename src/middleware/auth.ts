import type { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { tokenVerifay } from '../utils/jwt';
import { pool } from '../db';
import type { JwtPayload } from 'jsonwebtoken';

export const auth=(...roles:string[])=>{
    return async(req:Request,res:Response, next:NextFunction)=>{
  const token =req.headers.authorization
  console.log(token)
  if(!token)
  {
     sendResponse(res,{message:'unathurizes acccess',status:401,success:false})
  }

  const decoded= tokenVerifay(token as string,'access') as JwtPayload
  const {email}=decoded 

  const userData= await pool.query(`
      SELECT * FROM users WHERE email=$1
    `,[email])


if(userData.rows.length === 0)
{
 sendResponse(res,{message:'user not found',status:401,success:false})

}

if(roles.length && !roles.includes(userData.rows[0].role))
{
   throw new Error('Forbidden access')
}


req.user=decoded 


  next()
}
}