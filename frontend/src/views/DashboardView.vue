<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>
<template>
  <div style="text-align: center; margin-top: 50px">
    <h1>Dashboard</h1>
    <p>Привет, {{ auth.userName }}</p>
  </div>
</template>
