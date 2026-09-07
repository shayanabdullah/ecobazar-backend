import { connect } from "node:http2";
import app from "./app.js";
import dotenv from 'dotenv'
import connectDb from "./config/mongoDBConfig.js";
dotenv.config();

connectDb();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
