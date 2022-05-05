import dotenv from "dotenv";

let envFile = ".env.test";

if (process.env.NODE_ENV === "development") envFile=".env";

export default dotenv.config({path: envFile});