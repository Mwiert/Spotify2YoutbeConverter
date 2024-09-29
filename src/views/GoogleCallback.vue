<template>
   <div>
      <h1>Google OAuth Callback</h1>
      <p>Yönlendirme sonucu işleniyor...</p>
   </div>
</template>

<script>
import { useGoogleStore } from "../stores/google";
import { useRouter } from "vue-router";

export default {
   setup() {
      const googleStore = useGoogleStore();
      const router = useRouter();

      const authCode = new URLSearchParams(window.location.search).get("code");
      if (authCode) {
         googleStore.fetchGoogleAccessToken(authCode).then(() => {
            setTimeout(() => {
               router.push("/spotify/login");
            }, 1000);
         });
      }

      return {};
   },
};
</script>
