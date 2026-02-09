const cron = require('node-cron');
const Table = require('../models/tablemodel');

cron.schedule('* * * * *', async () => {
    const now = new Date();
    const result = await Table.updateMany(
        { isAvailable: false, bookingEnd: { $lte: now } },
        {
            $set: {
                isAvailable: true,
                bookingStart: null,
                bookingEnd: null,
                bookedHours: null,
                userId: null
            }
        }
    );

    if (result.modifiedCount > 0)
        console.log(`⏳ ${result.modifiedCount} table(s) auto released`);
});
