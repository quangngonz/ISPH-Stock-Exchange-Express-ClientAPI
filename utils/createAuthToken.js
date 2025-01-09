const { OAuth2Client } = require("google-auth-library");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/callback";  // Local redirect URI

console.log("CLIENT_ID:", CLIENT_ID);
console.log("CLIENT_SECRET:", CLIENT_SECRET);
console.log("REDIRECT_URI:", REDIRECT_URI);

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

async function getGoogleBearerToken() {
  // Generate the Google Auth URL with response_type set to 'code'
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["email", "profile"],
    response_type: "code",  // Add response_type parameter
  });

  console.log("Authorize this app by visiting this URL:", authUrl);

  // Set up Express server to handle the redirect
  const app = express();

  app.get("/callback", async (req, res) => {
    const { code } = req.query;
    try {
      // Exchange the authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      if (tokens.id_token) {
        console.log("Login successful!");
        console.log("Bearer Token (ID Token):", tokens.id_token);
        res.send("Login successful! You can close this window.");
      } else {
        res.send("Failed to retrieve ID token.");
      }
    } catch (err) {
      res.send("Error during token exchange: " + err.message);
    }
  });

  // Start the server to listen for the redirect
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}

getGoogleBearerToken();
