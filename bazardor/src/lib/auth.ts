import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

const db = new Database("bazardor.sqlite");

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});