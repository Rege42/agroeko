<template>
  <main class="main-content">
    <div class="search-bar">
      <label for="field-search">Поиск:</label>

      <input
        id="field-search"
        v-model.trim="searchQuery"
        class="standart-input medium-width"
        type="text"
        placeholder="Введите название поля..."
        @keyup.enter="search"
      />

      <button class="standart-button" type="button" @click="search">
        Найти
      </button>

      <router-link class="right-position" :to="{ name: 'FieldForm' }">
        <button class="standart-button right-position" type="button">
          Добавить поле
        </button>
      </router-link>
    </div>

    <div v-if="loading" class="horizontal-item-list">
      <div class="horizontal-item">Загрузка...</div>
    </div>

    <div v-else-if="loadError" class="horizontal-item-list">
      <div class="horizontal-item">{{ loadError }}</div>
    </div>

    <div v-else-if="fields.length" class="horizontal-item-list">
      <div
        v-for="field in fields"
        :key="getFieldId(field)"
        class="horizontal-item"
        @click="goToField(getFieldId(field))"
      >
        {{ field.name }}
      </div>
    </div>

    <div v-else class="horizontal-item-list">
      <div class="horizontal-item">Поля не найдены</div>
    </div>

    <div class="pagination" v-if="!loading && totalPages > 0">
      <button
        class="page-btn"
        type="button"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        «
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        class="page-btn"
        :class="{ active: currentPage === page }"
        type="button"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        class="page-btn"
        type="button"
        :disabled="currentPage >= totalPages"
        @click="nextPage"
      >
        »
      </button>
    </div>
  </main>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fieldApi } from "@/services/api";

export default {
  name: "FieldsList",
  setup() {
    const router = useRouter();

    const searchQuery = ref("");
    const currentPage = ref(1);
    const itemsPerPage = 10;

    const fields = ref([]);
    const totalPages = ref(1);
    const totalItems = ref(0);
    const loading = ref(false);
    const loadError = ref("");

    const getFieldId = (field) => field?.id ?? field?._id;

    const loadFields = async () => {
      loading.value = true;
      loadError.value = "";

      try {
        const payload = await fieldApi.getAll({
          page: currentPage.value,
          limit: itemsPerPage,
          search: searchQuery.value || undefined,
        });

        fields.value = Array.isArray(payload?.items) ? payload.items : [];
        currentPage.value = Number(payload?.pagination?.page) || 1;
        totalPages.value = Number(payload?.pagination?.pages) || 1;
        totalItems.value = Number(payload?.pagination?.total) || 0;
      } catch (error) {
        const data = error.response?.data;
        loadError.value = data?.message || "Не удалось загрузить список полей";
        fields.value = [];
        currentPage.value = 1;
        totalPages.value = 1;
        totalItems.value = 0;
      } finally {
        loading.value = false;
      }
    };

    const visiblePages = computed(() => {
      const total = totalPages.value;
      const current = currentPage.value;

      if (total <= 3) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      if (current === 1) {
        return [1, 2, 3];
      }

      if (current === total) {
        return [total - 2, total - 1, total];
      }

      return [current - 1, current, current + 1];
    });

    const search = async () => {
      currentPage.value = 1;
      await loadFields();
    };

    const goToPage = async (page) => {
      if (page < 1 || page > totalPages.value || page === currentPage.value) {
        return;
      }

      currentPage.value = page;
      await loadFields();
    };

    const prevPage = async () => {
      if (currentPage.value <= 1) return;
      currentPage.value -= 1;
      await loadFields();
    };

    const nextPage = async () => {
      if (currentPage.value >= totalPages.value) return;
      currentPage.value += 1;
      await loadFields();
    };

    const goToField = (id) => {
      if (!id) return;

      router.push({
        name: "FieldEdit",
        params: { id },
      });
    };

    onMounted(loadFields);

    return {
      searchQuery,
      currentPage,
      totalPages,
      totalItems,
      fields,
      loading,
      loadError,
      visiblePages,
      getFieldId,
      search,
      goToPage,
      prevPage,
      nextPage,
      goToField,
    };
  },
};
</script>
