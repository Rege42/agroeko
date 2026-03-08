<template>
  <div>
    <div class="search-bar">
      <label for="field-search">Поиск:</label>
      <input
        class="standart-input medium-width"
        type="text"
        id="field-search"
        placeholder="Введите название поля..."
        v-model="searchQuery"
      />
      <button class="standart-button" @click="search">Найти</button>
    </div>

    <div class="horizontal-item-list">
      <div
        v-for="field in filteredFields"
        :key="field.id"
        class="horizontal-item"
        @click="goToFieldHistory(field.id)"
      >
        {{ field.name }}
      </div>
    </div>

    <!-- Пагинация -->
    <div class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">«</button>
      <button
        v-for="page in totalPages"
        :key="page"
        class="page-btn"
        :class="{ active: currentPage === page }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">»</button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'CropsHistory',
  setup() {
    const router = useRouter();
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 10;

    const fields = ref(
      Array.from({ length: 22 }, (_, i) => ({
        id: i + 1,
        name: `Поле ${i + 1}`,
      }))
    );

    const filteredFields = computed(() => {
      if (!searchQuery.value) return fields.value;
      return fields.value.filter(f =>
        f.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const totalPages = computed(() =>
      Math.ceil(filteredFields.value.length / itemsPerPage)
    );

    const paginatedFields = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      return filteredFields.value.slice(start, start + itemsPerPage);
    });

    const search = () => {
      currentPage.value = 1;
    };

    const goToPage = (page) => {
      currentPage.value = page;
    };

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const goToFieldHistory = (fieldId) => {
      router.push(`/crop-rotation/history/${fieldId}`);
    };

    return {
      searchQuery,
      currentPage,
      paginatedFields,
      totalPages,
      search,
      goToPage,
      prevPage,
      nextPage,
      goToFieldHistory,
    };
  },
};
</script>