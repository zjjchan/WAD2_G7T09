<script setup>
import { RouterLink, useRoute } from 'vue-router';
import profilepic from '@/assets/images/profilepic.png';
import { gsap } from 'gsap';
import { watch, onMounted, ref } from 'vue';

// Check if a route is active
const route = useRoute();
const isActiveLink = (routePath) => route.path.startsWith(routePath);

// Track the dropdown state
const dropdownOpen = ref(false);

// Watch route changes and animate links
watch(
  () => route.path,
  () => {
    gsap.fromTo(
      ".navbar-nav .nav-link",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power4.out" }
    );
  }
);

// Dropdown open/close animation
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;

  gsap.fromTo(
    '.dropdown-menu',
    { x: 20, opacity: 0, display: 'none' },
    { x: 0, opacity: 1, display: 'block', duration: 0.4, ease: 'back.out(1.7)' }
  );
};

// Profile picture hover effect with bounce-in
onMounted(() => {
  const profileImg = document.querySelector('.profile-img');
  gsap.set(profileImg, { scale: 1 });

  profileImg.addEventListener('mouseenter', () =>
    gsap.to(profileImg, { scale: 1.2, duration: 0.3, ease: 'elastic.out(1, 0.3)' })
  );
  profileImg.addEventListener('mouseleave', () =>
    gsap.to(profileImg, { scale: 1, duration: 0.3, ease: 'power2.inOut' })
  );
});
</script>

<template>
  <nav class="main-navbar navbar sticky-top navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-expanded="false"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <RouterLink to="/" class="nav-logo navbar-brand">Mealmate</RouterLink>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <RouterLink to="/search-recipes" class="nav-link" :class="{ active: isActiveLink('/search-recipes') }">
              recipes<span class="underline"></span>
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/grocery-list" class="nav-link" :class="{ active: isActiveLink('/grocery-list') }">
              grocery list<span class="underline"></span>
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/nutrition" class="nav-link" :class="{ active: isActiveLink('/nutrition') }">
              nutrition<span class="underline"></span>
            </RouterLink>
          </li>
        </ul>
      </div>
      <div class="pfp m-0">
        <RouterLink to="/meal-preferences" class="btn border-0">
          <img :src="profilepic" alt="Profile Picture" class="profile-img" />
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.main-navbar {
  background-color: #ffffff;
  padding: 10px 20px;
}

.nav-logo {
  font-family: 'Shrikhand', cursive;
  font-size: 2rem;
  color: rgb(9, 56, 9);
  margin: 0;
}

.navbar-nav .nav-link {
  font-family: 'Open Sans', sans-serif;
  margin-right: 40px;
  position: relative;
  transition: color 0.3s ease;
}

.navbar-nav .nav-link:hover {
  color: #668b57;
}

.navbar-nav .nav-link .underline {
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  width: 0%;
  background-color: #668b57;
  transition: width 0.3s ease;
}

.navbar-nav .nav-link:hover .underline {
  width: 100%;
}

.navbar-nav .nav-link.active {
  font-weight: bold;
  border-bottom: 2px solid #668b57;
}

.pfp {
  position: relative;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  min-width: 150px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  overflow: hidden;
  opacity: 0;
  display: none;
  transform-origin: top right;
  padding: 10px;
}

/* Adjust dropdown on smaller screens */
@media (max-width: 991px) {
  .pfp .dropdown-menu {
    right: auto;
    left: 0; /* Push dropdown to the left */
  }

  .navbar-toggler {
    order: 1;
    width: 54px;
    border: none;
  }

  .nav-logo {
    order: 2;
    text-align: center;
  }

  .pfp {
    order: 3;
    justify-content: center;
    margin-top: 10px;
  }
}
</style>
