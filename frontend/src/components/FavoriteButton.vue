<template>
    <!-- Display notification if needed -->
    <svg @click="toggleFavorite" class="btn" xmlns="http://www.w3.org/2000/svg" width="70" height="70"
        :fill="isFavorited ? 'black' : 'white'" stroke="black" viewBox="0 0 24 24">
        <path d="M6 2a2 2 0 0 0-2 2v18l8-4.5 8 4.5V4a2 2 0 0 0-2-2H6z" />
    </svg>
    <Notification v-if="showNotification" :message="notificationMessage" :show="showNotification"
        @update:show="showNotification = $event" />


</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase"; // Import Firebase configuration
import Notification from "@/components/Notification.vue"; // Import Notification component

// Props
const props = defineProps({
    recipe: {
        type: Object,
        required: true
    }
});

// Component state
const isFavorited = ref(false);
const user = ref(null);
const showNotification = ref(false);
const notificationMessage = ref("");

// Firebase authentication
const auth = getAuth();

const checkIfFavorited = async () => {
    if (!user.value) return;

    try {
        const userDoc = await getDoc(doc(db, "users", user.value.uid));
        const favoritedRecipes = userDoc.data().favoritedRecipes || [];
        isFavorited.value = favoritedRecipes.some((item) => item.uri === props.recipe.uri);
    } catch (error) {
        console.error("Failed to check if recipe is favorited:", error);
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
                }),
            });
            isFavorited.value = false;
            showNotificationMessage("Recipe removed from favorites.");
        } else {
            await updateDoc(userDocRef, {
                favoritedRecipes: arrayUnion({
                    label: props.recipe.label,
                    uri: props.recipe.uri,
                    image: props.recipe.image,
                    calories: props.recipe.calories,
                }),
            });
            isFavorited.value = true;
            showNotificationMessage("Recipe saved to favorites!");
        }
    } catch (error) {
        console.error("Failed to update favorites:", error);
    }
};

const showNotificationMessage = (message) => {
    notificationMessage.value = message;
    showNotification.value = true;
};

// Check authentication and favorite status on mount
onMounted(() => {
    onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
        if (user.value) {
            checkIfFavorited();
        }
    });
});
</script>

<style scoped>
.btn {
    cursor: pointer;
}
</style>