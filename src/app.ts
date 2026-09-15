import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import {
  adminMiddleware,
  userMiddleware,
} from "./middleware/roleMiddleware.js";

import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use("/swagger-assets", express.static(path.join(process.cwd(), "swagger")));

// Custom Swagger Design ----

// here is the link of the api doc : https://ecobazar-backend-cflc.onrender.com/api-docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "EcoBazar API Documentation",
    customJs: "/swagger-assets/swagger-theme.js",
    customCss: `
  /* =========================================================
     ECOBAZAR SWAGGER UI
     LIGHT = DEFAULT
     DARK = html[data-theme="dark"]
  ========================================================= */

  :root {
    --eco-primary: #00B207;
    --eco-primary-dark: #2C742F;
    --eco-soft: #84D187;

    --eco-bg: #f7f8f7;
    --eco-surface: #ffffff;
    --eco-surface-2: #f1f4f1;

    --eco-border: #dfe5df;

    --eco-text: #1f2933;
    --eco-muted: #667085;

    --eco-code: #f4f6f4;
  }


  /* =========================================================
     GLOBAL — LIGHT
  ========================================================= */

  html[data-theme="light"],
  html[data-theme="light"] body {
    background: #f7f8f7 !important;
    color: #1f2933 !important;
  }

  html[data-theme="light"] .swagger-ui {
    background: #f7f8f7 !important;
    color: #1f2933 !important;
  }

  html[data-theme="light"] .swagger-ui .information-container,
  html[data-theme="light"] .swagger-ui .scheme-container,
  html[data-theme="light"] .swagger-ui .opblock-body,
  html[data-theme="light"] .swagger-ui section.models,
  html[data-theme="light"] .swagger-ui .model-container {
    color: #1f2933 !important;
  }


  /* =========================================================
     GLOBAL — DARK
  ========================================================= */

  html[data-theme="dark"],
  html[data-theme="dark"] body {
    background: #171b1a !important;
    color: #f1f5f2 !important;
  }

  html[data-theme="dark"] .swagger-ui {
    background: #171b1a !important;
    color: #f1f5f2 !important;
  }


  /* =========================================================
     TOPBAR
  ========================================================= */

 
.swagger-ui .topbar {
  background: #ffffff !important;
  border-bottom: 1px solid #dfe5df !important;
  padding: 0 !important;
  box-shadow: none !important;
}

html[data-theme="dark"] .swagger-ui .topbar {
  background: #202523 !important;
  border-bottom: 1px solid #303735 !important;
}

  .swagger-ui .topbar .link {
    display: none !important;
  }

  .swagger-ui .topbar .link svg {
    display: none !important;
  }

  .swagger-ui .topbar .wrapper {
    max-width: 980px !important;
    min-height: 64px !important;
    margin: auto !important;

    display: flex !important;
    align-items: center !important;
  }

  #eco-topbar-inner {
    width: 100% !important;
    max-width: 980px !important;

    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;

    margin: auto !important;
    padding: 0 16px !important;
    box-sizing: border-box !important;
  }

  .eco-brand {
    display: flex !important;
    flex-direction: column !important;
    gap: 2px !important;
  }

 .eco-brand-title {
  color: #2C742F !important;
  font-size: 17px !important;
  font-weight: 800 !important;
}

.eco-brand-subtitle {
  color: #667085 !important;
  font-size: 9px !important;
}

html[data-theme="dark"] .eco-brand-title {
  color: #ffffff !important;
}

html[data-theme="dark"] .eco-brand-subtitle {
  color: #aeb8b2 !important;
}

  #eco-theme-toggle {
    background: #303634 !important;
    border: 1px solid #66706a !important;
    color: #ffffff !important;

    border-radius: 999px !important;

    padding: 5px 11px !important;

    font-size: 11px !important;
    font-weight: 600 !important;

    cursor: pointer !important;
  }

  #eco-theme-toggle:hover {
    background: #3b433f !important;
    border-color: #84D187 !important;
  }


  /* =========================================================
     INFORMATION CARD
  ========================================================= */

  .swagger-ui .information-container  {
    background: #ffffff !important;

    border: 1px solid #dfe5df !important;
    border-radius: 12px !important;

    margin: 22px auto !important;
    padding: 28px !important;

    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04) !important;
  }

  html[data-theme="dark"] .swagger-ui .information-container {
    background: #1d2221 !important;
    border-color: #303735 !important;

    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25) !important;
  }

 .swagger-ui .info {
    margin: 27px 0 !important;
}
  .swagger-ui .info .title{
    color: #00B207 !important;

    font-size: 28px !important;
    font-weight: 800 !important;
  }

  .swagger-ui .info h3{
    color: #00B207 !important;
    font-size: 20px !important;
    font-weight: 600 !important;
  }

  html[data-theme="dark"] .swagger-ui .info .title {
    color: #84D187 !important;
  }

  .swagger-ui .info p, li {
    color: #667085 !important;
  }
  .swagger-ui .info .info__license span {
    font-size: 14px !important;
    font-weight: 500 !important;
    color: #667085 !important;
  }

  html[data-theme="dark"] .swagger-ui .info p, li{
    color: #aeb8b2 !important;
  }


  /* =========================================================
     VERSION BADGES
  ========================================================= */

  .swagger-ui .info .title small {
    background: #00B207 !important;
    color: #ffffff !important;

    border-radius: 5px !important;
  }


  /* =========================================================
     SERVERS
  ========================================================= */

  .swagger-ui .scheme-container {
    background: #ffffff !important;

    border-top: 1px solid #dfe5df !important;
    border-bottom: 1px solid #dfe5df !important;

    padding: 20px 0 !important;

    box-shadow: none !important;
  }

  html[data-theme="dark"] .swagger-ui .scheme-container {
    background: #171b1a !important;
    border-color: #303735 !important;
  }
.swagger-ui .scheme-container .servers-title {
  color: #1f2933 !important;
}

html[data-theme="dark"] .swagger-ui .scheme-container .servers-title {
  color: #f1f5f2 !important;
}


  /* =========================================================
     SELECT
  ========================================================= */
.swagger-ui .scheme-container select {
  color: #1f2933 !important;
  background: #ffffff !important;
}

html[data-theme="dark"] .swagger-ui .scheme-container select {
  color: #f1f5f2 !important;
  background: #242a28 !important;
}

  /* =========================================================
     AUTHORIZE
  ========================================================= */

  .swagger-ui .btn.authorize {
    background: #00B207 !important;
    border-color: #00B207 !important;

    color: #ffffff !important;

    border-radius: 7px !important;
    font-weight: 700 !important;
  }

  .swagger-ui .btn.authorize:hover {
    background: #2C742F !important;
    border-color: #2C742F !important;
  }

  .swagger-ui .btn.authorize svg {
    fill: #ffffff !important;
  }


  /* =========================================================
     TAG HEADINGS
  ========================================================= */

  .swagger-ui .opblock-tag {
  color: #2C742F !important;

  border-bottom: 1px solid #dfe5df !important;

  font-size: 18px !important;
  font-weight: 800 !important;

  padding: 18px 6px !important;
}

html[data-theme="dark"] .swagger-ui .opblock-tag {
  color: #84D187 !important;
  border-color: #303735 !important;
}

  .swagger-ui .opblock-tag small p {
  color: #667085 !important;
  opacity: 1 !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

html[data-theme="dark"] .swagger-ui .opblock-tag small p {
  color: #aeb8b2 !important;
  opacity: 1 !important;
}
  /* =========================================================
     ENDPOINTS — BASE
  ========================================================= */

  .swagger-ui .opblock {
    border-radius: 9px !important;

    margin: 10px 0 !important;

    box-shadow: none !important;

    overflow: hidden !important;
  }

  .swagger-ui .opblock-summary {
    padding: 11px 12px !important;
  }

  .swagger-ui .opblock-summary-path {
    color: #1f2933 !important;
    font-weight: 700 !important;
  }

  .swagger-ui .opblock-summary-description {
    color: #667085 !important;
  }

  html[data-theme="dark"] .swagger-ui .opblock-summary-path {
    color: #ffffff !important;
  }

  html[data-theme="dark"] .swagger-ui .opblock-summary-description {
    color: #aeb8b2 !important;
  }


  /* =========================================================
     LIGHT ENDPOINT COLORS
  ========================================================= */

  .swagger-ui .opblock.opblock-get {
    background: #edf5ff !important;
    border-color: #c7ddf7 !important;
  }

  .swagger-ui .opblock.opblock-post {
    background: #edf9f0 !important;
    border-color: #bde3c3 !important;
  }

  .swagger-ui .opblock.opblock-patch {
    background: #eefafa !important;
    border-color: #b9e1e4 !important;
  }

  .swagger-ui .opblock.opblock-delete {
    background: #fff0f0 !important;
    border-color: #f0c4c4 !important;
  }


  /* =========================================================
     DARK ENDPOINT COLORS
  ========================================================= */

  html[data-theme="dark"] .swagger-ui .opblock.opblock-get {
    background: #182534 !important;
    border-color: #285173 !important;
  }

  html[data-theme="dark"] .swagger-ui .opblock.opblock-post {
    background: #0d2b27 !important;
    border-color: #116a5c !important;
  }

  html[data-theme="dark"] .swagger-ui .opblock.opblock-patch {
    background: #112c30 !important;
    border-color: #1d6268 !important;
  }

  html[data-theme="dark"] .swagger-ui .opblock.opblock-delete {
    background: #302022 !important;
    border-color: #71353a !important;
  }


  /* =========================================================
     METHOD BADGES
  ========================================================= */

  .swagger-ui .opblock-summary-method {
    border-radius: 5px !important;

    font-size: 11px !important;
    font-weight: 800 !important;
  }

  .swagger-ui .opblock.opblock-get
  .opblock-summary-method {
    background: #4f9df8 !important;
  }

  .swagger-ui .opblock.opblock-post
  .opblock-summary-method {
    background: #00B207 !important;
  }

  .swagger-ui .opblock.opblock-patch
  .opblock-summary-method {
    background: #2fb9c3 !important;
  }

  .swagger-ui .opblock.opblock-delete
  .opblock-summary-method {
    background: #dc5555 !important;
  }


  /* =========================================================
     EXPANDED ENDPOINT BODY
  ========================================================= */

  .swagger-ui .opblock-body {
    background: #ffffff !important;
    color: #1f2933 !important;

    padding: 20px !important;
  }

  html[data-theme="dark"] .swagger-ui .opblock-body {
    background: #1c2120 !important;
    color: #f1f5f2 !important;
  }


  /* =========================================================
     TEXT INSIDE ENDPOINTS
  ========================================================= */

  .swagger-ui .opblock-body label {
    color: #1f2933 !important;
  }

  html[data-theme="dark"] .swagger-ui .opblock-body label {
    color: #f1f5f2 !important;
  }

  .swagger-ui .parameter__name {
    color: #1f2933 !important;
  }

  html[data-theme="dark"] .swagger-ui .parameter__name {
    color: #ffffff !important;
  }


  /* =========================================================
     INPUTS
  ========================================================= */

  .swagger-ui input[type="text"],
  .swagger-ui input[type="password"],
  .swagger-ui input[type="email"],
  .swagger-ui textarea {
    background: #ffffff !important;

    color: #1f2933 !important;

    border: 1px solid #cbd3cd !important;

    border-radius: 7px !important;

    padding: 9px 11px !important;
  }

  html[data-theme="dark"] .swagger-ui input[type="text"],
  html[data-theme="dark"] .swagger-ui input[type="password"],
  html[data-theme="dark"] .swagger-ui input[type="email"],
  html[data-theme="dark"] .swagger-ui textarea {
    background: #242a28 !important;

    color: #f1f5f2 !important;

    border-color: #46504b !important;
  }


  /* =========================================================
     EXECUTE BUTTON
  ========================================================= */

  .swagger-ui .btn.execute {
    background: #00B207 !important;
    border-color: #00B207 !important;

    color: #ffffff !important;
  }

  .swagger-ui .btn.execute:hover {
    background: #2C742F !important;
  }


  /* =========================================================
     RESPONSES
  ========================================================= */

  .swagger-ui .responses-inner {
    padding: 10px 0 !important;
  }

  .swagger-ui .response-col_status {
    color: #2C742F !important;
    font-weight: 800 !important;
  }

  html[data-theme="dark"] .swagger-ui .response-col_status {
    color: #84D187 !important;
  }


  /* =========================================================
     TABLES
  ========================================================= */

  .swagger-ui table thead tr th {
    color: #1f2933 !important;
    border-bottom: 1px solid #dfe5df !important;
  }

  .swagger-ui table tbody tr td {
    color: #1f2933 !important;
    border-bottom: 1px solid #dfe5df !important;
  }

  html[data-theme="dark"] .swagger-ui table thead tr th {
    color: #f1f5f2 !important;
    border-color: #303735 !important;
  }

  html[data-theme="dark"] .swagger-ui table tbody tr td {
    color: #d9e0dc !important;
    border-color: #303735 !important;
  }


  /* =========================================================
     CODE BLOCK
  ========================================================= */

  .swagger-ui .highlight-code {
    background: #f4f6f4 !important;
    border-radius: 8px !important;
  }

  html[data-theme="dark"] .swagger-ui .highlight-code {
    background: #111514 !important;
  }

  html[data-theme="dark"] .swagger-ui .microlight {
    background: #111514 !important;
    color: #e5ebe7 !important;
  }


  /* =========================================================
     MODELS
  ========================================================= */

  .swagger-ui section.models {
    background: #ffffff !important;

    border: 1px solid #dfe5df !important;
    border-radius: 10px !important;

    padding: 18px !important;

    margin-top: 30px !important;
  }

  html[data-theme="dark"] .swagger-ui section.models {
    background: #1c2120 !important;
    border-color: #303735 !important;
  }

  .swagger-ui section.models h4 {
    color: #1f2933 !important;
  }

  html[data-theme="dark"] .swagger-ui section.models h4 {
    color: #f1f5f2 !important;
  }


  /* =========================================================
     LINKS
  ========================================================= */

  .swagger-ui a {
    color: #00B207 !important;
  }

  .swagger-ui a:hover {
    color: #2C742F !important;
  }


  /* =========================================================
     DARK MODAL
  ========================================================= */

  html[data-theme="dark"] .swagger-ui .dialog-ux .modal-ux {
    background: #1c2120 !important;
    color: #f1f5f2 !important;
    border-color: #3a4440 !important;
  }

  html[data-theme="dark"] .swagger-ui .dialog-ux .modal-ux-header {
    border-color: #3a4440 !important;
  }


  /* =========================================================
     MOBILE
  ========================================================= */

  @media (max-width: 768px) {

    .swagger-ui .wrapper {
      width: 94% !important;
      max-width: none !important;
    }

    #eco-topbar-inner {
      padding: 0 12px !important;
    }

    .eco-brand-title {
      font-size: 15px !important;
    }

    .swagger-ui .information-container {
      padding: 20px !important;
    }

    .swagger-ui .info .title {
      font-size: 23px !important;
    }
  }
`,

    customfavIcon: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  }),
);
// Custom Swagger Design -----

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/user", userMiddleware, userRouter);

app.use("/api/v1/admin", adminMiddleware, adminRouter);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "EcoBazar API is running",
  });
});

export default app;
