import { Pool } from 'pg';
import { pool } from '../../db';
import type { IIssues, IReIssues, IReporter } from './issues.interface';


  class IssuesService {
  async createIssuesDB(payload: IIssues, id:number) {
    console.log('id',id)
      if(!id)
      {
         throw new Error('unathurized access! pleace login')
      }

 
    if (!payload) {
      throw new Error('Empty body! Please include data body');
    }

    const { title, description, type } = payload;
   

    const status = 'open';

    const result = await pool.query(
      `
      INSERT INTO issues(title, description, type, status,  reporter_id)
      VALUES($1, $2, $3, $4,$5)
      RETURNING *
      `,
      [title, description, type, status,id]
    );

    return result;
  }

     async AllIssuesDB(){

    }
     async singleIssuesDB(){
        // if(!id)
        // {
        //      throw new Error('unauthorize access')
        // }
        //  const result= await pool.query(`
        //     SELECT * FROM issues where id=$1
             
        //     `,[id])

       
        // return result

    }
     async deleteIssuesDB(){

    }
     async updateIssuesDB(){

    }
}


export default new IssuesService()