import { connectMongo } from "./config/mongodb";
import { app } from "./app";
import { env } from "./config/env";
import { setupSocket } from "./config/socket";

async function start() {
  await connectMongo();
  console.info("MongoDB connected.");

  const server = app.listen(env.PORT, () => {
    console.info(`BDMS backend listening on http://localhost:${env.PORT}`);
  });

  void setupSocket(server);
}

void start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
