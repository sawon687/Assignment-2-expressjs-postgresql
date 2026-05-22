export interface IApiResponse<T>{
    message?:string,
    status:number,
    data?:T,
    success:boolean,
    error?:boolean
}