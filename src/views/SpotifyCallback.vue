<template>
   <div>
      <h1>Spotify OAuth Callback</h1>
      <p>Yönlendirme sonucu işleniyor...</p>
   </div>
</template>

<script>
import { useSpotifyStore } from "../stores/spotify";
import { useRouter } from "vue-router";

export default {
   setup() {
      const spotifyStore = useSpotifyStore();
      const router = useRouter();

      const authCode = new URLSearchParams(window.location.search).get("code");
      if (authCode) {
         spotifyStore.fetchSpotifyAccessToken(authCode).then(() => {
            router.push("/spotify-playlist");
         });
      }

      return {};
   },
};
</script>
