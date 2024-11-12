<template>
  <div class="homepage">
    <Navbar />
    <WelcomeModal v-if="showModal" />
    <div class="scroll-progress" ref="scrollProgress"></div>
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title title" ref="heroTitle">Welcome back to Mealmate</h1>
        <TypeWriter ref="heroSubtitle"/>
      </div>
      <div ref="heroImage" class="bowl-container">
        <img src="/images/bowl.png" class="bowl">
        <img src="/images/spoon.png" class="spoon" ref="food1">
      </div>
    </section>
    
    <section class="features" ref="featuresSection">
    <h2 class="feature-header title">Your meals for today</h2>
    <div class="features-grid">
      <div 
        class="feature" 
        v-for="(feature, index) in features" 
        :key="index" 
        ref="featureItems"
      >
        <div class="feature-content">
          <div class="feature-image-container">
            <img 
              v-if="feature.image && feature.image !== 'No image'" 
              class="feature-img" 
              :src="feature.image" 
              :alt="feature.title"
            />
            <div v-else class="feature-placeholder">
              <p class="no-meal-message">Oops, no meal set yet!</p>
            </div>
          </div>
          <div class="feature-info">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

    
    <section class="how-it-works" ref="howItWorksSection">
      <h2 class="quick-action-title title">Quick Actions</h2>
      <div class="steps">
        <div class="step" v-for="(step, index) in steps" :key="index" ref="stepItems">

          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <button class="quick-action-btn btn" @click="navigateTo(step.path)">{{ step.title }}</button>
        </div>
      </div>
    </section>
    
    <section class="recommended-recipes" ref="recommendedRecipesSection">
      <h2 class="recommended-recipes-title title">Recommended Recipes</h2>
      <Recommendation />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth,  onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar.vue";
import { useRouter } from 'vue-router';
import WelcomeModal from '@/components/WelcomeModal.vue';
import 'vue3-carousel/dist/carousel.css';
// import { Carousel, Slide, Navigation } from 'vue3-carousel';
import Recommendation from "@/components/Recommendation.vue";
import TypeWriter from '@/components/Typewriter.vue';


gsap.registerPlugin(ScrollTrigger);

const db = getFirestore(); // to get firestore instance

const auth = getAuth();
const showModal = ref(false);

const heroTitle = ref(null);
const heroSubtitle = ref(null);
const ctaButton = ref(null);
const heroImage = ref(null);
const featuresSection = ref(null);
const featureItems = ref([]);
const howItWorksSection = ref(null);
const stepItems = ref([]);
const ctaSection = ref(null);
const food1 = ref(null);
// const food2 = ref(null);
// const food3 = ref(null);
const scrollProgress = ref(null);
const recommendedRecipesSection = ref(null);

const carouselConfig = {
  wrapAround: true,
  transition: 500,
  breakpointMode: 'carousel',
  breakpoints: {
    480: {
      itemsToShow: 1.5,
      snapAlign: 'center',
    },
    768: {
      itemsToShow: 2.5,
      snapAlign: 'center',
    },
    1024: {
      itemsToShow: 3,
      snapAlign: 'center',
    },
  },
};

const features = ref([
  { icon: 'images/breakfasticon.png', title: 'Breakfast', description: '', image: '' },
  { icon: 'images/lunchicon.png', title: 'Lunch', description: '', image: '' },
  { icon: 'images/dinnericon.png', title: 'Dinner', description: '', image: '' },
]);


const getTodayMeals = async () => {
  try {
    const todayIndex = new Date().getDay(); 
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const user = auth.currentUser;
    if (!user) {
      console.error("No user is currently signed in.");
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error("User document not found.");
      return;
    }

    const userData = userDoc.data();
    const todayMeals = userData.mealPlan[daysOfWeek[todayIndex]] || {};


    const meals = {
      breakfast: "",
      lunch: "",
      dinner: "",
    };

    const image = {
      breakfast: "No image",
      lunch: "No image",
      dinner: "No image",
    }

    if (todayMeals.Breakfast[0] && todayMeals.Breakfast[0].label) { 
      meals.breakfast = todayMeals.Breakfast[0].label;
      image.breakfast = todayMeals.Breakfast[0].image;
    }
    if (todayMeals.Lunch[0] && todayMeals.Lunch[0].label) {
      meals.lunch = todayMeals.Lunch[0].label;
      image.lunch = todayMeals.Lunch[0].image;
    }
    if (todayMeals.Dinner[0] && todayMeals.Dinner[0].label) {
      meals.dinner = todayMeals.Dinner[0].label;
      image.dinner = todayMeals.Dinner[0].image;
    }

    features.value = [
      { icon: "images/breakfasticon.png", title: "Breakfast", description: meals.breakfast, image: image.breakfast },
      { icon: "images/lunchicon.png", title: "Lunch", description: meals.lunch, image: image.lunch },
      { icon: "images/dinnericon.png", title: "Dinner", description: meals.dinner, image: image.dinner },
    ];
  } catch (error) {
    console.error('Error fetching meals:', error);
  }
};

  const router = useRouter();

  const steps = [
    { 
      title: 'Change Meal Preferences', 
      description: 'Tell us about your dietary preferences, allergies, and favourite type of cuisines.', 
      path: '/meal-preferences' 
    },
    { 
      title: 'View weekly meal plan', 
      description: 'Plan your meals for the week', 
      path: '/meal-preferences' 
    },
    { 
      title: 'View Grocery List', 
      description: 'Use our smart grocery list for efficient shopping.', 
      path: '/grocery-list' 
    },
    { 
      title: 'Find recipes', 
      description: 'Follow our easy recipes and enjoy delicious, healthy meals.', 
      path: '/search-recipes' 
    },
  ];

  const navigateTo = (path) => {
    if (path === '/meal-preferences') {
    router.push({ path, query: { openModal: 'true' } });
  } else {
    router.push(path);
  }
  };

