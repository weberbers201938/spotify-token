const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const port = 3000;

// Spotify Credentials (replace these with your actual Spotify credentials)
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_CLIENT_SECRET = 'YOUR_SPOTIFY_CLIENT_SECRET';
const SPOTIFY_REDIRECT_URI = 'http://localhost:3000/callback';

// Step 1: Redirect to Spotify Authorization URL
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email';
    const authUrl = 'https://accounts.spotify.com/authorize';
    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: SPOTIFY_REDIRECT_URI,
        scope: scope,
    });

    res.redirect(`${authUrl}?${params.toString()}`);
});

// Step 2: Callback Route to Handle Authorization Response and Token Download
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code not found' });
    }

    try {
        const tokenUrl = 'https://accounts.spotify.com/api/token';
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            client_id: SPOTIFY_CLIENT_ID,
            client_secret: SPOTIFY_CLIENT_SECRET,
        });

        // Step 3: Request Token with Authorization Code
        const response = await axios.post(tokenUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, refresh_token, expires_in } = response.data;

        // Prepare token data for JSON download
        const tokenData = {
            access_token,
            refresh_token,
            expires_in,
        };

        // Step 4: Send the JSON File as a Downloadable Response
        res.setHeader('Content-Disposition', 'attachment; filename="spotify_token.json"');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(tokenData, null, 2));
    } catch (error) {
        console.error('Error retrieving Spotify token:', error);
        res.status(500).json({ error: 'Failed to retrieve access token' });
    }
});

// Server Start
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
