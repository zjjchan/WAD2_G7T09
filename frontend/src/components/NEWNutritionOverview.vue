<template>
    <canvas class="targetchart" id="overviewchart" style="width:100%; max-width:800px"></canvas>
</template>


<script>
// import { db } from '../firebase';
import { getFirestore, doc, collection, getDocs, getDoc, getDocFromCache } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onMounted, ref } from 'vue';
// import { Chart } from 'chart.js'; DO NOT UNCOMMENT

export default {

    setup() {

        const fetchNutritionData = async () => {
        };

        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'sunday'];
        const mealtypes = ['Breakfast', 'Lunch', 'Dinner'];

        // Fetch data only when component is mounted
        onMounted(async () => {
            // PULLING DATA FROM USERS COLLECTION INSTEAD
            const mealdb = getFirestore(); // to get firestore instance
            const auth = getAuth();
            const user = auth.currentUser;

            const userDocRef = doc(mealdb, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();
            console.log(userData);

        });

        return {
            // Expose new nutrition data to template
        };
    },
};

</script>

<style scoped></style>