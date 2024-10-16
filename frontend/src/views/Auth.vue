<template>
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-image">
        <img 
          :src="isLogin ? '/images/loginimage.png' : '/images/signupimage.png'" 
          alt="Image" 
          class="img-fluid rounded-start h-100 object-fit-cover" 
        />
        </div>
        <div class="auth-form">
          <h1 class="auth-title">MealMate</h1>
          <h2 class="auth-subtitle">{{ isLogin ? 'Welcome Back!' : 'Join Us Today' }}</h2>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input type="email" class="form-control" id="email" v-model="email" required>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" v-model="password" required>
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
  
  const router = useRouter();
  const auth = getAuth();
  
  const isLogin = ref(true);
  const email = ref('');
  const password = ref('');
  
  const toggleAuthMode = () => {
    isLogin.value = !isLogin.value;
  };
  
  const handleSubmit = async () => {
    try {
      if (isLogin.value) {
        await signInWithEmailAndPassword(auth, email.value, password.value);
      } else {
        await createUserWithEmailAndPassword(auth, email.value, password.value);
      }
      router.push('/');
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.message);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert(error.message);
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
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    width: 800px;
    max-width: 90%;
  }
  
  .auth-image {
    flex: 1;
    max-width: 50%;
  }
  
  .auth-form {
    flex: 1;
    padding: 2rem;
  }
  
  .auth-title {
    font-family: 'Lily Script One', cursive;
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
  
  .btn-primary {
    background-color: #4e73df;
    border-color: #4e73df;
    border-radius: 20px;
    padding: 0.75rem 1rem;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .btn-primary:hover {
    background-color: #2e59d9;
    border-color: #2e59d9;
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
  
  @media (max-width: 768px) {
    .auth-card {
      flex-direction: column;
    }
  
    .auth-image {
      max-width: 100%;
      height: 200px;
    }
  
    .auth-image img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
  </style>