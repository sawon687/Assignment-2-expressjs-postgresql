import type { NextFunction, Request, Response } from 'express';
import fs from 'fs'
export const logger=(req:Request,res:Response, next:NextFunction)=>{
    console.log(`req ${req.url} res ${req.method} data ${new Date().toLocaleString()}`)
    const logger=`req ${req.url} res ${req.method} data ${new Date().toLocaleString()}`as string
    fs.appendFile('index.txt',logger,(error)=>{
           console.log('eroro',error)
    })
    next()
}