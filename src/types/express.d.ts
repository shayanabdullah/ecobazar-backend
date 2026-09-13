import { UserJwtPayload } from "./types.js";

declare global {
  namespace Express {
    interface Request {
      user: UserJwtPayload;
    }
  }
}

export {};