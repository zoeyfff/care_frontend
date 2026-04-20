<template>
  <div>
    <h1 class="staff-page-title">我的工作台</h1>
    <p class="sub">聚焦当班工作：待执行任务、用药提醒、异常体征与交接班。</p>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <div
          class="staff-stat-card"
          style="background: linear-gradient(135deg, #0d9488, #14b8a6)"
        >
          <div class="label">待执行任务</div>
          <div class="value">{{ stats.taskTodo }}</div>
          <div class="sub">我的任务（未完成）</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div
          class="staff-stat-card"
          style="background: linear-gradient(135deg, #ea580c, #f97316)"
        >
          <div class="label">即将到时用药</div>
          <div class="value">{{ stats.medDue }}</div>
          <div class="sub">未来 2 小时</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div
          class="staff-stat-card"
          style="background: linear-gradient(135deg, #dc2626, #f87171)"
        >
          <div class="label">异常体征</div>
          <div class="value">{{ stats.vitalAbnormal }}</div>
          <div class="sub">需复测/上报</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div
          class="staff-stat-card"
          style="background: linear-gradient(135deg, #7c3aed, #a78bfa)"
        >
          <div class="label">未读交接班</div>
          <div class="value">{{ stats.handoverUnread }}</div>
          <div class="sub">今日记录</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <div class="staff-card">
          <div class="chart-title">快捷操作</div>
          <el-space wrap>
            <el-button type="primary" @click="go('/nurse/tasks')">
              去处理任务
            </el-button>
            <el-button type="success" @click="go('/nurse/vitals')">
              录入体征
            </el-button>
            <el-button type="warning" @click="go('/nurse/medications')">
              执行用药
            </el-button>
            <el-button type="info" @click="go('/nurse/handover')">
              查看交接班
            </el-button>
            <el-button type="danger" @click="go('/nurse/incidents')">
              事件上报
            </el-button>
          </el-space>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { getNurseDashboardStats } from "@/api/staffApi";

const router = useRouter();
const stats = reactive({
  taskTodo: 0,
  medDue: 0,
  vitalAbnormal: 0,
  handoverUnread: 0,
});

function go(path) {
  router.push(path);
}

onMounted(async () => {
  const d = await getNurseDashboardStats();
  Object.assign(stats, d);
});
</script>

<style scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.stat-row {
  margin-bottom: 8px;
}

.chart-title {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 15px;
}
</style>
