<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import { ref } from 'vue';

const emit = defineEmits<{
  validated: [boolean];
}>();

const answer = ref('');

function validate() {
  // Здесь будет происходить валидация ответа
  emit('validated', true);
}

defineExpose({ validate });
</script>

<template>
  <Card>
    <template #content>
      <div class="text-center">
        <p class="text-3xl font-bold">Example</p>
        <p>{{ answer }}</p>
        <Button label="Проверить удачу" @click="validate" />
      </div>
    </template>
  </Card>
</template>
