
import { pool } from '../../db';
import type { IIssues, IssueQuery } from './issues.interface';
import type { IReturnUser, IUser } from '../auth/auth.interface'



  class IssuesService {
    // Create Issues
  async createIssuesDB(payload: IIssues, id:number) {
 
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
// All Issues Get
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
  if(issuesdata.length===0)return []

  const reporterid = [...new Set(issuesdata.map(i => i.reporter_id))];
if (reporterid.length === 0) {
    return issuesdata.map(i => ({ ...i, reporter: null }));
  }
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
    title:i.title,
    description: i.description,
    type: i.type,
    status: i.status,
    reporter: userLoukupTable[i.reporter_id] || null,
    created_at: i.created_at,
    updated_at: i.updated_at
  }));


  return issues;
}   
// Single Issues
     async singleIssuesDB(id:string){
    
         const result= await pool.query(`
            SELECT * FROM issues WHERE id=$1
             
            `,[id])

    
        return result

    }
          // get remoprrer
      async getReporter(id: number) {
    const res = await pool.query(
      `SELECT id, name, role FROM users WHERE id=$1`,
      [id]
    );
    return res.rows[0];
  }
    // delete issues 
     async deleteIssuesDB(id:string){
          const result= await pool.query(`
            DELETE FROM issues WHERE id=$1
            RETURNING *
            `,[id])
        
            return result
    }
    // Update Issues
  async updateIssuesDB(
   user: Omit<IReturnUser, "created_at" | "updated_at">,
  issues:IIssues & {status:string},
  id: string
) {

  const { title, description, type ,status } = issues;
  console.log('issues',user)


    if(!user)
    {
       throw new Error('unathorized access')
    }
  // maintainer
  if (user.role === "maintainer") {
    const result=await pool.query(`
      UPDATE issues
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status=COALESCE($4, status),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `, [title, description, type, status, id])

  return result.rows[0]
  }

  //  contributor 
   if (user.role === "contributor") {

    const issueExit = await pool.query(
      `SELECT * FROM issues WHERE id=$1 AND reporter_id=$2`,
      [id, user.id]
    );

    if (issueExit.rows.length === 0) {
      throw new Error("Issue not found or not owned by user");
    }

    const issueData = issueExit.rows[0];

    if (issueData.status !== "open") {
      throw new Error("Only open issues can be updated");
    }

  const  result= await  pool.query( `
      UPDATE issues
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `,[title, description, type, id]);
    return result.rows[0]
  }


   
    throw new Error("Unauthorized role");
  


}
}


export default new IssuesService()