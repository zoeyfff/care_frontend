<template>
  <div class="family-page">

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><User /></el-icon>
        </div>
        <div>
          <h1 class="page-title">长者健康详情</h1>
          <p class="page-desc">查看关联长者的健康信息、体征记录与用药情况</p>
        </div>
      </div>
    </div>

    <!-- 长者信息卡 -->
    <div class="elder-info-card">
      <div class="elder-avatar-lg">{{ elderInfo.name?.[0] || '?' }}</div>
      <div class="elder-details">
        <div class="elder-name-row">
          <div class="elder-name">{{ elderInfo.name || '—' }}</div>
          <el-tag :type="elderInfo.checkinStatus === 1 ? 'success' : 'info'" effect="light" size="small" round>
            {{ elderInfo.checkinStatus === 1 ? '在住' : '离院' }}
          </el-tag>
        </div>
        <div class="elder-tags-row">
          <el-tag size="small" type="info" effect="plain">{{ elderInfo.gender || '—' }}</el-tag>
          <el-tag size="small" type="info" effect="plain">{{ elderInfo.care_level || '未评级' }}</el-tag>
          <el-tag size="small" type="info" effect="plain">
            <el-icon style="margin-right: 3px"><HomeFilled /></el-icon>
            {{ elderInfo.room_no || '未分配' }}
          </el-tag>
          <el-tag size="small" type="info" effect="plain">
            入住 {{ elderInfo.checkin_date || '—' }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="content-card">
      <div class="tab-nav">
        <div
          v-for="t in tabs"
          :key="t.value"
          class="tab-item"
          :class="{ active: tab === t.value }"
          @click="switchTab(t.value)"
        >
          <el-icon><component :is="t.icon" /></el-icon>
          {{ t.label }}
        </div>
      </div>

      <!-- 体征记录 -->
      <div v-if="tab === 'vitals'" class="tab-content">
        <div class="tab-toolbar">
          <el-button @click="loadVitals">
            <el-icon style="margin-right: 4px"><Refresh /></el-icon>
            刷新
          </el-button>
          <el-date-picker
            v-model="vitalRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            size="large"
            style="width: 280px"
            @change="loadVitals"
          />
        </div>

        <!-- 体温趋势图 -->
        <div v-if="vitalChartData.length" class="chart-block">
          <div class="chart-header">
            <span class="chart-title">体温趋势</span>
            <span class="chart-hint">超过 37.3℃ 标注为异常线</span>
          </div>
          <v-chart class="chart" :option="tempChartOption" autoresize />
        </div>

        <!-- 体征列表 -->
        <el-table :data="vitals" stripe v-loading="loadingVitals" max-height="340">
          <el-table-column prop="record_time" label="测量时间" width="170" />
          <el-table-column label="体温" width="100">
            <template #default="{ row }">
              <span :class="row.temperature > 37.3 ? 'val-danger' : 'val-ok'">
                {{ row.temperature }}℃
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="blood_pressure" label="血压" width="130" />
          <el-table-column prop="heart_rate" label="心率" width="100" />
          <el-table-column label="判定" width="90">
            <template #default="{ row }">
              <el-tag :type="row.abnormal_flag ? 'danger' : 'success'" effect="light" size="small" round>
                {{ row.abnormal_flag ? '异常' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="follow_up_action" label="处理措施" min-width="160" show-overflow-tooltip />
        </el-table>

        <div v-if="!vitals.length && !loadingVitals" class="empty-state">
          <div class="empty-icon"><el-icon><TrendCharts /></el-icon></div>
          <div class="empty-title">暂无体征记录</div>
        </div>
      </div>

      <!-- 用药记录 -->
      <div v-if="tab === 'meds'" class="tab-content">
        <div class="tab-toolbar">
          <el-button @click="loadMeds">
            <el-icon style="margin-right: 4px"><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        <el-table :data="meds" stripe v-loading="loadingMeds" max-height="340">
          <el-table-column prop="medicine_name" label="药品名称" min-width="160" />
          <el-table-column prop="dosage" label="剂量" width="130" />
          <el-table-column prop="take_time" label="用药时间" width="170" />
          <el-table-column label="执行状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" effect="light" size="small" round>
                {{ statusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        </el-table>

        <div v-if="!meds.length && !loadingMeds" class="empty-state">
          <div class="empty-icon"><el-icon><Medicine /></el-icon></div>
          <div class="empty-title">暂无用药记录</div>
        </div>
      </div>

      <!-- 健康报告 -->
      <div v-if="tab === 'report'" class="tab-content">
        <div class="tab-toolbar">
          <el-button type="primary" class="btn-generate" @click="generateReport">
            <el-icon style="margin-right: 4px"><Document /></el-icon>
            生成健康报告
          </el-button>
          <el-button @click="loadReport">
            <el-icon style="margin-right: 4px"><Refresh /></el-icon>
            刷新
          </el-button>
        </div>

        <div v-if="reportText" class="report-box">
          <pre class="report-content">{{ reportText }}</pre>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon"><el-icon><Document /></el-icon></div>
          <div class="empty-title">暂无健康报告</div>
          <div class="empty-desc">点击「生成健康报告」查看长者健康总结</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import {
  Document, HomeFilled, Medicine, Refresh,
  TrendCharts, User,
} from "@element-plus/icons-vue";
import {
  getMyLinkedElders,
  getElderHealthRecords,
  getElderMedicationRecords,
} from "@/api/staffApi";

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent]);

const route = useRoute();
const tab = ref("vitals");
const loadingVitals = ref(false);
const loadingMeds = ref(false);
const linkedElders = ref([]);
const elderInfo = ref({});
const vitals = ref([]);
const meds = ref([]);
const vitalRange = ref([]);
const reportText = ref("");

const tabs = [
  { value: "vitals", label: "体征记录", icon: "TrendCharts" },
  { value: "meds", label: "用药记录", icon: "Medicine" },
  { value: "report", label: "健康报告", icon: "Document" },
];

const vitalChartData = computed(() => vitals.value);

const tempChartOption = computed(() => {
  const sorted = [...vitals.value].sort((a, b) =>
    String(a.record_time || "").localeCompare(String(b.record_time || ""))
  );
  return {
    tooltip: { trigger: "axis" },
    grid: { left: "5%", right: "5%", bottom: "12%", top: "15%", containLabel: true },
    xAxis: {
      type: "category",
      data: sorted.map((v) => v.record_time?.slice(5, 10) || ""),
      axisLabel: { fontSize: 11, color: "#94a3b8" },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "value",
      min: 35,
      max: 42,
      axisLabel: { fontSize: 11, color: "#94a3b8" },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        data: sorted.map((v) => v.temperature),
        itemStyle: { color: "#f43f5e" },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(244,63,94,0.2)" }, { offset: 1, color: "rgba(244,63,94,0)" }] } },
        lineStyle: { width: 2 },
        markLine: {
          silent: true,
          symbol: "none",
          data: [{ yAxis: 37.3, lineStyle: { color: "#f97316", type: "dashed", width: 1.5 }, label: { formatter: "异常线 37.3℃", fontSize: 10, color: "#f97316" } }],
        },
      },
    ],
  };
});

function statusLabel(status) {
  return { 0: "待执行", 1: "已执行", 2: "已确认", 3: "已拒绝" }[Number(status)] || "未知";
}

function statusTagType(status) {
  return { 0: "warning", 1: "info", 2: "success", 3: "danger" }[Number(status)] || "info";
}

function switchTab(t) {
  tab.value = t;
}

async function loadVitals() {
  if (!elderInfo.value.id) return;
  loadingVitals.value = true;
  try {
    const params = { elder_id: elderInfo.value.id };
    if (vitalRange.value?.length === 2) {
      params.start_time = vitalRange.value[0] + " 00:00:00";
      params.end_time = vitalRange.value[1] + " 23:59:59";
    }
    const res = await getElderHealthRecords(params);
    vitals.value = res.list || [];
  } finally {
    loadingVitals.value = false;
  }
}

async function loadMeds() {
  if (!elderInfo.value.id) return;
  loadingMeds.value = true;
  try {
    const res = await getElderMedicationRecords({ elder_id: elderInfo.value.id });
    meds.value = res.list || [];
  } finally {
    loadingMeds.value = false;
  }
}

function generateReport() {
  if (!vitals.value.length) {
    ElMessage.warning("请先加载体征记录");
    return;
  }
  const e = elderInfo.value;
  const now = new Date().toLocaleString("zh-CN");
  const abnormalCount = vitals.value.filter((v) => v.abnormal_flag).length;
  const avgTemp = vitals.value.reduce((s, v) => s + (Number(v.temperature) || 0), 0) / (vitals.value.length || 1);
  const latest = vitals.value[0];
  const report = `【健康报告】
长者姓名：${e.name || "-"}
生成时间：${now}
入住日期：${e.checkin_date || "-"}
护理等级：${e.care_level || "未评级"}
房间号：${e.room_no || "-"}

// 一、体征概览
记录总数：${vitals.value.length} 条
体温异常次数：${abnormalCount} 次
平均体温：${avgTemp.toFixed(1)}℃

// 二、最新体征（${latest?.record_time || "-"}）
  体温：${latest?.temperature || "-"}℃
  血压：${latest?.blood_pressure || "-"}
  心率：${latest?.heart_rate || "-"}
  判定：${latest?.abnormal_flag ? "异常" : "正常"}

// 三、用药情况
当前用药：${meds.value.length} 种
待执行：${meds.value.filter((m) => m.status === 0).length} 条
已完成：${meds.value.filter((m) => m.status >= 1).length} 条

// 四、健康建议
${abnormalCount > 0 ? "近期体征存在异常记录，建议持续关注并与护理人员保持沟通。" : "近期体征数据整体正常，继续保持良好护理。"}
`;
  reportText.value = report;
  ElMessage.success("健康报告已生成");
}

function loadReport() { /* client-side */ }

async function loadElderInfo() {
  const res = await getMyLinkedElders();
  linkedElders.value = res.list || [];
  const id = Number(route.query.elder_id);
  if (id) {
    elderInfo.value = linkedElders.value.find((e) => e.id === id) || {};
  } else {
    elderInfo.value = linkedElders.value[0] || {};
  }
}

watch(tab, (t) => {
  if (t === "vitals") loadVitals();
  if (t === "meds") loadMeds();
});

onMounted(async () => {
  await loadElderInfo();
  if (elderInfo.value.id) {
    loadVitals();
    loadMeds();
  }
});
</script>

<style lang="scss" scoped>
.family-page {
  padding-bottom: 24px;
}

// ========== 页面 Header ==========
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #be185d, #f43f5e);
  border-radius: 16px;
  padding: 22px 28px;
  color: #fff;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.page-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.page-desc {
  margin: 0;
  font-size: 13px;
  opacity: 0.75;
}

// ========== 长者信息卡 ==========
.elder-info-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  border-radius: 16px;
  padding: 20px 28px;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
  margin-bottom: 16px;
}

