import { createClient } from "redis";
import { env } from "./env";

type RedisClient = ReturnType<typeof createClient>;

let clients: { publisher: RedisClient; subscriber: RedisClient } | null = null;
let connectionPromise: Promise<{ publisher: RedisClient; subscriber: RedisClient } | null> | null = null;

export async function getRedisClients() {
  if (!env.REDIS_URL) {
    return null;
  }

  if (clients) {
    return clients;
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      const publisher = createClient({ url: env.REDIS_URL });
      const subscriber = publisher.duplicate();

      publisher.on("error", (error) => {
        console.warn("Redis publisher error.", error);
      });
      subscriber.on("error", (error) => {
        console.warn("Redis subscriber error.", error);
      });

      try {
        await Promise.all([publisher.connect(), subscriber.connect()]);
      } catch (error) {
        console.warn("Redis connection unavailable. Continuing without adapter.", error);
        await Promise.allSettled([publisher.quit(), subscriber.quit()]);
        return null;
      }

      clients = { publisher, subscriber };
      return clients;
    })().finally(() => {
      connectionPromise = null;
    });
  }

  return connectionPromise;
}