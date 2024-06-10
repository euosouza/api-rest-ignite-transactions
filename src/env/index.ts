import "dotenv/config";
import { z } from "zod";

const envShema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333)
});

export const env = envShema.parse(process.env);