.elder-avatar-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #be185d, #f43f5e);
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.elder-details {
  flex: 1;
}

.elder-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.elder-name {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.elder-tags-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

// ========== 内容卡片 ==========
.content-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
  overflow: hidden;
}

// ========== Tab 导航 ==========
.tab-nav {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
  padding: 0 24px;
  gap: 4px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  margin-bottom: -1px;

  &:hover { color: #be185d; }

  &.active {
    color: #be185d;
    border-bottom-color: #f43f5e;
  }
}

// ========== Tab 内容 ==========
.tab-content {
  padding: 20px 24px;
}

.tab-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.chart-block {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.chart-hint {
  font-size: 12px;
  color: #94a3b8;
}

.chart {
  height: 220px;
  width: 100%;
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
}

.val-ok { color: #16a34a; font-weight: 600; }
.val-danger { color: #dc2626; font-weight: 600; }

.report-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px 24px;
  border: 1px solid #f1f5f9;
}

.report-content {
  font-size: 13px;
  color: #334155;
  line-height: 1.9;
  white-space: pre-wrap;
  margin: 0;
  font-family: inherit;
}

.btn-generate {
  background: linear-gradient(135deg, #be185d, #f43f5e);
  border: none;
  color: #fff;
  font-weight: 600;
  &:hover { background: linear-gradient(135deg, #9f1239, #be185d); }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 48px 0;
  color: #94a3b8;
}

.empty-icon {
  font-size: 44px;
  color: #d1d5db;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 13px;
  color: #9ca3af;
}
</style>
