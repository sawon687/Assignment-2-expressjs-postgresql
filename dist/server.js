
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  console.log(`req ${req.url} res ${req.method} data ${(/* @__PURE__ */ new Date()).toLocaleString()}`);
  const logger2 = `
 req ${req.url} res ${req.method} data ${(/* @__PURE__ */ new Date()).toLocaleString()} 
`;
  fs.appendFile("index.txt", logger2, (error2) => {
    console.log("eroro", error2);
  });
  next();
};

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connectionString: process.env.POST_SQL,
  port: process.env.PORT,
  node_env: process.env.GOLOBAL_ERROR,
  access_secret: process.env.ACCESS_SECRET,
  refresh_secret: process.env.REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connectionString
});
var initDB = async () => {
  try {
    await pool.query(
      `
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY UNIQUE,
                name VARCHAR(100),
                email VARCHAR(255) UNIQUE NOT NULL ,
                password TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'contributor',
                create_at TIMESTAMPTZ DEFAULT NOW(),
                updatae_at TIMESTAMPTZ DEFAULT NOW() )
            `
    );
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
                id SERIAL PRIMARY KEY UNIQUE,
                title  VARCHAR(150) NOT NULL,
                description	TEXT NOT NULL ,
                type VARCHAR(20) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'open',
                reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW() )`);
    console.log("Database connection is successfully");
  } catch (error2) {
    console.log(error2);
  }
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var tokenVerifay = (token, type) => {
  const secret = type === "access" ? config_default.access_secret : config_default.refresh_secret;
  const decoded = jwt.verify(token, secret);
  return decoded;
};
var signToken = (payload) => {
  const accessToken = jwt.sign(payload, config_default.access_secret, {
    expiresIn: "1d"
  });
  const refershToken = jwt.sign(payload, config_default.refresh_secret, {
    expiresIn: "10d"
  });
  return { accessToken, refershToken };
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
var AuthServices = class {
  //  createuser
  async createUser(payload) {
    const { name, email, password, role } = payload;
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
         INSERT INTO users(name,email,password,role)
         VALUES($1,$2,$3,$4)
         RETURNING *
        `,
      [name, email, passwordHash, role]
    );
    delete result.rows[0].password;
    return result;
  }
  //  login user
  async loginUser(payload) {
    const { email, password } = payload;
    const userData = await pool.query(
      `
          SELECT * FROM users  WHERE email=$1
         `,
      [email]
    );
    if (userData.rowCount === 0) {
      throw new Error("This email not found");
    }
    const passwordmatch = await bcrypt.compare(
      password,
      userData.rows[0].password
    );
    delete userData.rows[0].password;
    const user = userData.rows[0];
    if (!passwordmatch) {
      throw new Error("password Doesnot Match");
    }
    console.log("user", user);
    const payloaduser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    const { accessToken, refershToken } = signToken(
      payloaduser
    );
    return { token: accessToken, user, refershToken };
  }
};
var auth_service_default = new AuthServices();

// src/utils/sendResponse.ts
var sendResponse = (res, { message, data, status, success, error: error2 }) => {
  console.log(`message=${message},data=${data} status=${status} error=${error2}`);
  res.status(status).json(
    {
      success: error2 ? false : success,
      message,
      data: error2 ? void 0 : data
    }
  );
};

// src/modules/auth/auth.controller.ts
import "jsonwebtoken";
import "console";
var AuthController = class {
  async signup(req, res) {
    const payload = req.body;
    if (!payload.email || !payload.password || !payload.name || !payload.role) {
      throw new Error(`empty  valu asigne`);
    }
    const result = await auth_service_default.createUser(payload);
    if (result.rows.length === 0) {
      throw new Error("user not registered successfully ");
    }
    return sendResponse(res, {
      message: "User registered successfully",
      status: 201,
      success: true,
      data: result.rows[0]
    });
  }
  async login(req, res) {
    console.log("req body", req.body);
    const result = await auth_service_default.loginUser(req.body);
    const { refershToken, ...userData } = result;
    sendResponse(res, {
      message: "Login successfully",
      status: 200,
      success: true,
      data: userData
    });
    res.cookie("refreshToken", refershToken, {
      httpOnly: false,
      secure: false,
      sameSite: "lax"
    });
  }
};
var auth_controller_default = new AuthController();

