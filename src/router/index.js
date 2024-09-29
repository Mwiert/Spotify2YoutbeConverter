import { createRouter, createWebHistory } from "vue-router";
import GoogleLogin from "../views/GoogleLogin.vue";
import GoogleCallback from "../views/GoogleCallback.vue";
import SpotifyLogin from "../views/SpotifyLogin.vue";
import SpotifyCallback from "../views/SpotifyCallback.vue";
import SpotifyPlaylist from "../views/SpotifyPlaylist.vue";

const routes = [
   {
      path: "", // Google login callback path
      component: GoogleLogin,
   },
   {
      path: "/auth/callback", // Google OAuth callback path
      component: GoogleCallback,
   },
   {
      path: "/spotify/login", // Spotify login page
      component: SpotifyLogin,
   },
   {
      path: "/spotify/callback", // Spotify OAuth callback path
      component: SpotifyCallback,
   },
   {
      path: "/spotify-playlist", // Spotify playlist page
      component: SpotifyPlaylist,
   },
];

const router = createRouter({
   history: createWebHistory(),
   routes,
});

export default router;
