import { createApp } from "./app.js";

const { APP_PORT, APP_URI } = process.env;
const app = createApp(APP_URI || "");

app.listen(APP_PORT, () => {
  console.log(`Listenting on ${APP_URI}`);
});