// src/modules/auth/auth.route.ts
var route = Router();
route.post("/signup", auth_controller_default.signup);
route.post("/login", auth_controller_default.login);
var authRoute = route;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var IssuesService = class {
  // Create Issues
  async createIssuesDB(payload, id) {
    const { title, description, type } = payload;
    const status = "open";
    const result = await pool.query(
      `
      INSERT INTO issues(title, description, type, status,  reporter_id)
      VALUES($1, $2, $3, $4,$5)
      RETURNING *
      `,
      [title, description, type, status, id]
    );
    return result;
  }
  // All Issues Get
  async AllIssuesDB(query) {
    const { type, sort = "newest", status } = query;
    const values = [];
    let sql = `SELECT * FROM issues`;
    const conditions = [];
    if (type) {
      values.push(type);
      conditions.push(`type = $${values.length}`);
    }
    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }
    if (sort === "oldest") {
      sql += ` ORDER BY created_at ASC`;
    } else {
      sql += ` ORDER BY created_at DESC`;
    }
    const result = await pool.query(sql, values);
    const issuesdata = result.rows;
    if (issuesdata.length === 0) return [];
    const reporterid = [...new Set(issuesdata.map((i) => i.reporter_id))];
    if (reporterid.length === 0) {
      return issuesdata.map((i) => ({ ...i, reporter: null }));
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
    const issues = issuesdata.map((i) => ({
      id: i.id,
      title: i.title,
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
  async singleIssuesDB(id) {
    const result = await pool.query(`
            SELECT * FROM issues WHERE id=$1
             
            `, [id]);
    return result;
  }
  // get remoprrer
  async getReporter(id) {
    const res = await pool.query(
      `SELECT id, name, role FROM users WHERE id=$1`,
      [id]
    );
    return res.rows[0];
  }
  // delete issues 
  async deleteIssuesDB(id) {
    const result = await pool.query(`
            DELETE FROM issues WHERE id=$1
            RETURNING *
            `, [id]);
    return result;
  }
  // Update Issues
  async updateIssuesDB(user, issues, id) {
    const { title, description, type, status } = issues;
    console.log("issues", user);
    if (!user) {
      throw new Error("unathorized access");
    }
    if (user.role === "maintainer") {
      const result = await pool.query(`
      UPDATE issues
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status=COALESCE($4, status),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `, [title, description, type, status, id]);
      return result.rows[0];
    }
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
      const result = await pool.query(`
      UPDATE issues
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `, [title, description, type, id]);
      return result.rows[0];
    }
    throw new Error("Unauthorized role");
  }
};
var issues_service_default = new IssuesService();

// src/modules/issues/issues.controller.ts
var IssuesController = class {
  // crearteIssues
  async createIssues(req, res) {
    const user = req.user;
    const payload = req.body;
    if (!user?.id) {
      throw new Error("unathurized access! pleace login");
    }
    if (!payload.title || !payload.description || payload.type) {
      throw new Error("Empty body! Please include data body");
    }
    const result = await issues_service_default.createIssuesDB(payload, user.id);
    if (result?.rows?.length === 0) {
      sendResponse(res, {
        message: "Issue created successfully",
        status: 400,
        success: false
      });
    }
    sendResponse(res, {
      message: "issues  created successfully",
      status: 201,
      success: true,
      data: result.rows[0]
    });
  }
  //   Get All Issues
  async getAllIssues(req, res) {
    const query = req.query;
    console.log("query", query);
    const result = await issues_service_default.AllIssuesDB(query);
    if (!result.length) {
      throw new Error("Not found Issues");
    }
    sendResponse(res, { success: true, status: 200, data: result });
  }
  // get single Issues
  async singleIssues(req, res) {
    const { id } = req.params;
    const result = await issues_service_default.singleIssuesDB(id);
    if (result.rows.length == 0) {
      sendResponse(res, {
        success: false,
        message: "Issue not found",
        status: 404
      });
      return;
    }
    const issues = result.rows[0];
    const reporterdata = await issues_service_default.getReporter(
      issues.reporter_id
    );
    const resultData = {
      id: issues.id,
      title: issues.title,
      description: issues.description,
      type: issues.type,
      status: issues.status,
      reporter: reporterdata,
      created_at: issues.created_at,
      updated_at: issues.updated_at
    };
    sendResponse(res, { success: true, data: resultData, status: 201 });
  }
  //   update Issues
  async updateIssues(req, res) {
    const user = req?.user;
    console.log("user req", user);
    const { id } = req.params;
    console.log("boyd issues", req.body);
    const result = await issues_service_default.updateIssuesDB(
      user,
      req.body,
      id
    );
    sendResponse(res, {
      success: true,
      message: "Issue updated successfully",
      status: 200,
      data: result
    });
  }
  //   delete issues
  async deleteIssues(req, res) {
    const user = req?.user;
    if (!user) {
      throw new Error("unauthorize access ");
    }
    const { id } = req.params;
    const result = await issues_service_default.deleteIssuesDB(id);
    if (result.rows.length === 1) {
      sendResponse(res, {
        success: true,
        message: "Issue deleted successfully",
        status: 200
      });
      return;
    }
    sendResponse(res, {
      success: true,
      message: "Issue deleted not successfully",
      status: 201
    });
  }
};
var issues_controller_default = new IssuesController();

// src/middleware/auth.ts
var auth = (...roles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    console.log(token);
    if (!token) {
      sendResponse(res, { message: "unathurizes acccess", status: 401, success: false });
    }
    const decoded = tokenVerifay(token, "access");
    const { email } = decoded;
    const userData = await pool.query(`
      SELECT * FROM users WHERE email=$1
    `, [email]);
    if (userData.rows.length === 0) {
      sendResponse(res, { message: "user not found", status: 401, success: false });
    }
    if (roles.length && !roles.includes(userData.rows[0].role)) {
      throw new Error("Forbidden access");
    }
    req.user = decoded;
    next();
  };
};

// src/modules/issues/issues.route.ts
var route2 = Router2();
route2.post("/", auth(), issues_controller_default.createIssues);
route2.get("/", issues_controller_default.getAllIssues);
route2.get("/:id", issues_controller_default.singleIssues);
route2.delete("/:id", auth("maintainer"), issues_controller_default.deleteIssues);
route2.put("/:id", auth("maintainer", "contributor"), issues_controller_default.updateIssues);
var issuesRoute = route2;

// src/middleware/globalErrorHandle.ts
var globalErrorHandle = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: err.stack
  });
};
var globalErrorHandle_default = globalErrorHandle;

// src/app.ts
var app = express();
app.use(express.json());
app.use(logger);
app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRoute);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(globalErrorHandle_default);
var app_default = app;

// src/server.ts
var port = config_default.port;
var main = () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map