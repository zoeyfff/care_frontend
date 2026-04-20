<template>
  <div class="dashboard">
    <h1 class="staff-page-title">工作台</h1>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <div
          class="staff-stat-card"
          style="background: linear-gradient(135deg, #0d9488, #14b8a6)"
        >
          <div class="label">在院长者</div>
          <div class="value">{{ stats.elderTotal }}</div>
          <div class="sub">含试住与短期托养</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div
          class="staff-stat-card"
          style="background: linear-gradient(135deg, #ea580c, #f97316)"
        >
          <div class="label">床位入住率</div>
          <div class="value">{{ stats.bedRate }}%</div>
          <div class="sub">
            {{ stats.bedOccupied }}/{{ stats.bedTotal }} 已占用 · 可用房间
            {{ stats.roomAvailable }}
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div
          class="staff-stat-card"
          style="background: linear-gradient(135deg, #7c3aed, #a78bfa)"
        >
          <div class="label">待完成护理任务</div>
          <div class="value">{{ stats.taskPending }}</div>
          <div class="sub">今日排班</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div
          class="staff-stat-card"
          style="background: linear-gradient(135deg, #dc2626, #f87171)"
        >
          <div class="label">未结清账单（户数）</div>
          <div class="value">{{ stats.unpaidBills }}</div>
          <div class="sub">请关注欠费跟进</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <div class="staff-card chart-card">
          <div class="chart-title">护理等级分布</div>
          <v-chart class="chart" :option="pieOption" autoresize />
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="staff-card chart-card">
          <div class="chart-title">男女比例</div>
          <v-chart class="chart" :option="genderOption" autoresize />
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="staff-card chart-card">
          <div class="chart-title">年龄层分布</div>
          <v-chart class="chart" :option="ageOption" autoresize />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="24">
        <div class="staff-card chart-card">
          <div class="chart-title">住院人数趋势</div>
          <v-chart class="chart" :option="lineOption" autoresize />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="24">
        <div class="staff-card">
          <div class="chart-title">今日工作提醒</div>
          <el-timeline>
            <el-timeline-item type="primary" timestamp="08:30" placement="top">
              完成特级护理区晨间体征批量录入
            </el-timeline-item>
            <el-timeline-item type="warning" timestamp="10:00" placement="top">
              3 位长者用药时间临近，请核对执行记录
            </el-timeline-item>
            <el-timeline-item type="success" timestamp="14:00" placement="top">
              家属探访预约：B 区 2 人，请前台登记
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed } from "vue";
import { getDashboardStats } from "@/api/staffApi";

const stats = reactive({
  elderTotal: 0,
  bedRate: 0,
  bedTotal: 0,
  bedOccupied: 0,
  roomAvailable: 0,
  taskPending: 0,
  unpaidBills: 0,
  careLevelDist: [],
  genderDist: [],
  ageDist: [],
  trendLabels: [],
  trendInpatient: [],
});

const pieOption = computed(() => ({
  tooltip: { trigger: "item" },
  legend: { bottom: 0 },
  color: ["#0d9488", "#14b8a6", "#5eead4", "#99f6e4"],
  series: [
    {
      type: "pie",
      radius: ["42%", "68%"],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
      label: { formatter: "{b}\n{d}%" },
      data: stats.careLevelDist,
    },
  ],
}));

const genderOption = computed(() => ({
  tooltip: { trigger: "item" },
  legend: { bottom: 0 },
  color: ["#0d9488", "#14b8a6"],
  series: [
    {
      type: "pie",
      radius: ["42%", "68%"],
      itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
      label: { formatter: "{b}\n{c}人" },
      data: stats.genderDist,
    },
  ],
}));

const ageOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  xAxis: { type: "category", data: (stats.ageDist || []).map((x) => x.name) },
  yAxis: { type: "value" },
  series: [
    {
      type: "bar",
      data: (stats.ageDist || []).map((x) => x.value),
      itemStyle: { color: "#0d9488", borderRadius: [6, 6, 0, 0] },
      barWidth: 26,
    },
  ],
}));

const lineOption = computed(() => ({
  tooltip: { trigger: "axis" },
  legend: { data: ["住院人数"], bottom: 0 },
  grid: { left: "3%", right: "4%", bottom: "14%", containLabel: true },
  xAxis: { type: "category", boundaryGap: false, data: stats.trendLabels },
  yAxis: { type: "value", name: "人数（人）" },
  series: [
    {
      name: "住院人数",
      type: "line",
      smooth: true,
      areaStyle: { opacity: 0.12 },
      itemStyle: { color: "#0d9488" },
      data: stats.trendInpatient,
    },
  ],
}));

onMounted(async () => {
  const d = await getDashboardStats();
  Object.assign(stats, d);
});
</script>

<style lang="scss" scoped>
.dashboard {
  .sub {
    margin: -8px 0 20px;
    color: var(--staff-muted);
    font-size: 14px;
  }
}

.stat-row {
  margin-bottom: 8px;
}

.chart-card {
  min-height: 360px;
}

.chart-title {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 15px;
}

.chart {
  height: 300px;
  width: 100%;
}
</style>
