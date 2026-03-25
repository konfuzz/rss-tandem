<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>
<template>
  <div flex flex-col min-h-screen items-center justify-center>
    <h1>Dashboard</h1>
    <p>Привет, {{ auth.userName }}</p>
  </div>
</template>
