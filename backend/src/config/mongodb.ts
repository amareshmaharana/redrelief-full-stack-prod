import mongoose from "mongoose";
import dns from "node:dns";
import { env } from "./env";

let connectPromise: Promise<typeof mongoose> | null = null;

function configureDnsServers() {
  if (!env.MONGODB_DNS_SERVERS) {
    return;
  }

  const servers = env.MONGODB_DNS_SERVERS.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    dns.setServers(servers);
  }
}

function isSrvDnsError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const err = error as Error & { code?: string; syscall?: string };
  return (
    err.syscall === "querySrv" &&
    (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "ETIMEOUT")
  );
}

async function connectWithUri(uri: string) {
  connectPromise = mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await connectPromise;
    return mongoose;
  } catch (error) {
    connectPromise = null;
    throw error;
  }
}

export async function connectMongo() {
  if (!env.MONGODB_URI) {
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  configureDnsServers();

  try {
    return await connectWithUri(env.MONGODB_URI);
  } catch (error) {
    if (isSrvDnsError(error) && env.MONGODB_URI_DIRECT) {
      console.warn("MongoDB SRV DNS lookup failed. Retrying with direct Atlas URI.");
      return connectWithUri(env.MONGODB_URI_DIRECT);
    }

    if (isSrvDnsError(error) && env.MONGODB_URI_FALLBACK) {
      console.warn("MongoDB SRV DNS lookup failed. Retrying with fallback URI.");
      return connectWithUri(env.MONGODB_URI_FALLBACK);
    }

    if (env.MONGODB_URI_FALLBACK) {
      console.warn("MongoDB Atlas connection failed. Retrying with fallback URI.");
      return connectWithUri(env.MONGODB_URI_FALLBACK);
    }

    throw error;
  }
}