onMounted(async() => {
  await getTodayMeals();
 const isNewUser = localStorage.getItem('isNewUser');

  if (isNewUser) {
    showModal.value = true; 
    localStorage.removeItem('isNewUser')
  };

  gsap.from(heroTitle.value, { opacity: 0, y: 50, duration: 1, delay: 0.5 });
  gsap.from(heroSubtitle.value, { opacity: 0, y: 50, duration: 1, delay: 0.7 });
  gsap.from(heroImage.value, { opacity: 0, x: 100, duration: 1, delay: 1.1 });

  gsap.to(food1.value, { y: -30, rotation: 20, duration: 2, repeat: -1, yoyo: true, ease: "power1.inOut" });

  const animateSections = (elements, props) => {
    elements.forEach((el, index) => {
      gsap.fromTo(el, 
        { opacity: 0, ...props.from(index) },
        {
          opacity: 1,
          ...props.to,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 20%",
            scrub: true,
            toggleActions: "play reverse play reverse"
          }
        }
      );
    });
  };

  animateSections(featureItems.value, {
    from: () => ({ y: 50 }),
    to: { y: 0 }
  });

  animateSections(stepItems.value, {
    from: (index) => ({ x: index % 2 === 0 ? -50 : 50 }),
    to: { x: 0 }
  });

  gsap.fromTo(ctaSection.value,
    { opacity: 1, y: 50 },
    {
      opacity: 1,
      y: 0,
      scrollTrigger: {
        trigger: ctaSection.value,
        start: "top 10%",
        end: "top 90%",
        scrub: true,
        toggleActions: "play reverse play reverse"
      }
    }
  );

  gsap.to(scrollProgress.value, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { 
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3
    }
  });
});

onUnmounted(() => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Gluten:wght@600&family=Space+Mono&display=swap");

body {
  overflow: hidden;
}

* {
  font-family: 'Open Sans', sans-serif;
}

.title {
  color: rgba(0, 90, 0, 1);
  font-weight:bold;
}

.bowl-container {
  position: relative;
  width: 100%; 
}

.bowl {
  width: 100%; /* make sure the bowl scales with the container */
  height: auto;
}

.feature-header {
  margin-top: 20px;
}
.spoon {
  position: absolute;
  left: 65%;
  top: -40px;
  transform: translateX(-50%);
  width: 80%; 
  height: auto;
  z-index: 1;
}
.homepage {
  font-family: 'Arial', sans-serif;
  color: #333;
}

.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #226925;
  transform-origin: left;
  transform: scaleX(0);
  z-index: 1000;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 5%;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
}

.hero-content {
  z-index: 2;
  padding:40px;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.cta-button {
  padding: 12px 24px;
  font-size: 1.1rem;
  background-color: #226925;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.cta-button:hover {
  background-color: #226925;
  transform: translateY(-2px);
}

.hero-image {
  max-width: 100%;
  border-radius: 10px;
  z-index: 2;
}
.hero-title {
  margin-bottom:40px
;
}

.features {
  padding: 5% 5%;

}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.feature {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.feature:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.feature-content {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.feature-image-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.feature-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.feature:hover .feature-img {
  transform: scale(1.1);
}

.feature-placeholder {
  width: 100%;
  height: 100%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 2rem 1.5rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.feature:hover .feature-info {
  transform: translateY(0);
}

.feature-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.feature-description {
  font-size: 1rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
}

.feature:hover .feature-title,
.feature:hover .feature-description {
  opacity: 1;
  transform: translateY(0);
}

.no-meal-message {
  color: #6c757d;
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-content {
    height: 250px;
  }
  
  .feature-title {
    font-size: 1.5rem;
  }
}

.how-it-works {
  background-color: #ffffff;
}

.steps {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin:50px;
}

.step {
  flex-basis: calc(25% - 2rem);
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.quick-action-btn {
  background-color: #4CAF50;
  color: white;
}

.quick-action-btn:hover {
  background-color: rgba(0, 90, 0, 1);
  color: #DAE2BC;
}

@media (max-width:  1024px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }

  .hero-content, .hero-image {
    max-width: 100%;
  }

  .hero-image {
    margin-top: 2rem;
  }

  .steps {
    flex-direction: column;
  }

  .step {
    flex-basis: 100%;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }

  h2 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .float-object {
    max-width: 60px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  p {
    font-size: 1rem;
  }

  .cta-button {
    padding: 10px 20px;
    font-size: 1rem;
  }

  .float-object {
    max-width: 40px;
  }
}
</style>