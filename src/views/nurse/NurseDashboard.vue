<template>
  <div class="nurse-dashboard">

    <!-- 顶部 Header -->
    <div class="dash-header">
      <div class="header-left">
        <div class="greeting-block">
          <div class="greeting-time">{{ greeting }}</div>
          <h1 class="greeting-name">护士 {{ nurseName }}，{{ greetingMsg }}</h1>
        </div>
        <div class="header-date">
          <div class="date-main">{{ todayStr }}</div>
          <div class="date-week">{{ weekDay }}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="weather-chip">
          <span class="weather-icon">☀️</span>
          <span>晴 26°C</span>
        </div>
        <el-tag type="success" size="large" effect="dark" round>
          <el-icon style="margin-right: 4px"><CircleCheckFilled /></el-icon>
          白班在线
        </el-tag>
      </div>
    </div>

    <!-- 第一行：核心指标卡片 -->
    <el-row :gutter="14" class="stat-row-1">
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="stat-card stat-teal" @click="go('/nurse/tasks')">
          <div class="stat-icon">
            <el-icon><List /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.taskTodo }}</div>
            <div class="stat-label">待执行任务</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: taskProgress + '%' }" />
            </div>
            <div class="progress-text">今日完成 {{ stats.taskDone }} 项</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="stat-card stat-orange" @click="go('/nurse/medications')">
          <div class="stat-icon">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.medDue }}</div>
            <div class="stat-label">待执行用药</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill progress-orange" :style="{ width: medProgress + '%' }" />
            </div>
            <div class="progress-text">已执行 {{ stats.medDone }} 项</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="stat-card stat-red" @click="go('/nurse/vitals')">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.vitalAbnormal }}</div>
            <div class="stat-label">异常体征</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill progress-red" />
            </div>
            <div class="progress-text">今日记录 {{ stats.vitalRecorded }} 条</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="stat-card stat-purple" @click="go('/nurse/incidents')">
          <div class="stat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.incidentPending }}</div>
            <div class="stat-label">待处理事件</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar progress-red" />
            <div class="progress-text">需及时处理</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="stat-card stat-blue">
          <div class="stat-icon">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.handoverUnread }}</div>
            <div class="stat-label">未读交接班</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar progress-blue" />
            <div class="progress-text">查看今日记录</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="stat-card stat-green">
          <div class="stat-icon">
            <el-icon><UserPlus /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.newCheckins }}</div>
            <div class="stat-label">今日新增入住</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar progress-green" />
            <div class="progress-text">最新入住登记</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第二行：快捷操作 + 今日任务进度 -->
    <el-row :gutter="14" class="main-row">
      <!-- 快捷操作 -->
      <el-col :xs="24" :lg="8">
        <div class="dash-card quick-actions">
          <div class="card-header">
            <span class="card-title">快捷操作</span>
          </div>
          <div class="action-grid">
            <div class="action-item" @click="go('/nurse/tasks')">
              <div class="action-icon" style="background: rgba(13,148,136,0.1); color: #0d9488">
                <el-icon><List /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-name">护理任务</div>
                <div class="action-sub">{{ stats.taskTodo }} 项待执行</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
            <div class="action-item" @click="go('/nurse/vitals')">
              <div class="action-icon" style="background: rgba(245,158,11,0.1); color: #d97706">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-name">录入体征</div>
                <div class="action-sub">体温 / 血压 / 脉搏</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
            <div class="action-item" @click="go('/nurse/medications')">
              <div class="action-icon" style="background: rgba(124,58,237,0.1); color: #7c3aed">
                <el-icon><Plus /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-name">执行用药</div>
                <div class="action-sub">{{ stats.medDue }} 项待发药</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
            <div class="action-item" @click="go('/nurse/handover')">
              <div class="action-icon" style="background: rgba(14,116,144,0.1); color: #0e7490">
                <el-icon><Tickets /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-name">交接班</div>
                <div class="action-sub">{{ stats.handoverUnread }} 条未读</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
            <div class="action-item" @click="go('/nurse/incidents')">
              <div class="action-icon" style="background: rgba(220,38,38,0.1); color: #dc2626">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-name">事件上报</div>
                <div class="action-sub">{{ stats.incidentPending }} 项待处理</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
            <div class="action-item" @click="go('/nurse/health-records')">
              <div class="action-icon" style="background: rgba(20,184,166,0.1); color: #14b8a6">
                <el-icon><Document /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-name">健康记录</div>
                <div class="action-sub">查看历史数据</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 今日任务进度 -->
      <el-col :xs="24" :lg="16">
        <div class="dash-card progress-section">
          <div class="card-header">
            <span class="card-title">今日工作进度</span>
            <span class="card-badge">实时更新</span>
          </div>
          <div class="progress-list">
            <div class="progress-item">
              <div class="progress-item-left">
                <div class="progress-icon teal">
                  <el-icon><List /></el-icon>
                </div>
                <div>
                  <div class="progress-name">护理任务</div>
                  <div class="progress-sub">执行护理计划中的各项任务</div>
                </div>
              </div>
              <div class="progress-item-right">
                <div class="progress-nums">
                  <span class="num-done">{{ stats.taskDone }}</span>
                  <span class="num-sep">/</span>
                  <span class="num-total">{{ stats.taskTodo + stats.taskDone }}</span>
                </div>
                <el-progress
                  type="circle"
                  :percentage="taskProgress"
                  :width="52"
                  :stroke-width="5"
                  color="#0d9488"
                >
                  <template #default>
                    <span class="circle-pct">{{ taskProgress }}%</span>
                  </template>
                </el-progress>
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-item-left">
                <div class="progress-icon orange">
                  <el-icon><Plus /></el-icon>
                </div>
                <div>
                  <div class="progress-name">用药执行</div>
                  <div class="progress-sub">按时发放口服药及外用药</div>
                </div>
              </div>
              <div class="progress-item-right">
                <div class="progress-nums">
                  <span class="num-done">{{ stats.medDone }}</span>
                  <span class="num-sep">/</span>
                  <span class="num-total">{{ stats.medDue + stats.medDone }}</span>
                </div>
                <el-progress
                  type="circle"
                  :percentage="medProgress"
                  :width="52"
                  :stroke-width="5"
                  color="#f97316"
                >
                  <template #default>
                    <span class="circle-pct">{{ medProgress }}%</span>
                  </template>
                </el-progress>
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-item-left">
                <div class="progress-icon red">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div>
                  <div class="progress-name">体征监测</div>
                  <div class="progress-sub">记录体温、血压、脉搏等体征数据</div>
                </div>
              </div>
              <div class="progress-item-right">
                <div class="progress-nums">
                  <span class="num-done">{{ stats.vitalRecorded - stats.vitalAbnormal }}</span>
                  <span class="num-sep">/</span>
                  <span class="num-total">{{ stats.vitalRecorded }}</span>
                </div>
                <el-progress
                  type="circle"
                  :percentage="vitalProgress"
                  :width="52"
                  :stroke-width="5"
                  :color="stats.vitalAbnormal > 0 ? '#dc2626' : '#22c55e'"
                >
                  <template #default>
                    <span class="circle-pct">{{ vitalProgress }}%</span>
                  </template>
                </el-progress>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第三行：预警提示 + 今日备忘 -->
    <el-row :gutter="14" class="alert-row">
      <el-col :xs="24" :lg="12">
        <div class="dash-card alert-card">
          <div class="card-header">
            <span class="card-title">
              <el-icon style="color: #dc2626; margin-right: 6px"><WarningFilled /></el-icon>
              紧急待办
            </span>
            <span class="alert-count" v-if="urgentItems.length > 0">{{ urgentItems.length }} 项</span>
          </div>
          <div v-if="urgentItems.length === 0" class="empty-tip">
            <el-icon style="font-size: 32px; color: #d1d5db; margin-bottom: 8px"><CircleCheck /></el-icon>
            <div>暂无紧急事项，一切顺利</div>
          </div>
          <div v-else class="urgent-list">
            <div v-for="item in urgentItems" :key="item.id" class="urgent-item">
              <div class="urgent-dot" :class="item.level" />
              <div class="urgent-body">
                <div class="urgent-title">{{ item.title }}</div>
                <div class="urgent-meta">{{ item.meta }}</div>
              </div>
              <el-tag size="small" :type="item.tagType" effect="light">{{ item.tag }}</el-tag>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="dash-card memo-card">
          <div class="card-header">
            <span class="card-title">今日备忘</span>
            <el-button text type="primary" size="small" @click="addMemoVisible = true">
              <el-icon style="margin-right: 4px"><Plus /></el-icon> 添加
            </el-button>
          </div>
          <div v-if="memos.length === 0" class="empty-tip">
            <el-icon style="font-size: 32px; color: #d1d5db; margin-bottom: 8px"><Memo /></el-icon>
            <div>暂无备忘，记录今日工作要点</div>
          </div>
          <div v-else class="memo-list">
            <div v-for="(m, i) in memos" :key="i" class="memo-item">
              <div class="memo-time">{{ m.time }}</div>
              <div class="memo-text">{{ m.text }}</div>
              <el-icon class="memo-del" @click="memos.splice(i, 1)"><Close /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 添加备忘弹窗 -->
    <el-dialog v-model="addMemoVisible" title="添加今日备忘" width="400px" destroy-on-close>
      <el-form @submit.prevent="addMemo">
        <el-form-item label="备忘内容">
          <el-input v-model="memoInput" type="textarea" :rows="3" placeholder="记录待办事项、注意事项等..." maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addMemoVisible = false">取消</el-button>
        <el-button type="primary" @click="addMemo">保存</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import {
  List, TrendCharts, Warning, WarningFilled,
  Tickets, UserPlus, ArrowRight, CircleCheck, CircleCheckFilled,
  Document, Plus, Memo, Close,
} from "@element-plus/icons-vue";
import { getNurseDashboardStats } from "@/api/staffApi";

