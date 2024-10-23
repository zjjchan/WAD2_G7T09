<template>
    <Navbar />
    <div class="container-fluid">
        Nutrition
    </div>

</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
</script>

<script>
import { db } from '../firebase';
// import { firebaseApp } from '../firebase'; // Import your Firebase configuration
// import { analytics } from '../firebase';
// import { auth } from '../firebase';

import { doc, collection, getDocs } from 'firebase/firestore';

const fetchData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'mealsfortheweek'));

        for (const days of querySnapshot.docs) {
            console.log(days.id);

            // Fetch meals (subcollection) for each day
            const mondayDocRef = doc(db, 'mealsfortheweek', 'monday');

            
            
        }

    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
};

// Call the fetchData function to retrieve the data
fetchData();
</script>

<style>
table,
th,
td {
    border: 1px black solid;
}
</style>