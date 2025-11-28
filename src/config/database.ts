import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const database = async () => {
    try {
        await prisma.$connect();
        console.log("Connected!");
    } catch (err) {
        console.log("Error! " + err);
    }
};

export { database, prisma };