const router = useRouter();
const store = useStore();

const nurseName = computed(() => store.state.user?.realName || "护理员");

const stats = reactive({
  taskTodo: 0, taskDone: 0,
  medDue: 0, medDone: 0,
  vitalRecorded: 0, vitalAbnormal: 0,
  incidentPending: 0, handoverUnread: 0, newCheckins: 0,
});

// 时间相关
const now = new Date();
const hour = now.getHours();
const greeting = computed(() => {
  if (hour < 6) return "凌晨好";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
});
const greetingMsg = computed(() => {
  if (stats.taskTodo + stats.medDue > 5) return "今日工作较忙，加油！";
  if (stats.incidentPending > 0) return "有紧急事件待处理！";
  return "准备开始一天的工作";
});

const todayStr = computed(() => now.toLocaleDateString("zh-CN", { month: "long", day: "numeric", year: "numeric" }));
const weekDay = computed(() => ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][now.getDay()]);

// 进度计算
const taskProgress = computed(() => {
  const total = stats.taskTodo + stats.taskDone;
  return total === 0 ? 0 : Math.round((stats.taskDone / total) * 100);
});
const medProgress = computed(() => {
  const total = stats.medDue + stats.medDone;
  return total === 0 ? 0 : Math.round((stats.medDone / total) * 100);
});
const vitalProgress = computed(() => {
  if (stats.vitalRecorded === 0) return 0;
  return Math.round(((stats.vitalRecorded - stats.vitalAbnormal) / stats.vitalRecorded) * 100);
});

