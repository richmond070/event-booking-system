export type UserRecord = {
  userId: string;
  name: string;
  email: string;
};

export interface IUserCache {
  /**
   * Add a user to the cache
   */
  addUser(user: UserRecord): void;

  /**
   * Get a user by email
   */
  getUserByEmail(email: string): UserRecord | undefined;

  /**
   * Get a user by userId
   */
  getUserById(userId: string): UserRecord | undefined;

  /**
   * Check if a user exists by email
   */
  exists(email: string): boolean;

  /**
   * Clear the cache (useful for testing)
   */
  clear(): void;
}
