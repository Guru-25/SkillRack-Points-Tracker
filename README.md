# SkillRack Points Tracker

A Simple SkillRack points tracker using React, Express, Node.js, Axios, Cheerio, MongoDB, Mongoose, and deployed on Vercel. This project scrapes user data from SkillRack, calculates points, and displays them with a progress bar. It also uses js-cookie for managing cookies.

## Tools and Technologies

- **React**: Frontend user interface.
- **Express**: Backend API.
- **Node.js**: Server-side runtime environment.
- **Axios**: HTTP client for making requests.
- **Cheerio**: HTML scraping and parsing.
- **MongoDB**: Database for storing user data.
- **Mongoose**: ODM library for MongoDB.
- **Vercel**: Deployment platform.
- **react-circular-progressbar**: Progress bar component for React.
- **js-cookie**: Handling cookies in the browser.
- **dotenv**: Managing environment variables.
- **nodemailer**: Sending email notifications.

## Features

- Scrapes user data from SkillRack.
- Calculates points based on the user's activities.
- Displays points with a circular progress bar.
- Stores user data in MongoDB.
- Handles cookies for session management.
- Sends email notifications to admin for new user insertions.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/skillrack-points-tracker.git
   cd skillrack-points-tracker
   ```

2. Install dependencies for the client and server:
   ```sh
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Set up your environment variables in a `.env` file in the server directory:

   ```env
   # MongoDB connection string
   MONGODB_URI=your_mongodb_uri

   # SMTP Email configuration
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_SECURE=true_or_false
   FROM_ADDRESS=your_email_address
   TO_ADDRESS=recipient_email_address
   SMTP_USER=smtp_username
   SMTP_PASS=smtp_password

   # LOG
   LOG_BOT_TOKEN=bot_token
   LOG_CHAT_ID=chat_id
   ```

### Running the Application

1. Start the client:
   ```sh
   cd client
   npm start
   ```

2. Start the server:
   ```sh
   cd server
   node index.js
   ```

3. The application should now be running on `http://localhost:3000`.

### Deployment

Deploy the application to Vercel:

1. Install Vercel CLI:
   ```sh
   npm install -g vercel
   ```

2. Run Vercel deployment:
   ```sh
   vercel
   ```

3. Follow the prompts to complete the deployment.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for review.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.