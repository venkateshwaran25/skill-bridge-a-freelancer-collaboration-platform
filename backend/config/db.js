const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("❌ MongoDB URI is not defined. Using local fallback mongodb://127.0.0.1:27017/skillbridge");
        uri = "mongodb://127.0.0.1:27017/skillbridge";
    }

    // Try standard system connection with IPv4 forced
    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            family: 4,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (firstErr) {
        console.warn(`⚠️ Primary MongoDB connection failed (${firstErr.message}). Retrying with DNS fallback...`);
    }

    // Fallback attempt with Google DNS
    try {
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            family: 4,
        });
        console.log(`✅ MongoDB Connected (Fallback DNS): ${conn.connection.host}`);
        return conn;
    } catch (secondErr) {
        console.warn(`⚠️ Atlas connection failed (${secondErr.message}). Trying local MongoDB fallback...`);
        try {
            const localUri = "mongodb://127.0.0.1:27017/skillbridge";
            const conn = await mongoose.connect(localUri, {
                serverSelectionTimeoutMS: 3000,
                connectTimeoutMS: 3000,
            });
            console.log(`✅ MongoDB Connected (Local Fallback): ${conn.connection.host}`);
            return conn;
        } catch (thirdErr) {
            console.error("❌ All MongoDB Connection attempts failed (Atlas & Local):", thirdErr.message);
        }
    }
};

module.exports = connectDB;