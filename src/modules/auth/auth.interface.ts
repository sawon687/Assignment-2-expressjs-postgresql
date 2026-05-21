const roles=['contributor','maintainer']as const
export interface IUser{
    name:string,
    email:string,
    password:string,
    role:(typeof roles)[number]
}


export interface IReturnUser{
    
    id:number,
    name:string,
    email:string
    role:string
    created_at:Date 
    updated_at:Date
  
}