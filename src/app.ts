import  express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRouter from './routes/authRoutes.js'
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use('/api/v1/auth', authRouter);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "EcoBazar API is running",
  });
});

export default app;