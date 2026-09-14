import swaggerJSDoc from "swagger-jsdoc";
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "EcoBazar API",
            version: "1.0.0",
            description: `
A production-ready REST API powering the **EcoBazar** grocery e-commerce platform.

This API handles the full backend surface of a modern grocery storefront, including:

- **Authentication** — registration, login, email verification, and password reset flows secured with JWT
- **User Accounts** — profile management for registered customers
- **Products & Categories** — the product catalog, pricing, and category structure customers browse
- **Orders** — order placement and lifecycle management
- **Admin Management** — user and platform administration for store operators

### Authentication

Most endpoints require a JWT bearer token. Obtain one via \`POST /api/v1/auth/login\`, then click the
**Authorize** button above and paste the token as \`Bearer <token>\`.

### Conventions

- All request and response bodies are JSON.
- Timestamps are ISO 8601 UTC.
- Errors follow a consistent \`{ success, message }\` (or similarly structured) shape across endpoints.

### Support

Found an issue with an endpoint or this documentation? Reach out via the contact details below.
      `.trim(),
            contact: {
                name: "EcoBazar API Support",
                email: "support@ecobazar.dev",
            },
            license: {
                name: "UNLICENSED",
            },
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local development server",
            },
            {
                url: "https://ecobazar-backend-cflc.onrender.com/",
                description: "Production server",
            },
        ],
        tags: [
            {
                name: "Authentication",
                description: "Account creation and access control: registration, login, email verification, and password reset.",
            },
            {
                name: "User",
                description: "Authenticated customer profile operations.",
            },
            {
                name: "Admin",
                description: "Store-operator endpoints for managing users and platform-wide data. Requires an admin-privileged token.",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Paste the JWT returned by /api/v1/auth/login, prefixed with 'Bearer '.",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.ts"],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
//# sourceMappingURL=swagger.js.map