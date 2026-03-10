<template>
  <nav class="sidebar">
    <ul class="nav-links">
      <li
        v-for="item in menuItems"
        :key="item.id"
        class="nav-item"
        :class="{ 'nav-item-pressed': isActiveItem(item) }"
      >
        <!-- Элемент с подменю -->
        <template v-if="item.submenu">
          <div class="nav-icon-container" @click="toggleSubmenu(item.id)">
            <img :src="item.icon" :alt="item.alt" class="nav-icon" />
          </div>
          <ul v-if="openSubmenuId === item.id" class="submenu">
            <li v-for="sub in item.submenu" :key="sub.path">
              <router-link :to="sub.path" @click="closeAll">{{ sub.title }}</router-link>
            </li>
          </ul>
        </template>

        <!-- Элемент без подменю (простая ссылка) -->
        <router-link v-else :to="item.path" class="nav-link" exact>
          <img :src="item.icon" :alt="item.alt" class="nav-icon" />
        </router-link>
      </li>
    </ul>
    <!-- Кнопка для сворачивания всего меню (опционально) -->
    <div class="empty-icon-container" @click="toggleSidebar">
      <div class="empty-icon">
        <img src="/assets/unwrap.png" alt="Свернуть меню" class="nav-icon" />
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'Sidebar',
  setup() {
    const route = useRoute();
    const openSubmenuId = ref(null); // id открытого подменю

    // Данные меню
    const menuItems = [
      {
      id: 'seed-menu',
      icon: '/assets/seed.png',
      alt: 'Севооборот',
      submenu: [
        { title: 'История посевов', path: '/crop-rotation/history' },
        { title: 'Добавить поле', path: '/crop-rotation/fields' },
        { title: 'Совместимость культур', path: '/crop-rotation/compatibility' },
        { title: 'Агротехнологический план', path: '/crop-rotation/agroplan' },
      ],
      },
      {
        id: 'map-menu',
        icon: '/assets/map.png',
        alt: 'Карты',
        path: '/maps',
      },
      {
        id: 'analysis-menu',
        icon: '/assets/analisys.png',
        alt: 'Аналитика',
        submenu: [
          { title: 'Показатели предприятия', path: '/indicators' },
          { title: 'Прогнозирование', path: '/forecast' },
          { title: 'Отчетность', path: '/reports' },
        ],
      },
      {
        id: 'techmap-menu',
        icon: '/assets/techmap.png',
        alt: 'Техкарты',
        path: '/techmaps',
      },
      {
        id: 'tech-menu',
        icon: '/assets/tech.png',
        alt: 'Техника',
        path: '/tech',
      },
      {
        id: 'glossary-menu',
        icon: '/assets/glossary.png',
        alt: 'Справочники',
        path: '/glossary',
      },
      {
        id: 'settings-menu',
        icon: '/assets/settings.png',
        alt: 'Настройки',
        path: '/settings',
      },
    ];

    // Функция проверки активного пункта меню (для подсветки)
    const isActiveItem = (item) => {
      if (item.submenu) {
        return item.submenu.some(sub => route.path.startsWith(sub.path));
      } else {
        return route.path === item.path;
      }
    };

    // Открыть/закрыть подменю
    const toggleSubmenu = (id) => {
      console.log('toggleSubmenu called with id:', id);
      openSubmenuId.value = openSubmenuId.value === id ? null : id;
    };

    // Закрыть все подменю
    const closeAll = () => {
      openSubmenuId.value = null;
    };

    // Обработчик клика вне меню
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && !sidebar.contains(event.target)) {
        closeAll();
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    // Опционально: сворачивание всего меню (можно реализовать позже)
    const toggleSidebar = () => {};

    return {
      menuItems,
      openSubmenuId,
      isActiveItem,
      toggleSubmenu,
      closeAll,
      toggleSidebar,
    };
  },
};
</script>

<style scoped>
.nav-item-pressed .nav-icon-container {
  background-color: rgba(0, 0, 0, 0.1);
}
.submenu {
  position: absolute;
  left: 60px;
  top: 0;
  width: 200px;
  background-color: #676767;
  list-style: none;
  border-left: 2px solid #4e4e4e;
  animation: slideIn 0.2s ease-out;
  z-index: 1000;
}

.submenu li {
  padding: 12px 15px;
  border-bottom: 1px solid #3e3e3e;
}

.submenu li:last-child {
  border-bottom: none;
}

.submenu a {
  color: white;
  text-decoration: none;
  display: block;
  transition: all 0.2s;
}

.submenu a:hover {
  color: #ddd;
  padding-left: 5px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>