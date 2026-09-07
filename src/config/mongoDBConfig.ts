import mongoose from "mongoose";

async function connectDb() {
    return await mongoose.connect(process.env.MONGO_DB_URI as string).then(() => {
        console.log("Database connected");
    }).catch((error: Error) => {
        console.log('Database connection failed:', error);
    })
}

export default connectDb;