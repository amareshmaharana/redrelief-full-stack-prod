import type { Server as HttpServer } from "http";
import type { Role } from "../models/domain";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { env } from "./env";
import { verifyAccessToken } from "../utils/jwt";
import { getRedisClients } from "./redis";

let io: Server | null = null;

export async function setupSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  const redisClients = await getRedisClients();
  if (redisClients) {
    io.adapter(createAdapter(redisClients.publisher, redisClients.subscriber));
    console.info("Socket.IO Redis adapter enabled.");
  } else {
    console.info("Socket.IO running without Redis adapter.");
  }

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      socket.data.user = {
        id: Number(payload.sub),
        role: payload.role as Role,
      };
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user?.id;
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  return io;
}

export function emitToUser(userId: number, event: string, payload: unknown) {
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit(event, payload);
}
