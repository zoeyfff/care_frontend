<template>
  <div>
    <h1 class="staff-page-title">长者健康详情</h1>
    <p class="sub">查看关联长者的健康信息、体征记录与用药情况</p>

    <!-- 长者基本信息 -->
    <div class="staff-card" style="margin-bottom: 16px">
      <el-row :gutter="16" align="middle">
        <el-col :span="4">
          <el-avatar :size="64" style="background: #7c3aed; font-size: 26px">
            {{ elderInfo.name?.slice(0, 1) }}
          </el-avatar>
        </el-col>
        <el-col :span="20">
          <div class="elder-info-grid">
            <div class="info-item">
              <span class="info-label">姓名</span>
              <span class="info-value">{{ elderInfo.name || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">性别</span>
              <span class="info-value">{{ elderInfo.gender || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">护理等级</span>
              <el-tag size="small">{{
                elderInfo.care_level || "未评级"
              }}</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">房间</span>
              <span class="info-value">{{ elderInfo.room_no || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">床位</span>
              <span class="info-value">{{ elderInfo.bed_no || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">入住日期</span>
              <span class="info-value">{{
                elderInfo.checkin_date || "-"
              }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-tabs v-model="tab" type="border-card" class="staff-card tabs-wrap">
      <!-- 体征记录 -->
      <el-tab-pane label="体征记录" name="vitals">
        <div class="staff-toolbar">
          <el-button @click="loadVitals">刷新</el-button>
          <el-date-picker
            v-model="vitalRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px; margin-left: auto"
            @change="loadVitals"
          />
        </div>

        <!-- 体征趋势图 -->
        <div v-if="vitalChartData.length" class="chart-block">
          <div class="chart-header">
            <span class="chart-title">体温趋势</span>
          </div>
          <v-chart class="chart-lg" :option="tempChartOption" autoresize />
        </div>

        <!-- 体征列表 -->
        <el-table
          :data="vitals"
          stripe
          border
          v-loading="loadingVitals"
          max-height="320"
          style="margin-top: 16px"
        >
          <el-table-column prop="record_time" label="测量时间" width="170" />
          <el-table-column prop="temperature" label="体温℃" width="100">
            <template #default="{ row }">
              <span :class="row.temperature > 37.3 ? 'val-danger' : 'val-ok'">
                {{ row.temperature }}℃
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="blood_pressure" label="血压" width="120" />
          <el-table-column prop="heart_rate" label="心率" width="100" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag
                :type="row.abnormal_flag ? 'danger' : 'success'"
                size="small"
              >
                {{ row.abnormal_flag ? "异常" : "正常" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="follow_up_action"
            label="处理措施"
            min-width="160"
            show-overflow-tooltip
          />
        </el-table>
        <el-empty
          v-if="!vitals.length && !loadingVitals"
          description="暂无体征记录"
          :image-size="60"
        />
      </el-tab-pane>

      <!-- 用药记录 -->
      <el-tab-pane label="用药记录" name="meds">
        <div class="staff-toolbar">
          <el-button @click="loadMeds">刷新</el-button>
        </div>
        <el-table
          :data="meds"
          stripe
          border
          v-loading="loadingMeds"
          max-height="320"
        >
          <el-table-column
            prop="medicine_name"
            label="药品名称"
            min-width="160"
          />
          <el-table-column prop="dosage" label="剂量" width="140" />
          <el-table-column prop="take_time" label="用药时间" width="170" />
          <el-table-column label="执行状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">
                {{ statusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="备注"
            min-width="140"
            show-overflow-tooltip
          />
        </el-table>
        <el-empty
          v-if="!meds.length && !loadingMeds"
          description="暂无用药记录"
          :image-size="60"
        />
      </el-tab-pane>

      <!-- 健康报告 -->
      <el-tab-pane label="健康报告" name="report">
        <div class="staff-toolbar">
          <el-button type="primary" @click="generateReport"
            >生成健康报告</el-button
          >
          <el-button @click="loadReport">刷新</el-button>
        </div>
        <div v-if="reportText" class="report-box">
          <pre class="report-content">{{ reportText }}</pre>
        </div>
        <el-empty
          v-else
          description="暂无健康报告，请点击「生成健康报告」"
          :image-size="60"
        />
      </el-tab-pane>
    </el-tabs>
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
  getMyLinkedElders,
  getElderHealthRecords,
  getElderMedicationRecords,
} from "@/api/staffApi";

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
]);

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

const tempChartOption = computed(() => {
  const sorted = [...vitals.value].sort((a, b) =>
    String(a.record_time || "").localeCompare(String(b.record_time || ""))
  );
  return {
    tooltip: { trigger: "axis" },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "10%",
      top: "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: sorted.map((v) => v.record_time?.slice(5, 10) || ""),
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 35,
      max: 42,
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: "line",
        smooth: true,
        data: sorted.map((v) => v.temperature),
        itemStyle: { color: "#7c3aed" },
        areaStyle: { opacity: 0.1 },
        markLine: {
          silent: true,
          data: [
            {
              yAxis: 37.3,
              lineStyle: { color: "#f56c6c", type: "dashed", width: 1 },
            },
          ],
        },
      },
    ],
  };
});

const vitalChartData = computed(() => vitals.value);

function statusLabel(status) {
  return (
    { 0: "待执行", 1: "已执行", 2: "已确认", 3: "已拒绝" }[Number(status)] ||
    "未知"
  );
}

function statusTagType(status) {
  return (
    { 0: "warning", 1: "info", 2: "success", 3: "danger" }[Number(status)] ||
    "info"
  );
}

async function loadVitals() {
  if (!elderInfo.value.id) return;
  loadingVitals.value = true;
  try {
    const params = { elder_id: elderInfo.value.id };
    if (vitalRange.value && vitalRange.value.length === 2) {
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
    const res = await getElderMedicationRecords({
      elder_id: elderInfo.value.id,
    });
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
  const avgTemp =
    vitals.value.reduce((s, v) => s + (Number(v.temperature) || 0), 0) /
    (vitals.value.length || 1);
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
${
  abnormalCount > 0
    ? "近期体征存在异常记录，建议持续关注并与护理人员保持沟通。"
    : "近期体征数据整体正常，继续保持良好护理。"
}
`;
  reportText.value = report;
  ElMessage.success("健康报告已生成");
}

async function loadReport() {
  // no-op, report is generated client-side
}

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
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.tabs-wrap {
  padding: 0;
  border-radius: var(--staff-radius);
  overflow: hidden;
  box-shadow: var(--staff-card-shadow);
}

.elder-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  color: var(--staff-muted);
  white-space: nowrap;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--staff-text);
}

.staff-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.chart-block {
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.chart-title {
  font-weight: 600;
  font-size: 15px;
}

.chart-lg {
  height: 220px;
  width: 100%;
}

.val-ok {
  color: #16a34a;
  font-weight: 600;
}

.val-danger {
  color: #dc2626;
  font-weight: 600;
}

.report-box {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
}

.report-content {
  font-size: 13px;
  color: var(--staff-text);
  line-height: 1.8;
  white-space: pre-wrap;
  margin: 0;
  font-family: inherit;
}
</style>
