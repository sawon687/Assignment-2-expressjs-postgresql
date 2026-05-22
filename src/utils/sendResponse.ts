import type { Response } from 'express';
import type { IApiResponse } from '../types';

export const sendResponse = <T>(res:Response, { message, data, status, success ,error}: IApiResponse<T>) => {
    console.log(`message=${message},data=${data} status=${status} error=${error}`)
    res.status(status).json(
    {  success:error?false:success,
        message,
        data:error? undefined :data
       
    }
    ) 
}

