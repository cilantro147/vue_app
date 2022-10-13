<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const image = ref("");
const RANDOM_DOG_IMAGE_URL = "https://dog.ceo/api/breeds/image/random";

const getImage = async () => {
  const response = await fetch(RANDOM_DOG_IMAGE_URL);
  const data = await response.json();
  image.value = data.message;
};

const handlerOnClick = async () => {
  await getImage();
};

onMounted(async () => {
  await getImage();
});

// clean up the event listener
onUnmounted(() => {
  image.value = "";
});
</script>

<template>
  <main class="flex flex-col items-center justify-center h-screen p-4">
    <div class="w-96 h-96">
      <img :src="image" class="object-cover h-96 w-96 rounded-lg mx-2 my-2" />
    </div>
    <button
      class="p-2 bg-blue-500 text-white rounded my-3"
      @click="handlerOnClick"
    >
      Get a new image
    </button>
  </main>
</template>
