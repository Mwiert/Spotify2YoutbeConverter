<template>
   <div class="playlist-container">
      <h1>Spotify Playlistleriniz</h1>
      <ul v-if="playlists.length" class="playlist-list">
         <li v-for="playlist in playlists" :key="playlist.id" class="playlist-item" @click="openModal(playlist)">
            {{ playlist.name }}
         </li>
      </ul>
      <p v-else>Hiç playlist bulunamadı.</p>

      <!-- Playlist içindeki şarkıları gösteren modal -->
      <div v-if="showModal" class="modal" @click.self="closeModal" @keydown.esc="closeModal">
         <div class="modal-content">
            <span class="close" @click="closeModal">&times;</span>
            <h2>{{ selectedPlaylist.name }} Şarkıları</h2>
            <ul>
               <li v-for="track in tracks" :key="track.id">
                  {{ track.track.name }} - {{ track.track.artists[0].name }}
                  <button @click="selectTrack(track)">Seç</button>
               </li>
            </ul>
         </div>
      </div>

      <!-- Final listesi modalı -->
      <div v-if="showFinalModal" class="modal" @click.self="closeFinalModal">
         <div class="modal-content">
            <span class="close" @click="closeFinalModal">&times;</span>

            <!-- Playlist adı input alanı -->
            <div class="input-group">
               <label for="playlistName">Playlist Adı: </label>
               <input v-model="playlistName" id="playlistName" type="text" placeholder="Playlist adını girin" />
            </div>

            <!-- Public / Private seçimi için toggle -->
            <div class="toggle-group">
               <label for="isPublic">Public mi? </label>
               <input id="isPublic" type="checkbox" v-model="isPublic" />
               <span v-if="isPublic">Public</span>
               <span v-else>Private</span>
            </div>

            <button class="action-button" @click="convertToYouTube">Dönüştür ve YouTube Playlist Yap</button>

            <!-- Playlist linkini gösteriyoruz -->
            <div v-if="playlistLink">
               <h3>Oluşturulan Playlist:</h3>
               <a :href="playlistLink" target="_blank">{{ playlistLink }}</a>
            </div>
            <h2>Son Seçim Listeniz</h2>
            <ul>
               <li id="lastListItems" v-for="(track, index) in selectedTracks" :key="index">
                  {{ track.track.name }} - {{ track.track.artists[0].name }}
               </li>
            </ul>
         </div>
      </div>

      <!-- Seçilen şarkıların modalını açan sağ alt buton -->
      <button v-if="selectedTracks.length" class="bottomNavigationButton" @click="showFinalList">
         Seçilen Şarkılar ({{ selectedTracks.length }})
      </button>
   </div>
</template>

<script>
import { ref } from "vue";
import { useSpotifyStore } from "../stores/spotify";
import axios from "axios";

export default {
   setup() {
      const playlists = ref([]);
      const spotifyStore = useSpotifyStore();
      const showModal = ref(false);
      const selectedPlaylist = ref(null);
      const tracks = ref([]);
      const selectedTracks = ref([]);
      const showFinalModal = ref(false);
      const playlistLink = ref("");

      const playlistName = ref("Spotify’dan Dönüştürülen Playlist");
      const isPublic = ref(true); // Public playlist varsayılan olarak seçili

      // Spotify playlistlerini getir
      const fetchPlaylists = async () => {
         const accessToken = spotifyStore.spotifyAccessToken;
         const response = await fetch("https://api.spotify.com/v1/me/playlists", {
            headers: {
               Authorization: `Bearer ${accessToken}`,
            },
         });
         const data = await response.json();
         playlists.value = data.items;
      };

      const selectTrack = (track) => {
         if (!selectedTracks.value.some((t) => t.track.id === track.track.id)) {
            selectedTracks.value.push(track);
         } else {
            alert("Bu şarkı zaten seçildi.");
         }
      };

      const removeTrack = (track) => {
         selectedTracks.value = selectedTracks.value.filter((t) => t.track.id !== track.track.id);
      };

      const openModal = async (playlist) => {
         selectedPlaylist.value = playlist;
         showModal.value = true;

         const accessToken = spotifyStore.spotifyAccessToken;
         const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
            headers: {
               Authorization: `Bearer ${accessToken}`,
            },
         });
         const data = await response.json();
         tracks.value = data.items;
      };

      const closeModal = () => {
         showModal.value = false;
         selectedPlaylist.value = null;
         tracks.value = [];
      };

      const showFinalList = () => {
         showFinalModal.value = true;
      };

      const closeFinalModal = () => {
         showFinalModal.value = false;
      };

      // YouTube'da playlist oluştur ve şarkıları ekle
      const convertToYouTube = async () => {
         const accessToken = localStorage.getItem("google_access_token"); // YouTube Access Token

         const privacyStatus = isPublic.value ? "public" : "private";

         const playlistResponse = await axios.post(
            "https://www.googleapis.com/youtube/v3/playlists?part=snippet,status",
            {
               snippet: {
                  title: playlistName.value, // Kullanıcının girdiği playlist adı
                  description: "Spotify şarkıları ile oluşturuldu",
               },
               status: {
                  privacyStatus: privacyStatus, // Kullanıcının seçtiği public/private durumu
               },
            },
            {
               headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
               },
            }
         );

         const playlistId = playlistResponse.data.id;
         playlistLink.value = `https://www.youtube.com/playlist?list=${playlistId}`;

         for (const track of selectedTracks.value) {
            const query = `${track.track.name} ${track.track.artists[0].name}`;
            const searchResponse = await axios.get(
               `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1`,
               {
                  headers: {
                     Authorization: `Bearer ${accessToken}`,
                  },
               }
            );

            const videoId = searchResponse.data.items[0].id.videoId;

            await axios.post(
               "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet",
               {
                  snippet: {
                     playlistId: playlistId,
                     resourceId: {
                        kind: "youtube#video",
                        videoId: videoId,
                     },
                  },
               },
               {
                  headers: {
                     Authorization: `Bearer ${accessToken}`,
                     "Content-Type": "application/json",
                  },
               }
            );
         }

         alert("Playlist başarıyla YouTube’da oluşturuldu!");
      };

      fetchPlaylists();

      return {
         playlists,
         showModal,
         selectedPlaylist,
         tracks,
         selectedTracks,
         showFinalModal,
         openModal,
         closeModal,
         selectTrack,
         removeTrack,
         showFinalList,
         closeFinalModal,
         convertToYouTube,
         playlistLink, // Playlist linki
         playlistName, // Playlist adı
         isPublic, // Public veya private durumu
      };
   },
};
</script>

