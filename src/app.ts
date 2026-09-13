import  express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import { adminMiddleware, userMiddleware } from "./middleware/roleMiddleware.js";
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use('/api/v1/auth', authRouter);

app.use('/api/v1/user', userMiddleware, userRouter);

app.use('/api/v1/admin', adminMiddleware, adminRouter);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "EcoBazar API is running",
  });
});

export default app;