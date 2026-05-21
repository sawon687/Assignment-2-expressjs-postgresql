import jwt from 'jsonwebtoken'
import type { IReturnUser, IUser } from '../modules/auth/auth.interface'
import config from '../config'
export const signToken=(payload:Omit<IReturnUser,'created_at|updated_at'>)=>{
    console.log(payload) 
    const accesstoken= jwt.sign(payload, config.access_secret,{
        expiresIn:'1d'
    })
    const refershtoken=  jwt.sign(payload,config.refresh_secret,{
        expiresIn:'10d'
    })

    return {accesstoken,refershtoken}
}