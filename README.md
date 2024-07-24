# SkillRack Points Tracker and Calculator

Track and calculate your SkillRack points effortlessly using this powerful tool built with React, Express, Node.js, Axios and Cheerio. This project is designed to scrape user data from SkillRack, calculate points, and display them with a progress bar.

## Tools and Technologies

- **React**: Frontend user interface.
- **Express**: Backend API.
- **Node.js**: Server-side runtime environment.
- **Axios**: HTTP client for making requests.
- **Cheerio**: HTML scraping and parsing.
- **react-circular-progressbar**: Progress bar component for React.
- **js-cookie**: Handling cookies in the browser.
- **dotenv**: Managing environment variables.

## Features

- Scrapes user data from SkillRack.
- Calculates points based on the user's activities.
- Displays points with a circular progress bar.
- Stores user data in MongoDB.
- Handles cookies for session management.
- Schedule Planning

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB (optional)

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
   IS_RECORD_ENABLED=true_or_false

   ## Only required when IS_RECORD_ENABLED is true
   # MongoDB connection string
   MONGODB_URI=your_mongodb_uri

   # LOG
   BOT_TOKEN=bot_token
   CHAT_ID=chat_id
   TOPIC1_ID=topic1_id
   TOPIC2_ID=topic2_id
   TOPIC3_ID=topic3_id
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

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for review.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.