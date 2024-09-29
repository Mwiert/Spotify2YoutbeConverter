import { defineStore } from "pinia";
import axios from "axios";
import qs from "qs";

export const useSpotifyStore = defineStore("spotify", {
   state: () => ({
      spotifyAccessToken: null,
      spotifyRefreshToken: localStorage.getItem("spotify_refresh_token"),
      isSpotifyAuthenticated: false,
   }),
   actions: {
      spotifyLogin() {
         const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
         const redirectUri = process.env.VITE_SPOTIFY_REDIRECT_URI;
         const scope = process.env.VITE_SPOTIFY_SCOPE;
         const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;

         window.location.href = authUrl; // Spotify OAuth sayfasına yönlendiriyoruz
      },

      async fetchSpotifyAccessToken(authCode) {
         const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
         const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET;
         const redirectUri = process.env.VITE_SPOTIFY_REDIRECT_URI;
         const tokenUrl = process.env.VITE_SPOTIFY_TOKEN_URL;

         const data = {
            client_id: clientId,
            client_secret: clientSecret,
            code: authCode,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
         };

         try {
            const response = await axios.post(tokenUrl, qs.stringify(data), {
               headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
               },
            });

            const { access_token, refresh_token } = response.data;
            this.spotifyAccessToken = access_token;
            localStorage.setItem("spotify_refresh_token", refresh_token);
            localStorage.setItem("spotify_access_token", access_token);

            // Access token'ı console'a yazdırıyoruz
            console.log("Spotify Access Token:", access_token);
         } catch (error) {
            console.error("Spotify Access Token alınırken hata oluştu:", error);
         }
      },
   },
});
