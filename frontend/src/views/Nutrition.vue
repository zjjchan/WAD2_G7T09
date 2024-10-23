

<template>
    <Navbar />
    <div class="container-fluid">
        Nutrition
    </div>

</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import { db } from '../firebase'; // Import your Firebase configuration
import { collection, getDocs } from 'firebase/firestore';

const querySnapshot = await getDocs(collection(db, 'weekly_meals'));
console.log(querySnapshot);

</script>


<style>
table, th, td {
    border: 1px black solid;
}
</style>