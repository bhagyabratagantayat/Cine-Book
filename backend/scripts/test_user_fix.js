const mongoose = require('mongoose');
const User = require('../models/User');
const { getOrCreateUser } = require('../controllers/walletController');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const guestId = 'TEST_GUEST_' + Math.random().toString(36).substr(2, 5);
        
        console.log('Creating first time...');
        const user1 = await getOrCreateUser(guestId);
        console.log('User 1 Email:', user1.email);

        console.log('Creating second time (should not error)...');
        const user2 = await getOrCreateUser(guestId);
        console.log('User 2 Email:', user2.email);

        if (user1._id.toString() === user2._id.toString()) {
            console.log('SUCCESS: Identical user objects returned.');
        } else {
            console.log('FAILURE: Different user objects returned.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('TEST FAILED:', err);
        mongoose.connection.close();
    }
}

test();
