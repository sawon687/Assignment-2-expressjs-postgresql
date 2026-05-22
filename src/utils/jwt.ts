import jwt from 'jsonwebtoken'
import type { IReturnUser, IUser } from '../modules/auth/auth.interface'
import config from '../config'


export const tokenVerifay=(token:string, type:"access"|"refresh")=>{
    const secret=type==="access"?config.access_secret:config.refresh_secret
  const decoded=  jwt.verify(token ,secret)
    
  return decoded
}
export const signToken=(payload:Omit<IReturnUser,'created_at|updated_at'>)=>{
    const accessToken= jwt.sign(payload, config.access_secret,{
        expiresIn:'1d'
    })
    const refershToken=  jwt.sign(payload,config.refresh_secret,{
        expiresIn:'10d'
    })

    return {accessToken,refershToken}
}