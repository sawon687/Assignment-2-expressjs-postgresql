import { pool } from "../../db";
import { signToken } from '../../utils/jwt';

import type { IReturnUser, IUser } from "./auth.interface";
import bcrypt from "bcrypt";
class AuthServices {
  async createUser(payload: IUser) {
    const { name, email, password, role } = payload;
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
         INSERT INTO users(name,email,password,role)
         VALUES($1,$2,$3,$4)
         RETURNING *
        `,
      [name, email, passwordHash, role],
    );


    delete result.rows[0].password;
    return result
  }

  async loginUser(payload: { email: string; password: string }) {
    const { email, password } = payload;
    const userData = await pool.query(
      `
          SELECT * FROM users  WHERE email=$1
         `,
      [email],
    );
    if (userData.rowCount === 0) {
      throw new Error("This email not found");
    }

    const passwordmatch = await bcrypt.compare(
      password,
      userData.rows[0].password,
    );
    delete userData.rows[0].password;
    const user = userData.rows[0] as IReturnUser;
    if (!passwordmatch) {
      throw new Error("password Doesnot Match");
    }
    console.log("user", user);
    const payloaduser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refershToken } = signToken(
      payloaduser as Omit<IReturnUser, "created_at|updated_at">,
    );
   
    //payload
    // singeTOken is jenratae function
    // {acccesstoken,refresstoken}
    // cookies set refershToken
    // veryy token

    return {token:accessToken, user,refershToken };
  }
}

export default new AuthServices();
//
