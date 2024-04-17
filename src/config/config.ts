export default () => ({
  database: { connectionString: process.env.MONGODB_CONNECTION_LINK },
  secrets: {
    jwtSecret: process.env.JWT_TOKEN_RANDOM_STRING,
    adminJwtSecret: process.env.ADMIN_JWT_TOKEN_RANDOM_STRING,
  },
  mail: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
});
