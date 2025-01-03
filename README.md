# ISPH Stock Exchange Client API

This project is a backend API for a simulated stock exchange application, designed for the International School of ParkCity Hanoi (ISPH). It uses Node.js, Express.js, and Firebase for real-time data management and user authentication.

## Features

-   **User Authentication:** Secure user authentication using Firebase Authentication.
-   **Role-Based Access Control:** Differentiated access for students, teachers, and administrators.
-   **Stock Management:**
    -   Fetch all available stocks.
    -   Fetch stock price history.
    -   Buy and sell stocks (with real-time portfolio updates).
-   **Admin Controls:**
    -   Approve events that impact stock prices.
    -   Set opening stock prices.
    -   Adjust stock volumes.
-   **Teacher Features:**
    -   Create events that can influence stock prices.
-   **User Portfolio:**
    -   View current portfolio holdings.
    -   View portfolio history.
    -   Check if user exists in the system
    -   Create new user in the system
-   **Transactions:**
    -   View transaction history.
-   **Real-time Data:** Leverages Firebase Realtime Database for real-time updates to stock prices and user portfolios.
-   **API Documentation:** Comprehensive API documentation using Swagger UI.

## Database Schema

The database schema is defined using DBML (Database Markup Language) and can be found in the `database.dbml` file. It outlines the structure for:

-   Users
-   Stocks
-   Stock Price History
-   Portfolios
-   Transactions
-   Earnings
-   Events
-   Engine Weights

## Getting Started

### Prerequisites

-   Node.js (v14 or higher recommended)
-   npm (or Yarn)
-   Firebase project (with Realtime Database and Authentication enabled)
-   Firebase service account key (JSON file)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/quangngonz/quangngonz-ISPH-Stock-Exchange-Express-ClientAPI.git
    cd quangngonz-ISPH-Stock-Exchange-Express-ClientAPI.git
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    - Create a `.env` file in the root directory.
    - Add your Firebase configuration details to the `.env` file. You can use the `utils/json_to_env.py` script to automatically convert your Firebase service account JSON file into environment variables.
        - Run the script: `python3 ./utils/json_to_env.py`. The script will prompt you for the path to your JSON file and the optional `.env` file path.

    ```
    FIREBASE_API_KEY=<your_api_key>
    FIREBASE_AUTH_DOMAIN=<your_auth_domain>
    FIREBASE_DATABASE_URL=<your_database_url>
    FIREBASE_PROJECT_ID=<your_project_id>
    FIREBASE_STORAGE_BUCKET=<your_storage_bucket>
    FIREBASE_MESSAGING_SENDER_ID=<your_messaging_sender_id>
    FIREBASE_APP_ID=<your_app_id>
    FIREBASE_MEASUREMENT_ID=<your_measurement_id>
    FIREBASE_TYPE=<your_type>
    FIREBASE_PRIVATE_KEY_ID=<your_private_key_id>
    FIREBASE_PRIVATE_KEY=<your_private_key>
    FIREBASE_CLIENT_EMAIL=<your_client_email>
    FIREBASE_CLIENT_ID=<your_client_id>
    FIREBASE_AUTH_URI=<your_auth_uri>
    FIREBASE_TOKEN_URI=<your_token_uri>
    FIREBASE_AUTH_PROVIDER_CERT_URL=<your_auth_provider_cert_url>
    FIREBASE_CLIENT_CERT_URL=<your_client_cert_url>
    ```

4. **(Optional) Generate fake data:**

    - You can use the provided utility scripts in the `utils` folder to generate fake data for testing:
    - `generateStock.py`: Generates random stock data and price history.
    - `pushFakeData.py`: Generates fake users, portfolios, and transactions.
    - **Note:** These scripts require a Firebase service account key file named `serviceAccountKey.json` to be placed in the `utils` folder. Make sure you have the correct database URL in these scripts.

    ```bash
    # Example usage
    python3 ./utils/generateStock.py
    python3 ./utils/pushFakeData.py
    ```

### Running the Application

-   **Development mode:**

    ```bash
    npm run dev
    ```

    This will start the server using `nodemon`, which automatically restarts the server on file changes.

-   **Production mode:**

    ```bash
    npm start
    ```

-   The server will run on port 3000 by default. You can change the port by setting the `PORT` environment variable.

## API Documentation

The API documentation is available via Swagger UI at `/api-docs`. You can access it in your browser after starting the server.

## Deployment

This project is configured for deployment on Vercel. You can deploy it by connecting your Vercel account to your GitHub repository and configuring the necessary environment variables in the Vercel dashboard.

## Testing

The `test/event.py` script provides basic test cases for the `/teacher/add-event` endpoint. You can modify and expand these tests as needed.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to improve the project.

## License

This project is licensed under the MIT License.
