<img src="https://raw.githubusercontent.com/Guru-25/SkillRack-Points-Tracker/main/.assets/logo.jpg" width="192" height="192">

# SkillRack Points Tracker

Track and calculate your SkillRack points effortlessly using this powerful tool built with React, Express, Node.js, Axios and Cheerio. This project is designed to scrape user data from SkillRack, calculate points, and display them with a progress bar.

## Features

- Scrapes user data from SkillRack.
- Calculates points based on the user's activities.
- Displays points with a circular progress bar.
- Stores user data in MongoDB.
- Handles cookies for session management.
- Schedule Planning
- Public API ⚡️
<!-- 
## Download

[<img src="https://raw.githubusercontent.com/Guru-25/SkillRack-Points-Tracker/main/client/public/.assets/badge_googleplay.png"
    alt="Get it on Google Play"
    height="80">](https://play.google.com/store/apps/details?id=in.gururaja.skillrack) 
[<img src="https://raw.githubusercontent.com/Guru-25/SkillRack-Points-Tracker/main/.assets/badge_github.png"
    alt="Get it on GitHub"
    height="80">](https://github.com/Guru-25/SkillRack-Points-Tracker/releases) 
[<img src="https://raw.githubusercontent.com/Guru-25/SkillRack-Points-Tracker/main/.assets/badge_izzyondroid.png"
    alt="Get it on IzzyOnDroid"
    height="80">](https://apt.izzysoft.de/fdroid/index/apk/in.gururaja.skillrack) -->

## Tools and Technologies

- **React**: Frontend user interface.
- **Express**: Backend API.
- **Node.js**: Server-side runtime environment.
- **Axios**: HTTP client for making requests.
- **Cheerio**: HTML scraping and parsing.
- **react-circular-progressbar**: Progress bar component for React.
- **js-cookie**: Handling cookies in the browser.
- **dotenv**: Managing environment variables.

## API Documentation

The SkillRack Points Tracker API allows you to track and calculate points based on activities from SkillRack. Below is the documentation for the available endpoints.

### Base URL
```
https://skillrack.gururaja.in/api/points
```

### Endpoints

#### 1. **POST /**

**Description:** Track SkillRack points by processing a provided URL and scraping the relevant data.

- **Endpoint:**
  ```
  POST / 
  ```

- **Request Body:**
  - `url` (string, required): The URL to scrape data from. If the URL is not a direct link to a resume, the API will handle redirections to fetch the correct URL.

  Example:
  ```json
  {
    "url": "http://www.skillrack.com/profile/xxxxxx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
  ```

- **Response:**
  - On Success:
    - **200 OK**
      
     ```json
      {
        "name": "GURU RAJA R",
        "dept": "IT",
        "year": "2026",
        "collegeName": "Thiagarajar College of Engineering (TCE), Madurai",
        "codeTutor": 300,
        "codeTrack": 730,
        "codeTest": 0,
        "dt": 45,
        "dc": 46,
        "medals": 329,
        "points": 2452,
        "requiredPoints": 3000,
        "percentage": 81.73333333333333,
        "lastFetched": "8:47:55 pm",
        "url": "https://www.skillrack.com/faces/resume.xhtml?id=xxxxxx&key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "redirectedUrl": "https://www.skillrack.com/faces/resume.xhtml?id=xxxxxx&key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
     
  - On Failure:
    - **500 Internal Server Error**

      ```json
      {
        "error": "Failed to fetch data"
      }
      ```

#### 2. **GET /refresh**

**Description:** Refresh the data for a given URL by re-scraping and re-calculating the points.

- **Endpoint:**
  ```
  GET /refresh
  ```

- **Query Parameters:**
  - `url` (string, required): The URL to refresh data from.

  Example:
  ```
  https://skillrack.gururaja.in/api/points/refresh?url=https://www.skillrack.com/faces/resume.xhtml?id=xxxxxx&key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```

- **Response:**
  - On Success:
    - **200 OK**

      ```json
      {
        "name": "GURU RAJA R",
        "dept": "IT",
        "year": "2026",
        "collegeName": "Thiagarajar College of Engineering (TCE), Madurai",
        "codeTutor": 300,
        "codeTrack": 730,
        "codeTest": 0,
        "dt": 45,
        "dc": 46,
        "medals": 329,
        "points": 2452,
        "requiredPoints": 3000,
        "percentage": 81.73333333333333,
        "lastFetched": "8:47:55 pm",
        "url": "https://www.skillrack.com/faces/resume.xhtml?id=xxxxxx&key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }

  - On Failure:
    - **500 Internal Server Error**

      ```json
      {
        "error": "Failed to fetch data after retry"
      }
      ```

### Example Use Cases

1. **Tracking Points for a New User**

   Send a POST request to the `/` endpoint with the user's SkillRack profile URL. The API will return the user's points and other details.

   ```bash
   curl -X POST https://skillrack.gururaja.in/api/points/ \
   -H "Content-Type: application/json" \
   -d '{"url": "https://www.skillrack.com/profile/xxxxxx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}'
   ```

2. **Refreshing Points Data**

   To refresh the points for a user, send a GET request to the `/refresh` endpoint with the user's SkillRack profile URL as a query parameter.

   ```bash
   curl -X GET "https://skillrack.gururaja.in/api/points/refresh?url=https://www.skillrack.com/faces/resume.xhtml?id=xxxxxx&key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB (optional)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/SkillRack-Points-Tracker.git
   cd SkillRack-Points-Tracker
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

   ## The following is only required when IS_RECORD_ENABLED is true
   
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

## Support the project

Development is financed by individual user contributions, i.e. you donating or becoming a sponsor ❤️.

* Donate on [UPI](https://gururaja.in/donate)
* [Become a sponsor](https://github.com/sponsors/Guru-25) on GitHub

## Get help

* [Mail](mailto:mail@gururaja.in)
* [Github Discussions](https://github.com/Guru-25/SkillRack-Points-Tracker/discussions)

## License

SkillRack Points Tracker's code is available under a GPL v3 license - see the LICENSE.md file for details.