// 紧急待办列表
const urgentItems = computed(() => {
  const items = [];
  if (stats.taskTodo > 0) {
    items.push({ id: 1, title: `您有 ${stats.taskTodo} 项护理任务待执行`, meta: "请尽快前往处理", tag: "任务", tagType: "warning", level: "warn" });
  }
  if (stats.medDue > 0) {
    items.push({ id: 2, title: `您有 ${stats.medDue} 项用药待执行`, meta: "请按时发药", tag: "用药", tagType: "danger", level: "warn" });
  }
  if (stats.vitalAbnormal > 0) {
    items.push({ id: 3, title: `今日 ${stats.vitalAbnormal} 条体征数据异常`, meta: "请及时复测并上报", tag: "异常", tagType: "danger", level: "danger" });
  }
  if (stats.incidentPending > 0) {
    items.push({ id: 4, title: `您有 ${stats.incidentPending} 项事件待处理`, meta: "请尽快核实处理", tag: "事件", tagType: "danger", level: "danger" });
  }
  return items;
});

// 备忘录
const addMemoVisible = ref(false);
const memoInput = ref("");
const memos = ref([
  { time: "08:00", text: "A区 203 室王奶奶需协助如厕" },
  { time: "09:30", text: "B区 105 室李爷爷测量血压" },
  { time: "14:00", text: "下午交接班注意说明2床患者用药变化" },
]);

function addMemo() {
  if (!memoInput.value.trim()) return;
  const time = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  memos.value.unshift({ time, text: memoInput.value.trim() });
  memoInput.value = "";
  addMemoVisible.value = false;
  ElMessage.success("备忘已添加");
}

function go(path) {
  router.push(path);
}

onMounted(async () => {
  try {
    const d = await getNurseDashboardStats();
    Object.assign(stats, d);
  } catch {
    // 用 mock 数据兜底
  }
});
</script>

<style lang="scss" scoped>
.nurse-dashboard {
  padding: 0 0 24px;
}

