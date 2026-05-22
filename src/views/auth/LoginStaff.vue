<template>
  <div class="login-page">
    <!-- 左侧装饰区 -->
    <div class="login-left">
      <div class="orb orb-1" />
      <div class="orb orb-2" />
      <div class="orb orb-3" />
      <div class="grid-overlay" />

      <div class="left-content">
        <div class="brand-block">
          <div class="brand-logo">
            <span class="logo-text">颐</span>
            <div class="logo-glow" />
          </div>
          <div class="brand-info">
            <h1 class="brand-title">康养护院</h1>
            <p class="brand-sub">智慧养老管理系统</p>
          </div>
        </div>

        <div class="hero-text">
          <h2>让科技传递温度<br />让照护更有品质</h2>
          <p class="hero-desc">集成档案管理、护理任务、健康监测、财务结算与家属协同，覆盖养老机构全业务流程，一体化数字运营让管理更高效。</p>
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div class="feature-title">长者档案数字化</div>
              <div class="feature-desc">健康、护理、费用一站式管理</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div>
              <div class="feature-title">健康数据实时监测</div>
              <div class="feature-desc">体温、血压、用药记录自动追踪</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div>
              <div class="feature-title">家属信息互通</div>
              <div class="feature-desc">实时推送、隐私可控、沟通顺畅</div>
            </div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">500<span>+</span></div>
            <div class="stat-label">在院长者</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <div class="stat-value">98<span>%</span></div>
            <div class="stat-label">家属满意度</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <div class="stat-value">7×24</div>
            <div class="stat-label">全天候守护</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-right">
      <div class="form-container">
        <div class="form-header">
          <div class="form-badge">工作人员入口</div>
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">登录康养护院工作台，开始今日工作</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="login-form"
          @submit.prevent="submit"
        >
          <div class="field-group">
            <label class="field-label">
              <span class="field-dot" />
              工号 / 用户名
            </label>
            <el-form-item prop="username" :show-message="false">
              <el-input
                v-model="form.username"
                placeholder="请输入工号或用户名"
                size="large"
                clearable
                :prefix-icon="User"
                @keyup.enter="submit"
              />
            </el-form-item>
          </div>

          <div class="field-group">
            <label class="field-label">
              <span class="field-dot" />
              登录密码
            </label>
            <el-form-item prop="password" :show-message="false">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="submit"
              />
            </el-form-item>
          </div>

          <div class="form-options">
            <el-checkbox v-model="rememberMe" size="small">记住登录状态</el-checkbox>
            <span class="forgot-link">忘记密码？</span>
          </div>

          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            @click="submit"
          >
            <span v-if="!loading">登 录 工 作 台</span>
            <span v-else>登录中...</span>
          </el-button>
        </el-form>

        <div class="form-footer">
          <span class="footer-hint">康养护院管理系统 · 工作人员端</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";

const store = useStore();
const router = useRouter();
const route = useRoute();

const formRef = ref();
const loading = ref(false);
const rememberMe = ref(false);

const form = reactive({
  username: "",
  password: "",
});

const rules = {
  username: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

async function submit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  loading.value = true;
  try {
    await store.dispatch("login", {
      username: form.username,
      password: form.password,
    });
    ElMessage.success("欢迎回来");
    const redirect = route.query.redirect || store.getters.homePath;
    router.replace(redirect);
  } catch (e) {
    // 错误提示由请求拦截器统一处理
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

// ========== 左侧装饰区 ==========
.login-left {
  background: linear-gradient(145deg, #0a3d34 0%, #134e4a 40%, #0f4f47 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 56px;

  @media (max-width: 900px) {
    display: none;
  }
}

// 背景光晕
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.25;
  pointer-events: none;
}
.orb-1 {
  width: 420px;
  height: 420px;
  background: #2dd4bf;
  top: -120px;
  right: -80px;
  opacity: 0.18;
  animation: float1 8s ease-in-out infinite;
}
.orb-2 {
  width: 300px;
  height: 300px;
  background: #5eead4;
  bottom: -60px;
  left: -60px;
  opacity: 0.15;
  animation: float2 10s ease-in-out infinite;
}
.orb-3 {
  width: 200px;
  height: 200px;
  background: #99f6e4;
  top: 50%;
  left: 30%;
  opacity: 0.12;
  animation: float3 12s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}
@keyframes float2 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(20px) scale(0.95); }
}
@keyframes float3 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(20px); }
}

// 网格叠加
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(45, 212, 191, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(45, 212, 191, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.left-content {
  position: relative;
  z-index: 2;
  max-width: 480px;
  width: 100%;
  color: #fff;
}

// 品牌区
.brand-block {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 56px;
}

.brand-logo {
  position: relative;
  flex-shrink: 0;
}

.logo-text {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2dd4bf, #14b8a6);
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(45, 212, 191, 0.4);
}

.logo-glow {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: linear-gradient(135deg, #2dd4bf, #14b8a6);
  opacity: 0.4;
  filter: blur(12px);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.65; transform: scale(1.08); }
}

.brand-info {}

.brand-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}

.brand-sub {
  margin: 0;
  font-size: 13px;
  opacity: 0.65;
  letter-spacing: 1px;
}

// 大标题区
.hero-text {
  margin-bottom: 40px;

  h2 {
    margin: 0 0 16px;
    font-size: 30px;
    font-weight: 800;
    line-height: 1.4;
    background: linear-gradient(135deg, #fff 60%, #5eead4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  opacity: 0.72;
}

// 功能列表
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 48px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(45, 212, 191, 0.15);
  border: 1px solid rgba(45, 212, 191, 0.25);
  color: #5eead4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 3px;
  opacity: 0.95;
}

.feature-desc {
  font-size: 12px;
  opacity: 0.6;
}

// 底部统计
.stats-row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #5eead4;
  line-height: 1;

  span {
    font-size: 16px;
    font-weight: 600;
  }
}

.stat-label {
  font-size: 11px;
  opacity: 0.55;
  margin-top: 4px;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
}

// ========== 右侧登录表单 ==========
.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafb;
  padding: 48px 24px;
  position: relative;
  overflow: auto;
}

.form-container {
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-header {
  margin-bottom: 36px;
}

.form-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #0d9488;
  background: rgba(13, 148, 136, 0.08);
  border: 1px solid rgba(13, 148, 136, 0.15);
  border-radius: 20px;
  padding: 4px 14px;
  margin-bottom: 16px;
}

.form-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.form-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.login-form {
  background: #fff;
  border-radius: 20px;
  padding: 32px 32px 28px;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06), 0 1px 4px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.04);
}

.field-group {
  margin-bottom: 20px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}

.field-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #0d9488;
  flex-shrink: 0;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #e2e8f0;
  padding: 4px 14px;
  transition: box-shadow 0.2s;

  &:hover, &.is-focus {
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.25);
  }
}

:deep(.el-input__inner) {
  font-size: 14px;
  &::placeholder {
    color: #94a3b8;
  }
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  .forgot-link {
    font-size: 13px;
    color: #0d9488;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.75; }
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.35);
  transition: all 0.2s;
  color: #fff;

  &:hover {
    background: linear-gradient(135deg, #0d6b5f 0%, #0d9488 100%);
    box-shadow: 0 6px 20px rgba(13, 148, 136, 0.45);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
  }
}

.form-footer {
  text-align: center;
  margin-top: 24px;
}

.footer-hint {
  font-size: 12px;
  color: #94a3b8;
  letter-spacing: 0.5px;
}
</style>
