import { IUserCache, UserRecord } from "./user.interface";

export class UserCache implements IUserCache {
  // Primary key: userId
  private usersById: Map<string, UserRecord> = new Map();
  // Secondary key: email
  private usersByEmail: Map<string, UserRecord> = new Map();

  addUser(user: UserRecord): void {
    this.usersById.set(user.userId, user);
    this.usersByEmail.set(user.email, user);
  }

  getUserByEmail(email: string): UserRecord | undefined {
    return this.usersByEmail.get(email);
  }

  getUserById(userId: string): UserRecord | undefined {
    return this.usersById.get(userId);
  }

  exists(email: string): boolean {
    return this.usersByEmail.has(email);
  }

  clear(): void {
    this.usersById.clear();
    this.usersById.clear();
  }
}