// ========== Header ==========
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  border-radius: 16px;
  padding: 20px 28px;
  color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.greeting-time {
  font-size: 12px;
  opacity: 0.75;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.greeting-name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-date {
  text-align: center;
  background: rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 10px 20px;
}

.date-main {
  font-size: 15px;
  font-weight: 600;
}

.date-week {
  font-size: 12px;
  opacity: 0.75;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weather-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
}

.weather-icon {
  font-size: 16px;
}

// ========== 指标卡片 ==========
.stat-row-1 {
  margin-bottom: 14px;
}

.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 16px 14px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
}

.stat-teal .stat-icon { background: linear-gradient(135deg, #0d9488, #14b8a6); }
.stat-orange .stat-icon { background: linear-gradient(135deg, #ea580c, #f97316); }
.stat-red .stat-icon { background: linear-gradient(135deg, #dc2626, #f87171); }
.stat-purple .stat-icon { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.stat-blue .stat-icon { background: linear-gradient(135deg, #0e7490, #06b6d4); }
.stat-green .stat-icon { background: linear-gradient(135deg, #16a34a, #4ade80); }

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--el-text-color-primary, #1e293b);
  line-height: 1;
  margin-bottom: 3px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary, #64748b);
  font-weight: 500;
}

.progress-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #0d9488, #14b8a6);
  transition: width 0.6s ease;
}

.progress-orange { background: linear-gradient(90deg, #ea580c, #f97316); }
.progress-red { background: linear-gradient(90deg, #dc2626, #f87171); }
.progress-blue { background: linear-gradient(90deg, #0e7490, #06b6d4); }
.progress-green { background: linear-gradient(90deg, #16a34a, #4ade80); }

.progress-text {
  font-size: 11px;
  color: var(--el-text-color-secondary, #94a3b8);
}

// ========== 主内容区 ==========
.main-row {
  margin-bottom: 14px;
}

.dash-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
  margin-bottom: 14px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.card-badge {
  font-size: 11px;
  color: #0d9488;
  background: rgba(13,148,136,0.08);
  border: 1px solid rgba(13,148,136,0.15);
  border-radius: 20px;
  padding: 3px 10px;
  font-weight: 600;
}

// 快捷操作
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0fdf9;
    border-color: rgba(13,148,136,0.2);
    transform: translateX(2px);
  }
}

.action-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.action-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.action-sub {
  font-size: 11px;
  color: #94a3b8;
}

.action-arrow {
  margin-left: auto;
  color: #cbd5e1;
  font-size: 14px;
  flex-shrink: 0;
}

// 进度列表
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.progress-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
  &.teal { background: linear-gradient(135deg, #0d9488, #14b8a6); }
  &.orange { background: linear-gradient(135deg, #ea580c, #f97316); }
  &.red { background: linear-gradient(135deg, #dc2626, #f87171); }
}

.progress-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 3px;
}

.progress-sub {
  font-size: 12px;
  color: #94a3b8;
}

.progress-item-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.progress-nums {
  font-size: 14px;
  font-weight: 700;
}

.num-done { color: #0d9488; }
.num-sep { color: #cbd5e1; margin: 0 2px; }
.num-total { color: #64748b; }

.circle-pct {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
}

// ========== 紧急 + 备忘 ==========
.alert-row {
  margin-bottom: 14px;
}

.alert-count {
  font-size: 12px;
  font-weight: 700;
  color: #dc2626;
  background: rgba(220,38,38,0.08);
  border-radius: 20px;
  padding: 3px 10px;
}

.empty-tip {
  text-align: center;
  padding: 32px 0;
  color: #94a3b8;
  font-size: 13px;
}

.urgent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.urgent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff5f5;
  border: 1px solid rgba(220,38,38,0.1);
}

.urgent-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  &.warn { background: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
  &.danger { background: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15); animation: blink 2s ease-in-out infinite; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.urgent-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.urgent-meta {
  font-size: 11px;
  color: #94a3b8;
}

.memo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.memo-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f0fdf9;
  border: 1px solid rgba(13,148,136,0.1);
  position: relative;
}

.memo-time {
  font-size: 11px;
  font-weight: 700;
  color: #0d9488;
  background: rgba(13,148,136,0.08);
  border-radius: 6px;
  padding: 2px 8px;
  flex-shrink: 0;
  margin-top: 1px;
}

.memo-text {
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
  flex: 1;
}

.memo-del {
  color: #cbd5e1;
  cursor: pointer;
  font-size: 13px;
  flex-shrink: 0;
  margin-top: 2px;
  transition: color 0.2s;
  &:hover { color: #dc2626; }
}
</style>
