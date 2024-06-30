# SkillRack Points Calculator

A simple SkillRack points calculator using React, Express, Node.js, Axios, Cheerio, MongoDB, Mongoose, and deployed on Vercel. This project scrapes user data from SkillRack, calculates points, and displays them with a progress bar. It also uses React Helmet for dynamic titles and js-cookie for managing cookies.

## Tools and Technologies

- **React**: Frontend user interface.
- **Express**: Backend API.
- **Node.js**: Server-side runtime environment.
- **Axios**: HTTP client for making requests.
- **Cheerio**: HTML scraping and parsing.
- **MongoDB**: Database for storing user data.
- **Mongoose**: ODM library for MongoDB.
- **Vercel**: Deployment platform.
- **React Helmet**: Document head management for React.
- **react-circular-progressbar**: Progress bar component for React.
- **js-cookie**: Handling cookies in the browser.
- **dotenv**: Managing environment variables.

## Features

- Scrapes user data from SkillRack.
- Calculates points based on the user's activities.
- Displays points with a circular progress bar.
- Stores user data in MongoDB.
- Handles cookies for session management.
- Dynamic page titles using React Helmet.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/skillrack-points-calculator.git
   cd skillrack-points-calculator
   ```

2. Install dependencies for the client and server:
   ```sh
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Set up your environment variables in a `.env` file in the server directory: