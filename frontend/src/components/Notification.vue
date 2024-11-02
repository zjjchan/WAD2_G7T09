<!-- src/components/Notification.vue -->
<template>
    <div v-if="show" class="notification">
        <p>{{ message }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
    message: String,
    show: Boolean,
    duration: {
        type: Number,
        default: 4000, // default to 4 seconds
    },
});

const emit = defineEmits(["update:show"]);

onMounted(() => {
    if (props.show) {
        setTimeout(() => {
            emit("update:show", false);
        }, props.duration);
    }
});

watch(props.show, (newVal) => {
    if (newVal) {
        setTimeout(() => {
            emit("update:show", false);
        }, props.duration);
    }
});
</script>

<style scoped>
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #333;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: opacity 0.3s ease;
}
</style>