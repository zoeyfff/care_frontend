<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand">
        <div class="logo-mark">颐</div>
        <div>
          <h1>康养护院 · 工作人员登录</h1>
          <p>一体化数字运营 · 照护更高效</p>
        </div>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="login-form"
      >
        <el-form-item label="登录入口" prop="portal">
          <el-segmented v-model="form.portal" :options="portalOptions" />
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入工号或用户名"
            size="large"
            clearable
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          class="submit-btn"
          :loading="loading"
          @click="submit"
        >
          登录工作台
        </el-button>
      </el-form>
    </div>
    <div class="login-side">
      <div class="side-inner">
        <h2>为长者提供有温度的照护</h2>
        <ul>
          <li>档案、护理、健康、费用一站协同</li>
          <li>数据可视化辅助管理决策</li>
          <li>与家属端信息互通、隐私可控</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";

const store = useStore();
const router = useRouter();
const route = useRoute();

const formRef = ref();
const loading = ref(false);
const form = reactive({
  portal: "staff",
  username: "admin",
  password: "123456",
});
const portalOptions = [
  { label: "工作人员端", value: "staff" },
  { label: "护理人员端", value: "nurse" },
];
const rules = {
  portal: [{ required: true, message: "请选择入口", trigger: "change" }],
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
      portal: form.portal,
    });
    ElMessage.success("欢迎回来");
    const redirect =
      route.query.redirect ||
      (form.portal === "nurse" ? "/nurse/dashboard" : "/staff/dashboard");
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
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.login-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px clamp(24px, 6vw, 80px);
  background: #fff;
}

.brand {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 36px;

  .logo-mark {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #2dd4bf, #0d9488);
    color: #fff;
    font-size: 26px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  h1 {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 700;
    color: var(--staff-text);
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--staff-muted);
  }
}

.login-form {
  max-width: 400px;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
  font-weight: 600;
}

.hint {
  margin-top: 16px;
  font-size: 12px;
  color: var(--staff-muted);
  line-height: 1.5;
}

.login-side {
  background: linear-gradient(160deg, #0f766e 0%, #134e4a 45%, #042f2e 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  @media (max-width: 900px) {
    display: none;
  }
}

.side-inner {
  max-width: 400px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 20px;
    line-height: 1.35;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    line-height: 2;
    opacity: 0.92;
    font-size: 15px;
  }
}
</style>
