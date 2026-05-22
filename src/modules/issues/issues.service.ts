import { Pool } from 'pg';
import { pool } from '../../db';
import type { IIssues, IReIssues, IReporter } from './issues.interface';
import { DESTRUCTION } from 'node:dns';
import { describe } from 'node:test';


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

async AllIssuesDB(query: IssueQuery) {
  const { type, sort = 'newest', status } = query;

  const values: any[] = [];
  let sql = `SELECT * FROM issues`;

  const conditions: string[] = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ');
  }

  if (sort === 'oldest') {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  const result = await pool.query(sql, values);
  const issuesdata = result.rows;

  const reporterid = [...new Set(issuesdata.map(i => i.reporter_id))];

  const userData = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterid]
  );

  const users = userData.rows;

  const userLoukupTable = users.reduce((acc, u) => {
    acc[u.id] = {
      ...u
    };
    return acc;
  }, {});

  const issues = issuesdata.map(i => ({
    id: i.id,
    description: i.description,
    type: i.type,
    status: i.status,
    reporter: userLoukupTable[i.reporter_id] || null,
    created_at: i.created_at,
    updated_at: i.updated_at
  }));

  return issues;
}
     async singleIssuesDB(id:string){
    
         const result= await pool.query(`
            SELECT * FROM issues WHERE id=$1
             
            `,[id])

       
        return result

    }
     async deleteIssuesDB(id:string){
          const result= await pool.query(`
            DELETE FROM issues WHERE id=$1
            RETURNING *
            `,[id])
        
            return result
    }
     async updateIssuesDB(){

    }
}


export default new IssuesService()