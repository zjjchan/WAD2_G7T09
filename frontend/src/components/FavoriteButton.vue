<template>
    <svg @click="toggleFavorite" :class="{ favorited: isFavorited }" xmlns="http://www.w3.org/2000/svg" width="70"
        height="70" :fill="isFavorited ? 'red' : 'white'" stroke="black" viewBox="0 0 24 24">
        <path d="M6 2a2 2 0 0 0-2 2v18l8-4.5 8 4.5V4a2 2 0 0 0-2-2H6z" />
    </svg>
    <Notification v-if="showNotification" :message="notificationMessage" :show="showNotification"
        @update:show="showNotification = $event" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Notification from "@/components/Notification.vue";

const emit = defineEmits(['updateFavorites']);
const props = defineProps({
    recipe: {
        type: Object,
        required: true
    }
});

const user = ref(null);
const isFavorited = ref(false);
const showNotification = ref(false);
const notificationMessage = ref("");

const auth = getAuth();

onMounted(async () => {
    onAuthStateChanged(auth, async (currentUser) => {
        user.value = currentUser;
        if (user.value) {
            await fetchFavoriteStatus();
        }
    });
});

const fetchFavoriteStatus = async () => {
    try {
        const userDoc = await getDoc(doc(db, "users", user.value.uid));
        if (userDoc.exists() && userDoc.data().favoritedRecipes) {
            const favoriteRecipes = userDoc.data().favoritedRecipes;
            isFavorited.value = favoriteRecipes.some(fav => fav.uri === props.recipe.uri);
        }
    } catch (error) {
        console.error("Failed to fetch favorite status:", error);
        showNotificationMessage("Failed to load favorite status. Please try again later.");
    }
};

const toggleFavorite = async () => {
    if (!user.value) {
        showNotificationMessage("You need to sign in to save recipes.");
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.value.uid);
        if (isFavorited.value) {
            await updateDoc(userDocRef, {
                favoritedRecipes: arrayRemove({
                    label: props.recipe.label,
                    uri: props.recipe.uri,
                    image: props.recipe.image,
                    calories: props.recipe.calories,
                    yield: props.recipe.yield,
                }),
            });
            showNotificationMessage("Recipe removed from favorites.");
        } else {
            await updateDoc(userDocRef, {
                favoritedRecipes: arrayUnion({
                    label: props.recipe.label,
                    uri: props.recipe.uri,
                    image: props.recipe.image,
                    calories: props.recipe.calories,
                    yield: props.recipe.yield,
                }),
            });
            showNotificationMessage("Recipe saved to favorites!");
        }

        isFavorited.value = !isFavorited.value;
        emit("updateFavorites", { ...props.recipe, isFavorited: isFavorited.value });
    } catch (error) {
        console.error("Failed to update favorites:", error);
    }
};

const showNotificationMessage = (message) => {
    notificationMessage.value = message;
    showNotification.value = true;
};
</script>

<style scoped>
.btn {
    cursor: pointer;
}

.favorited {
    fill: red; /* Ensures button is red when favorited */
}
</style>