<style lang="scss" scoped>
#lastListItems {
   font-weight: 600;
   font-size: 1.25rem;
   text-align: left;
}
.playlist-container {
   max-width: 600px;
   margin: 0 auto;
   text-align: center;
}

.playlist-list {
   list-style: none;
   padding: 0;
   margin: 20px 0;
   font-weight: 600;
   font-size: 1.5rem;
}

.playlist-item {
   background-color: #f5813d;
   color: white;
   padding: 15px;
   margin-bottom: 10px;
   cursor: pointer;
   border-radius: 5px;
   transition: background-color 0.3s;
   &:hover {
      background-color: #f5813d;
   }
}

.modal {
   display: flex;
   position: fixed;
   z-index: 1000;
   left: 0;
   top: 0;
   width: 100%;
   height: 100%;
   background-color: rgba(0, 0, 0, 0.5);
   justify-content: center;
   align-items: center;
}

.modal-content {
   background-color: white;
   padding: 20px;
   border-radius: 10px;
   max-width: 500px;
   width: 100%;
   position: relative;
   height: 50%;
   overflow-y: auto;
   ul li {
      font-weight: 600;
      font-size: 1rem;
      text-align: left;
      padding: 0.25rem;
      button {
         padding: 0.5rem;
         border-radius: 8px;
         margin-left: 1rem;
         font-weight: 600;
         background: #e6e6e6;
      }
   }
}

.close {
   position: absolute;
   top: 10px;
   right: 10px;
   font-size: 24px;
   cursor: pointer;
   color: #333;
}

.input-group {
   margin-bottom: 15px;

   label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
   }

   input[type="text"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 16px;
      outline: none;
      transition: border-color 0.3s;

      &:focus {
         border-color: #f5813d;
      }
   }
}

.toggle-group {
   margin-bottom: 15px;
   display: flex;
   align-items: center;

   label {
      margin-right: 10px;
      font-weight: bold;
   }

   input[type="checkbox"] {
      position: relative;
      width: 40px;
      height: 20px;
      -webkit-appearance: none;
      background-color: #ccc;
      outline: none;
      border-radius: 20px;
      transition: background-color 0.3s;
      cursor: pointer;

      &:checked {
         background-color: #f5813d;
      }

      &:checked::before {
         left: 22px;
      }

      &::before {
         content: "";
         position: absolute;
         left: 2px;
         top: 2px;
         width: 16px;
         height: 16px;
         background-color: white;
         border-radius: 50%;
         transition: left 0.3s;
      }
   }

   span {
      margin-left: 10px;
   }
}

.action-button {
   display: inline-block;
   background-color: #f5813d;
   color: white;
   padding: 10px 20px;
   border: none;
   border-radius: 5px;
   cursor: pointer;
   font-size: 16px;
   transition: background-color 0.3s;

   &:hover {
      background-color: #f5813d;
   }
}

.bottomNavigationButton {
   position: fixed;
   bottom: 20px;
   right: 20px;
   background-color: #f5813d;
   color: white;
   border: none;
   border-radius: 50%;
   width: min-content;
   height: fit-content;
   padding: 1rem;
   font-size: 18px;
   text-align: center;

   cursor: pointer;
   box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
   transition: background-color 0.3s;
   &:hover {
      background-color: #f5813d;
   }
}
</style>
