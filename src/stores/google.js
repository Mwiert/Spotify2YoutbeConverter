import { defineStore } from "pinia";
import axios from "axios";
import qs from "qs";

export const useGoogleStore = defineStore("google", {
   state: () => ({
      googleAccessToken: null,
      googleRefreshToken: localStorage.getItem("google_refresh_token"),
      isGoogleAuthenticated: false,
   }),
   actions: {
      googleLogin() {
         const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
         const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;
         const scope = process.env.VITE_GOOGLE_SCOPE;
         const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;

         window.location.href = authUrl; // Google OAuth sayfasına yönlendiriyoruz
      },

      async fetchGoogleAccessToken(authCode) {
         const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
         const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET;
         const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;
         const tokenUrl = process.env.VITE_GOOGLE_TOKEN_URL;

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
            this.googleAccessToken = access_token;
            localStorage.setItem("google_refresh_token", refresh_token);
            localStorage.setItem("google_access_token", access_token);

            // Access token'ı console'a yazdırıyoruz
            console.log("Google Access Token:", access_token);
         } catch (error) {
            console.error("Google Access Token alınırken hata oluştu:", error);
         }
      },
   },
});
