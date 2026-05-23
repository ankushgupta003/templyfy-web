import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`Templyfy API listening on port ${env.PORT} (${env.APP_URL})`);
});
