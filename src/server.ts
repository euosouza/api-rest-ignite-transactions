
import { app } from "./app";
import { env } from "./env";

app.listen({ port: env.PORT })
  .then(() => console.log("🔥 Http server running, in port 3333"))
  .catch((e) => console.log(e));
