<template>
    <Navbar />
    <div class="container-fluid">
        Nutrition
    </div>

    <div>

    </div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
</script>

<script>
import { db } from '../firebase';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';

const mondaymealdata = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'mondaymeals'));

        for (const days of querySnapshot.docs) {
            console.log(days.id);
            let prtDocRef = doc(db, 'mondaymeals', days.id);
            const abc = await getDoc(prtDocRef);
            console.log(abc.data());
        }

        // hard coding the documents data
        // const parentDocRef = doc(db, 'mealsfortheweek', 'monday');
        // const xxx = await getDoc(parentDocRef);
        // console.log(xxx.data());

    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
};

// Call the mondaydata function to retrieve the data
mondaymealdata();
</script>


<style>
table,
th,
td {
    border: 1px black solid;
}
</style>