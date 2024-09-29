<template>
   <div>
      <h1>Spotify OAuth ile Giriş Yap</h1>
      <button @click="spotifyLogin">Spotify ile Giriş Yap</button>
   </div>
</template>

<script>
import { useSpotifyStore } from "../stores/spotify";

export default {
   setup() {
      const spotifyStore = useSpotifyStore();

      const spotifyLogin = () => {
         spotifyStore.spotifyLogin();
      };

      return { spotifyLogin };
   },
};
</script>
