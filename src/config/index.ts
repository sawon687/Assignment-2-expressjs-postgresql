import dotenv from "dotenv"
import path from 'path'


dotenv.config({
    path:path.join(process.cwd(),'.env')
})

const config={
    connectionString:process.env.POST_SQL as string,
    port:process.env.PORT,
    node_env:process.env.GOLOBAL_ERROR as string,
    access_secret:process.env.ACCESS_SECRET as string,
    refresh_secret:process.env.REFRESH_SECRET as string
}

export default config