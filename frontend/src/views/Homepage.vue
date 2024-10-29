###HOMEPAGE <template>
  <div class="homepage">
    <Navbar />
    <WelcomeModal v-if="showModal" />
    <div class="scroll-progress" ref="scrollProgress"></div>
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title" ref="heroTitle">Welcome back to Mealmate</h1>
        <p ref="heroSubtitle">Your personal assistant for meal planning, grocery shopping, and nutrition</p>
      </div>
      <img ref="heroImage" src="/images/loginimage.png" alt="MealMate Hero" class="hero-image" />
      <div class="floating-objects">
        <img src="/images/food1.png" alt="Fruit" class="float-object food-1" ref="food1" />
        <img src="/images/food2.png" alt="Vegetable" class="float-object food-2" ref="food2" />
        <img src="/images/food3.png" alt="Fruit" class="float-object food-3" ref="food3" />
      </div>
    </section>
    
    <section class="features" ref="featuresSection">
      <h2>Your meals for today!</h2>
      <div class="features-grid">
        <div class="feature" v-for="(feature, index) in features" :key="index" ref="featureItems">
          <img :src="feature.icon" class="feature-icon" />
          <!-- <h3>{{ feature.title }}</h3> -->
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>
    
    <section class="how-it-works" ref="howItWorksSection">
      <h2>Quick Actions</h2>
      <div class="steps">
        <div class="step" v-for="(step, index) in steps" :key="index" ref="stepItems">
          <div class="step-number">{{ index + 1 }}</div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <button @click="navigateTo(step.path)">Go to {{ step.title }}</button>
        </div>
      </div>
    </section>
    
    <section class="testimonials" ref="testimonialsSection">
      <h2>Recommended Recipes</h2>
      <div class="testimonial-container" ref="testimonialContainer">
        <div class="testimonial" v-for="(testimonial, index) in testimonials" :key="index">
          <p>"{{ testimonial.quote }}"</p>
          <span>- {{ testimonial.author }}</span>
        </div>
      </div>
    </section>
    
    <section class="cta-section" ref="ctaSection">
      <button class="cta-button">return</button>
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
const testimonialsSection = ref(null);
const testimonialContainer = ref(null);
const ctaSection = ref(null);
const food1 = ref(null);
const food2 = ref(null);
const food3 = ref(null);
const scrollProgress = ref(null);



// Set default features in case data is not fetched yet
const features = ref([
{ icon: 'images/breakfasticon.png', title: 'Breakfast', description: 'Oops, no meals set yet!' },
{ icon: 'images/lunchicon.png', title: 'Lunch', description: 'Oops, no meals set yet!' },
{ icon: 'images/dinnericon.png', title: 'Dinner', description: 'Oops, no meals set yet!' },
]);

const daysOfWeek = [
'sundaymeals', 'mondaymeals', 'tuesdaymeals',
'wednesdaymeals', 'thursdaymeals', 'fridaymeals', 'saturdaymeals'
];

