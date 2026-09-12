import mongoose from "mongoose";
async function connectDb() {
    return await mongoose.connect(process.env.MONGO_DB_URI).then(() => {
        console.log("Database connected");
    }).catch((error) => {
        console.log('Database connection failed:', error);
    });
}
export default connectDb;
//# sourceMappingURL=mongoDBConfig.js.map