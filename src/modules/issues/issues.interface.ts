export interface IIssues{
    
  title:string; 
  description:string;
  type:string

}

export interface IReporter{
   id:number;
        name:string;
        role:string
}

export interface IReIssues{
     
    id:number;
    title:string;
    description:string;
    type:string;
    status:string;
    reporter_id?:number
    reporter:IReporter;
    created_at:Date
    updated_at:Date
  
}