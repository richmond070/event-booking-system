import { prisma } from "../../config/database";
import { UserCache } from "./user.cache";
import { UserRecord } from "./user.interface";


const userCache = new UserCache();

/**
 * UserService
 * - Finds or creates a user by email
 * - Uses UserCache for fast lookups
 * - Persists/reads users with Prisma
 */
export class UserService {
  constructor(private userCache: UserCache) { }

  async findOrCreateByEmail(payload: { name: string; email: string }): Promise<UserRecord> {
    const { name, email } = payload;

    if (!email) throw new Error("email is required to identify/create a user");

    const cached = this.userCache.getUserByEmail(email);
    if (cached) return cached;

    const dbUser = await prisma.user.findUnique({ where: { email } });

    let userRecord: UserRecord;
    if (dbUser) {
      userRecord = { userId: dbUser.user_id, name: dbUser.name ?? "", email: dbUser.email ?? "" };
    } else {
      const created = await prisma.user.create({ data: { name, email } });
      userRecord = { userId: created.user_id, name: created.name ?? "", email: created.email ?? "" };
    }

    this.userCache.addUser(userRecord);
    return userRecord;
  }

  async getById(userId: string): Promise<UserRecord | null> {
    const cached = this.userCache.getUserById(userId);
    if (cached) return cached;

    const dbUser = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!dbUser) return null;

    const user: UserRecord = { userId: dbUser.user_id, name: dbUser.name ?? "", email: dbUser.email ?? "" };
    this.userCache.addUser(user);
    return user;
  }
}
