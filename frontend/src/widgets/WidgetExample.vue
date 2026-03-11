<script setup lang="ts">
import Card from 'primevue/card';
import { watch } from 'vue';

const props = defineProps<{
  validateTrigger: number;
}>();

const emit = defineEmits<{
  validated: [boolean];
}>();

// функция валидации запускается при изменения пропса validateTrigger из родителя-обертки, когда происходит 1-й клик по кнопке "Ответить"
function validate() {
  const valid = true;
  emit('validated', valid); // если valid = true, то кнопка в родителе меняется на "Следующий вопрос"
}

watch(() => props.validateTrigger, validate);
</script>

<template>
  <Card>
    <template #content>
      <div class="text-center">
        <p class="text-3xl font-bold">Example</p>
      </div>
    </template>
  </Card>
</template>
