<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-image">
        <img 
          :src="isLogin ? '' : ''"
          alt="Authentication background" 
          class="img-fluid h-100 object-fit-cover" 
        />
      </div>

      <div class="auth-form">
        <h1 class="auth-title">MealMate</h1>
        <h2 class="auth-subtitle">{{ isLogin ? 'Welcome Back!' : 'Join Us Today' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" v-model="email" required>
            <p v-if="emailError" class="error-message">{{ emailError }}</p>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" required>
            <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
          </div>
          <button type="submit" class="btn btn-success w-100 mb-3">
            {{ isLogin ? 'Login' : 'Sign Up' }}
          </button>
        </form>
        <div class="separator">
          <span>or</span>
        </div>
        <button @click="handleGoogleSignIn" class="btn btn-outline-dark w-100">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" class="me-2" style="width: 18px;">
          Sign in with Google
        </button>
        <p class="mt-3 text-center">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <a href="#" @click.prevent="toggleAuthMode">{{ isLogin ? 'Sign Up' : 'Login' }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
const router = useRouter();
const auth = getAuth();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const emailError = ref('');
const passwordError = ref('');

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
  emailError.value = '';
  passwordError.value = '';
};

const handleSubmit = async () => {
  try {
    emailError.value = '';
    passwordError.value = '';
    if (isLogin.value) {
      await signInWithEmailAndPassword(auth, email.value, password.value);
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
      const userId = userCredential.user.uid;

      const userData = {
        email: email.value,
        username: email.value.split('@')[0],
        password: password.value,
        profilePicture: "", 
        dietaryPreferences: [],
        healthGoals: [],
        favoritedRecipes: []
      };
      await setDoc(doc(db, 'users', userId), userData);
    }
    router.push('/');
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      emailError.value = 'Invalid email or password';
      passwordError.value = 'Invalid email or password';
    } else if (error.code === 'auth/email-already-in-use') {
      emailError.value = 'Email already in use';
    } else if (error.code === 'auth/weak-password') {
      passwordError.value = 'Password should be at least 6 characters';
    } else if (error.code === 'auth/too-many-requests') {
      passwordError.value = 'Too many failed attempts. Try again later.';
    } else {
      emailError.value = error.message;
    }
  }
};

const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const userId = userCredential.user.uid;
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      email: userCredential.user.email,
      username: userCredential.user.displayName || "",
      profilePicture: userCredential.user.photoURL || "",
      dietaryPreferences: [],
      healthGoals: [],
      favoritedRecipes: []
    }, { merge: true });
    router.push('/');
  } catch (error) {
    console.error('Google sign-in error:', error);
    emailError.value = error.message;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lily+Script+One&display=swap');

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.auth-card {
  display: flex;
  background-color: #ffffff;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100vh;
}

.auth-image {
  flex: 7;
  max-width: 70%;
}

.auth-form {
  flex: 3;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 30%;
}

.auth-title {
  font-family: 'Lily Script One', Verdana, Geneva, Tahoma, sans-serif;
  font-size: 3rem;
  color: #85ca6a;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 1.5rem;
  color: #6f904a;
  margin-bottom: 1.5rem;
}

.form-control {
  border-radius: 20px;
  padding: 0.75rem 1rem;
}

.btn-success {
  border-radius: 20px;
  padding: 0.75rem 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-success:hover {
  opacity: 0.9;
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
}

.separator::before,
.separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ced4da;
}

.separator span {
  padding: 0 0.5rem;
  color: #6c757d;
}

.btn-outline-dark {
  border-radius: 20px;
  padding: 0.75rem 1rem;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

@media (max-width: 1024px) {
  .auth-card {
    flex-direction: column;
    height: auto;
  }

  .auth-image {
    max-width: 100%;
    height: 30vh;
  }

  .auth-form {
    max-width: 100%;
    padding: 2rem 1rem;
  }
}

@media (max-width: 768px) {
  .auth-container {
    align-items: flex-start;
    background: #ffffff;
  }

  .auth-card {
    box-shadow: none;
  }

  .auth-image {
    height: 25vh;
  }

  .auth-form {
    padding: 1.5rem 1rem;
  }

  .auth-title {
    font-size: 2.5rem;
  }

  .auth-subtitle {
    font-size: 1.25rem;
  }

  .form-control, .btn-success, .btn-outline-dark {
    padding: 0.5rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .auth-image {
    height: 20vh;
  }

  .auth-title {
    font-size: 2rem;
  }

  .auth-subtitle {
    font-size: 1rem;
  }
}
</style>