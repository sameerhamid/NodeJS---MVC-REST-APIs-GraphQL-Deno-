import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";

export class SocketIoServer {
  private static io: SocketIOServer | null = null;

  // Initialize the Socket.IO server
  static init(httpServer: Server): SocketIOServer {
    if (!this.io) {
      this.io = new SocketIOServer(httpServer, {
        cors: {
          origin: "*",
        },
      });
    }
    return this.io;
  }

  // Get the Socket.IO instance
  static getIo(): SocketIOServer {
    if (!this.io) {
      throw new Error("Socket.IO server is not initialized!");
    }
    return this.io;
  }
}
