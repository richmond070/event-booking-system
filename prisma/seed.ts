import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log(" Starting database seed...");

    // -----------------------------------------------------
    // 1. Create Users
    // -----------------------------------------------------
    const alice = await prisma.user.create({
        data: {
            name: "Alice Johnson",
            email: "alice@example.com",
        },
    });

    const bob = await prisma.user.create({
        data: {
            name: "Bob Daniel",
            email: "bob@example.com",
        },
    });

    const charlie = await prisma.user.create({
        data: {
            name: "Charlie Kim",
            email: "charlie@example.com",
        },
    });

    console.log(" Users created");

    // -----------------------------------------------------
    // 2. Create Event
    // -----------------------------------------------------
    const launchEvent = await prisma.event.create({
        data: {
            name: "Tech Launch Event",
            totalTickets: 2,
            availableTickets: 0, // because we will create 2 bookings
        },
    });

    console.log(" Event created:", launchEvent.event_id);

    // -----------------------------------------------------
    // 3. Create Bookings (2 tickets booked)
    // -----------------------------------------------------
    const booking1 = await prisma.booking.create({
        data: {
            eventId: launchEvent.event_id,
            userId: alice.user_id,
            status: BookingStatus.BOOKED,
        },
    });

    const booking2 = await prisma.booking.create({
        data: {
            eventId: launchEvent.event_id,
            userId: bob.user_id,
            status: BookingStatus.BOOKED,
        },
    });

    console.log(" Bookings created:", booking1.booking_id, booking2.booking_id);

    // -----------------------------------------------------
    // 4. Add Waiting List entry (Charlie is waiting)
    // -----------------------------------------------------
    const waiting1 = await prisma.waitingList.create({
        data: {
            eventId: launchEvent.event_id,
            userId: charlie.user_id,
            position: 1, // first in queue
        },
    });

    console.log(" Waiting list entry created:", waiting1.waitList_id);

    console.log(" Database seeding completed successfully");
}

main()
    .catch((err) => {
        console.error(" Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
