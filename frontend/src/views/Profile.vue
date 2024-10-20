<template>
  <Navbar />
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Profile</h2>
            <p class="text-center">Welcome, {{ username }}</p>
            <div class="d-grid gap-2 col-6 mx-auto mt-4">
              <button @click="handleSignOut" class="btn btn-danger">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '../firebase'; 
import Navbar from "@/components/Navbar.vue";

const router = useRouter();
const auth = getAuth();
const user = ref(null);
const username = ref('');

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser;

    if (currentUser) {

      const userDoc = doc(db, 'users', currentUser.uid); 
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        username.value = userSnapshot.data().username; 
      } else {
        console.error('No such user document!');
      }
    }
  });
});

const handleSignOut = async () => {
  try {
    await signOut(auth);
    router.push('/auth');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
</script>

<style scoped>

</style>