const getTodayMeals = async () => {
try {
  const today = new Date().getDay();
  const todayCollection = daysOfWeek[today];
  console.log(todayCollection)

  const querySnapshot = await getDocs(collection(db, todayCollection));
  const meals = {
  breakfast: "Oops, no breakfast set yet!",
  lunch: "Oops, no lunch set yet!",
  dinner: "Oops, no dinner set yet!",
  };

  querySnapshot.forEach((doc) => {
  const data = doc.data();
  if (data.mealType === "breakfast") meals.breakfast = data.name;
  if (data.mealType === "lunch") meals.lunch = data.name;
  if (data.mealType === "dinner") meals.dinner = data.name;
  });

  // Update the features array with meal data
  features.value = [
  { icon: "images/breakfasticon.png", title: "Breakfast", description: meals.breakfast },
  { icon: "images/lunchicon.png", title: "Lunch", description: meals.lunch },
  { icon: "images/dinnericon.png", title: "Dinner", description: meals.dinner },
  ];
  } catch (error) {
      console.error('Error fetching meals:', error);
  }
  };

  const router = useRouter();

  const steps = [
    { 
      title: 'Change Meal Preferences', 
      description: 'Tell us about your dietary preferences, allergies, and health goals.', 
      path: '/profile' 
    },
    { 
      title: 'View weekly meal plan', 
      description: 'Receive a personalized weekly meal plan based on your profile.', 
      path: '/meal-preferences' 
    },
    { 
      title: 'Grocery List', 
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
    router.push(path);  
  };



const testimonials = [
  { quote: '-', author: 'placeholder' },
  { quote: '-', author: 'placeholder' },
  { quote: '-', author: 'placeholder' },
];



onMounted(async() => {
  await getTodayMeals();
 const isNewUser = localStorage.getItem('isNewUser');

  if (isNewUser) {
    showModal.value = true; // Show the modal
    localStorage.removeItem('isNewUser')
  };
  // Hero section animations
  gsap.from(heroTitle.value, { opacity: 0, y: 50, duration: 1, delay: 0.5 });
  gsap.from(heroSubtitle.value, { opacity: 0, y: 50, duration: 1, delay: 0.7 });
  gsap.from(ctaButton.value, { opacity: 0, y: 50, duration: 1, delay: 0.9 });
  gsap.from(heroImage.value, { opacity: 0, x: 100, duration: 1, delay: 1.1 });

  // Floating objects animations
  gsap.to(food1.value, { y: -40, rotation: 10, duration: 2, repeat: -1, yoyo: true, ease: "power1.inOut" });
  gsap.to(food2.value, { y: 30, rotation: -5, duration: 2.5, repeat: -1, yoyo: true, ease: "power1.inOut" });
  gsap.to(food3.value, { y: -35, rotation: -12, duration: 1.8, repeat: -1, yoyo: true, ease: "power1.inOut" });

  // Bidirectional scroll animations
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

  // Features section animations
  animateSections(featureItems.value, {
    from: () => ({ y: 50 }),
    to: { y: 0 }
  });

  // How It Works section animations
  animateSections(stepItems.value, {
    from: (index) => ({ x: index % 2 === 0 ? -50 : 50 }),
    to: { x: 0 }
  });

  // Testimonials section animations
  gsap.fromTo(testimonialsSection.value,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      scrollTrigger: {
        trigger: testimonialsSection.value,
        start: "top 80%",
        end: "top 20%",
        scrub: true,
        toggleActions: "play reverse play reverse"
      }
    }
  );

  gsap.to(testimonialContainer.value, {
    x: () => -(testimonialContainer.value.scrollWidth - testimonialContainer.value.offsetWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: testimonialsSection.value,
      start: 'top 50%',
      end: 'bottom 50%',
      scrub: 1,
      pin: true,
    },
  });

  // CTA section animations
  gsap.fromTo(ctaSection.value,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      scrollTrigger: {
        trigger: ctaSection.value,
        start: "top 80%",
        end: "top 20%",
        scrub: true,
        toggleActions: "play reverse play reverse"
      }
    }
  );

  // Scroll progress indicator
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

// Clean up ScrollTrigger on component unmount
onUnmounted(() => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Gluten:wght@600&family=Space+Mono&display=swap");

* {
  color: rgb(9, 56, 9);
  font-family: 'Open Sans', sans-serif;
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
  background-color: #3498db;
  transform-origin: left;
  transform: scaleX(0);
  z-index: 1000;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  padding: 5% 5%;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 50%;
  z-index: 2;
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
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.cta-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.hero-image {
  max-width: 45%;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.floating-objects {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.float-object {
  position: absolute;
  max-width: 200px;
}

.food-1 { top: 10%; left: 5%; }
.food-2 { top: 5%; right: 10%; }
.food-3 { bottom: 15%; left: 15%; }

.features, .how-it-works, .testimonials, .cta-section {
  padding: 5% 5%;
}

.features {
  background-color: #ffffff;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature i {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.feature h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.how-it-works {
  background-color: #ffffff;
}

.steps {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.step {
  flex-basis: calc(25% - 2rem);
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.step-number {
  display: inline-block;
  width: 40px;
  height: 40px;
  background-color: #3498db;
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 40px;
  margin-bottom: 1rem;
}

.testimonials {
  background-color: #ffffff;
  overflow: hidden;
}

.testimonial-container {
  display: flex;
  gap: 2rem;
}

.testimonial {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 300px;
}

.testimonial p {
  font-style: italic;
  margin-bottom: 1rem;
}

.testimonial span {
  font-weight: bold;
}

.cta-section {
  background-color: #3498db;
  color: white;
  text-align: center;
}

.cta-section h2, .cta-section p {
  color: white;
}

.cta-section .cta-button {
  background-color: white;
  color: #3498db;
  font-weight: bold;
}

.cta-section .cta-button:hover {
  background-color: #f0f0f0;
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

.feature-icon {
  width: 100px;
}
</style>