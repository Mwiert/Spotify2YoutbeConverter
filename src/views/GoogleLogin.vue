<template>
   <div>
      <h1>Google OAuth ile Giriş Yap</h1>
      <button @click="googleLogin">Google ile Giriş Yap</button>
   </div>
</template>

<script>
import { useGoogleStore } from "../stores/google";

export default {
   setup() {
      const googleStore = useGoogleStore(); // Google Store'u kullanıyoruz

      const googleLogin = () => {
         googleStore.googleLogin(); // Google login aksiyonunu çağırıyoruz
      };

      return { googleLogin };
   },
};
</script>
