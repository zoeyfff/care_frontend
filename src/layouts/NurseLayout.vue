<template>
  <el-container class="staff-layout">
    <el-aside :width="asideWidth" class="staff-aside">
      <div class="logo">
        <span class="logo-mark">护</span>
        <span v-show="!collapsed" class="logo-text">护理工作台</span>
      </div>
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          background-color="#134e4a"
          text-color="rgba(255,255,255,0.85)"
          active-text-color="#5eead4"
        >
          <el-menu-item index="/nurse/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>我的工作台</span>
          </el-menu-item>
          <el-menu-item index="/nurse/tasks">
            <el-icon><List /></el-icon>
            <span>我的任务</span>
          </el-menu-item>
          <el-menu-item index="/nurse/vitals">
            <el-icon><FirstAidKit /></el-icon>
            <span>体征录入</span>
          </el-menu-item>
          <el-menu-item index="/nurse/medications">
            <el-icon><Timer /></el-icon>
            <span>用药执行</span>
          </el-menu-item>
          <el-menu-item index="/nurse/handover">
            <el-icon><Document /></el-icon>
            <span>交接班</span>
          </el-menu-item>
          <el-menu-item index="/nurse/incidents">
            <el-icon><Warning /></el-icon>
            <span>事件上报</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <el-container class="staff-main-wrap">
      <el-header class="staff-header" height="56px">
        <div class="header-left">
          <el-button
            :icon="collapsed ? Expand : Fold"
            circle
            plain
            type="primary"
            class="collapse-btn"
            @click="toggle"
          />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/nurse/dashboard' }">
              首页
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">
              {{ route.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tag type="warning" effect="plain" round size="small">
            护理人员端
          </el-tag>
          <el-button link type="primary" @click="goStaff">
            切换到工作人员端
          </el-button>
          <el-dropdown trigger="click" @command="onUserCommand">
            <span class="user-trigger">
              <el-avatar :size="32" class="avatar">{{ avatarText }}</el-avatar>
              <span class="name">{{ displayName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="staff-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  ArrowDown,
  Document,
  Expand,
  FirstAidKit,
  Fold,
  List,
  Odometer,
  Timer,
  Warning,
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const store = useStore();

const collapsed = computed(() => store.state.sidebarCollapse);
const asideWidth = computed(() => (collapsed.value ? "64px" : "220px"));
const activeMenu = computed(() => route.path);
const displayName = computed(() => store.getters.displayName);
const avatarText = computed(() => {
  const n = displayName.value;
  return n ? n.slice(0, 1) : "护";
});

function toggle() {
  store.commit("TOGGLE_SIDEBAR");
}

function goStaff() {
  store.commit("SET_PORTAL", "staff");
  localStorage.setItem("staff_portal", "staff");
  router.push("/staff/dashboard");
}

function onUserCommand(cmd) {
  if (cmd === "logout") {
    store.dispatch("logout");
    router.push("/login");
  }
}
</script>

<style lang="scss" scoped>
.staff-layout {
  height: 100%;
  min-height: 100vh;
}

.staff-aside {
  background: var(--staff-sidebar);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  box-shadow: 2px 0 12px rgba(19, 78, 74, 0.15);
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;

  .logo-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #2dd4bf, #0d9488);
    color: #fff;
    font-weight: 700;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-text {
    color: #fff;
    font-weight: 600;
    font-size: 15px;
    white-space: nowrap;
  }
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item.is-active) {
  background: rgba(20, 184, 166, 0.18) !important;
}

.staff-main-wrap {
  flex: 1;
  min-width: 0;
  background: var(--staff-bg);
}

.staff-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 118, 110, 0.06);
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.collapse-btn {
  border-color: #99f6e4;
  color: var(--staff-primary-dark);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--staff-text);

  .avatar {
    background: var(--staff-primary);
    color: #fff;
    font-size: 14px;
  }

  .name {
    font-size: 14px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.staff-main {
  padding: 20px 24px 32px;
  overflow: auto;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
