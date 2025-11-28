// src/tests/unit/user.service.test.ts
import { UserService } from "../../modules/user/user.service";
import { prisma } from "../../config/database";
import { UserCache } from "../../modules/user/user.cache";
import { UserRecord } from "../../modules/user/user.interface";

jest.mock("../../config/database"); // mock prisma
jest.mock("../../modules/user/user.cache"); // mock cache

describe("UserService", () => {
    let userService: UserService;
    let mockCache: jest.Mocked<UserCache>;

    const sampleUser: UserRecord = {
        userId: "user-1",
        name: "Alice",
        email: "alice@example.com",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        const userCache = new UserCache();
        userService = new UserService(userCache);
        const instance = (UserCache as jest.MockedClass<typeof UserCache>).mock.instances[0];
        if (!instance) throw new Error("UserCache mock instance not found");
        mockCache = instance as jest.Mocked<UserCache>;
    });

    describe("findOrCreateByEmail", () => {
        it("should throw if email is missing", async () => {
            await expect(userService.findOrCreateByEmail({ name: "Bob", email: "" }))
                .rejects.toThrow("email is required to identify/create a user");
        });

        it("should return cached user if found", async () => {
            mockCache.getUserByEmail.mockReturnValue(sampleUser);

            const result = await userService.findOrCreateByEmail({ name: "Alice", email: "alice@example.com" });
            expect(result).toEqual(sampleUser);
            expect(prisma.user.findUnique).not.toHaveBeenCalled();
        });

        it("should return user from DB if not in cache", async () => {
            mockCache.getUserByEmail.mockReturnValue(undefined);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                user_id: "user-1",
                name: "Alice",
                email: "alice@example.com",
            });

            const result = await userService.findOrCreateByEmail({ name: "Alice", email: "alice@example.com" });
            expect(result).toEqual(sampleUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "alice@example.com" } });
            expect(mockCache.addUser).toHaveBeenCalledWith(sampleUser);
        });

        it("should create user if not in cache or DB", async () => {
            mockCache.getUserByEmail.mockReturnValue(undefined);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue({
                user_id: "user-1",
                name: "Alice",
                email: "alice@example.com",
            });

            const result = await userService.findOrCreateByEmail({ name: "Alice", email: "alice@example.com" });
            expect(result).toEqual(sampleUser);
            expect(prisma.user.create).toHaveBeenCalledWith({ data: { name: "Alice", email: "alice@example.com" } });
            expect(mockCache.addUser).toHaveBeenCalledWith(sampleUser);
        });
    });

    describe("getById", () => {
        it("should return cached user if found", async () => {
            mockCache.getUserById.mockReturnValue(sampleUser);

            const result = await userService.getById("user-1");
            expect(result).toEqual(sampleUser);
            expect(prisma.user.findUnique).not.toHaveBeenCalled();
        });

        it("should return user from DB if not in cache", async () => {
            mockCache.getUserById.mockReturnValue(undefined);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                user_id: "user-1",
                name: "Alice",
                email: "alice@example.com",
            });

            const result = await userService.getById("user-1");
            expect(result).toEqual(sampleUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { user_id: "user-1" } });
            expect(mockCache.addUser).toHaveBeenCalledWith(sampleUser);
        });

        it("should return null if user not found in cache or DB", async () => {
            mockCache.getUserById.mockReturnValue(undefined);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await userService.getById("non-existent");
            expect(result).toBeNull();
            expect(mockCache.addUser).not.toHaveBeenCalled();
        });
    });
});
