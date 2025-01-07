# Node.js Backend Application

This is a Node.js backend application that connects to MongoDB, uses JWT for authentication, CORS for cross-origin requests, and Redis for caching. Additionally, it supports email functionality.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- A valid email address and password (or an App password) for email functionality.

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/10satyamojha/backendassignment.git
   cd backendassignment
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root of your project and add the following:
   ```env
   MONGO_URI=mongodburl
   JWT_SECRET=Secret
   CORS_ORIGIN=http://localhost:3000
   PORT=3000
   EMAIL_USER=-email@gmail.com
   EMAIL_PASS= Password
   REDIS_URL=redis://localhost:6379
   ```

---

## Running the Application

### Development Mode
To run the application with hot-reloading using `nodemon`:
```bash
npx nodemon app.js
```

### Production Mode
To run the application directly with Node.js:
```bash
node app.js
```

---

## API Endpoints

Here are some sample endpoints (update this section based on your application routes):

- **User Registration:** `POST /api/register`
- **User Login:** `POST /api/login`
- **Get Data:** `GET /api/data`

---

## Key Features

- **MongoDB Integration:** Stores user data.
- **JWT Authentication:** Secures API endpoints.
- **CORS Support:** Enables secure cross-origin requests.
- **Redis Caching:** Enhances application performance.
- **Email Integration:** Sends notifications or password recovery emails.

---

## Troubleshooting

- **MongoDB Connection Issues:** Ensure your MongoDB URI is correct and the database is running.
- **Redis Errors:** Check if Redis is installed and running on `localhost:6379`.
- **Email Errors:** Double-check your email and password (use App passwords if 2FA is enabled).

---

## License

This project is licensed under the [MIT License](LICENSE).
