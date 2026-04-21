<template>
  <div>
    <h1 class="staff-page-title">健康监测与医疗记录</h1>
    <p class="sub">体征数据、用药记录</p>

    <el-tabs v-model="tab" type="border-card" class="staff-card tabs-wrap">
      <!-- 体征记录 Tab -->
      <el-tab-pane label="体征记录" name="signs">
        <div class="staff-toolbar">
          <el-button type="primary" @click="openSign()">新增体征</el-button>
          <el-button @click="loadSigns">刷新</el-button>

          <!-- 搜索和筛选 -->
          <el-input
            v-model="signSearchKeyword"
            placeholder="搜索长者姓名"
            clearable
            style="width: 200px; margin-left: auto"
            prefix-icon="Search"
          />
        </div>

        <!-- 体征表格 -->
        <el-table
          :data="filteredSigns"
          stripe
          border
          v-loading="loadingSigns"
          max-height="300"
        >
          <el-table-column prop="elder_name" label="长者" width="100" />
          <el-table-column prop="temperature" label="体温 ℃" width="90">
            <template #default="{ row }">
              <span :class="getTemperatureClass(row.temperature)">
                {{ row.temperature }}℃
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="blood_pressure" label="血压" width="100" />
          <el-table-column prop="heart_rate" label="心率" width="80" />
          <el-table-column prop="record_time" label="测量时间" width="170" />
        </el-table>

        <!-- 体温趋势图网格 -->
        <div class="chart-block">
          <div class="chart-header">
            <span class="chart-title">各长者体温趋势（最近7次）</span>
            <el-tag type="info" size="small"
              >共 {{ tempTrendCards.length }} 位长者</el-tag
            >
          </div>
          <div v-if="tempTrendCards.length" class="trend-grid">
            <div
              v-for="item in tempTrendCards"
              :key="item.elderName"
              class="trend-card"
            >
              <div class="trend-card-title">
                <span>{{ item.elderName }}</span>
                <el-tag
                  :type="item.latestTemp > 37.3 ? 'danger' : 'success'"
                  size="small"
                >
                  {{ item.latestTemp }}℃
                </el-tag>
              </div>
              <v-chart class="chart-sm" :option="item.option" autoresize />
            </div>
          </div>
          <el-empty v-else description="暂无体温数据" :image-size="70" />
        </div>
      </el-tab-pane>

      <!-- 用药记录 Tab -->
      <el-tab-pane label="用药记录" name="med">
        <div class="staff-toolbar">
          <el-button type="primary" @click="openMed()">新增用药记录</el-button>
          <el-button @click="loadMeds">刷新</el-button>

          <!-- 搜索和筛选 -->
          <el-input
            v-model="medSearchKeyword"
            placeholder="搜索长者姓名或药品"
            clearable
            style="width: 220px; margin-left: auto"
            prefix-icon="Search"
          />
          <el-select
            v-model="selectedElderForMed"
            placeholder="筛选长者"
            clearable
            style="width: 160px; margin-left: 8px"
          >
            <el-option
              v-for="e in eldersWithMeds"
              :key="e.id"
              :label="e.name"
              :value="e.id"
            />
          </el-select>
        </div>

        <!-- 用药表格 -->
        <el-table
          :data="filteredMeds"
          stripe
          border
          v-loading="loadingMeds"
          max-height="300"
        >
          <el-table-column prop="elder_name" label="长者" width="100" />
          <el-table-column
            prop="medicine_name"
            label="药品名称"
            min-width="160"
          />
          <el-table-column prop="dosage" label="剂量与频次" width="140" />
          <el-table-column prop="take_time" label="用药时间" width="170">
            <template #default="{ row }">
              <span :class="isMedOverdue(row.take_time) ? 'text-danger' : ''">
                {{ row.take_time }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="备注"
            min-width="120"
            show-overflow-tooltip
          />
        </el-table>

        <!-- 用药情况汇总卡片 -->
        <div class="med-summary-block">
          <div class="chart-header">
            <span class="chart-title">当前用药情况汇总</span>
            <el-tag type="info" size="small"
              >共 {{ medSummaryCards.length }} 位长者</el-tag
            >
          </div>
          <div v-if="medSummaryCards.length" class="med-grid">
            <div
              v-for="card in medSummaryCards"
              :key="card.elderName"
              class="med-card"
            >
              <div class="med-card-header">
                <span class="med-card-title">{{ card.elderName }}</span>
                <el-badge :value="card.medicines.length" type="primary" />
              </div>
              <div class="med-list">
                <div
                  v-for="(med, idx) in card.medicines"
                  :key="idx"
                  class="med-item"
                >
                  <div class="med-info">
                    <span class="med-name">{{ med.medicine_name }}</span>
                    <span class="med-dosage">{{ med.dosage }}</span>
                  </div>
                  <div class="med-time">
                    <span>{{ formatTime(med.take_time) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无用药记录" :image-size="70" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增体征对话框 -->
    <el-dialog
      v-model="signDlg"
      title="录入体征"
      width="480px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item label="长者" required>
          <el-select v-model="signForm.elder_id" filterable style="width: 100%">
            <el-option
              v-for="e in elders"
              :key="e.id"
              :label="e.name"
              :value="e.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="体温">
          <el-input-number
            v-model="signForm.temperature"
            :min="35"
            :max="42"
            :step="0.1"
          />
        </el-form-item>
        <el-form-item label="血压">
          <el-input v-model="signForm.blood_pressure" placeholder="如 120/80" />
        </el-form-item>
        <el-form-item label="心率">
          <el-input-number v-model="signForm.heart_rate" :min="40" :max="200" />
        </el-form-item>
        <el-form-item label="测量时间">
          <el-date-picker
            v-model="signForm.record_time"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="signDlg = false">取消</el-button>
        <el-button type="primary" @click="saveSign">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增用药对话框 -->
    <el-dialog v-model="medDlg" title="用药记录" width="480px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="长者" required>
          <el-select v-model="medForm.elder_id" filterable style="width: 100%">
            <el-option
              v-for="e in elders"
              :key="e.id"
              :label="e.name"
              :value="e.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="药品名称" required>
          <el-input v-model="medForm.medicine_name" />
        </el-form-item>
        <el-form-item label="剂量">
          <el-input v-model="medForm.dosage" />
        </el-form-item>
        <el-form-item label="用药时间">
          <el-date-picker
            v-model="medForm.take_time"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="medForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="medDlg = false">取消</el-button>
        <el-button type="primary" @click="saveMed">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getHealthRecords,
  saveHealthRecord,
  getMedicationRecords,
  saveMedicationRecord,
  getElderList,
} from "@/api/staffApi";

const tab = ref("signs");
const loadingSigns = ref(false);
const loadingMeds = ref(false);
const signs = ref([]);
const meds = ref([]);
const elders = ref([]);
const signDlg = ref(false);
const medDlg = ref(false);
const signSearchKeyword = ref("");
const medSearchKeyword = ref("");
const selectedElderForMed = ref(null);

const signForm = reactive({
  elder_id: null,
  temperature: 36.5,
  blood_pressure: "",
  heart_rate: 72,
  record_time: "",
});

const medForm = reactive({
  elder_id: null,
  medicine_name: "",
  dosage: "",
  take_time: "",
  remark: "",
});

// 过滤后的体征列表
const filteredSigns = computed(() => {
  if (!signSearchKeyword.value) return signs.value;
  return signs.value.filter((s) =>
    s.elder_name?.includes(signSearchKeyword.value)
  );
});

// 有用药记录的长者列表
const eldersWithMeds = computed(() => {
  const elderIds = [...new Set(meds.value.map((m) => m.elder_id))];
  return elders.value.filter((e) => elderIds.includes(e.id));
});

// 过滤后的用药列表
const filteredMeds = computed(() => {
  let result = meds.value;

  if (selectedElderForMed.value) {
    result = result.filter((m) => m.elder_id === selectedElderForMed.value);
  }

  if (medSearchKeyword.value) {
    const keyword = medSearchKeyword.value.toLowerCase();
    result = result.filter(
      (m) =>
        m.elder_name?.toLowerCase().includes(keyword) ||
        m.medicine_name?.toLowerCase().includes(keyword)
    );
  }

  return result;
});

// 体温趋势卡片数据
const tempTrendCards = computed(() => {
  const grouped = signs.value.reduce((acc, row) => {
    const key = row.elder_name || "未知长者";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([elderName, rows]) => {
      const sortedRows = [...rows].sort((a, b) =>
        String(a.record_time || "").localeCompare(String(b.record_time || ""))
      );
      const latestRows = sortedRows.slice(-7);
      const latestTemp = latestRows.length
        ? latestRows[latestRows.length - 1].temperature
        : 0;

      return {
        elderName,
        latestTemp,
        option: {
          tooltip: { trigger: "axis" },
          grid: {
            left: "5%",
            right: "5%",
            bottom: "8%",
            top: "12%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: latestRows.map((_, i) => `测${i + 1}`),
            axisLabel: { fontSize: 10 },
          },
          yAxis: {
            type: "value",
            min: 35,
            max: 42,
            axisLabel: { fontSize: 10 },
          },
          series: [
            {
              type: "line",
              smooth: true,
              data: latestRows.map((s) => s.temperature),
              itemStyle: { color: "#0d9488" },
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
        },
      };
    })
    .sort((a, b) => a.elderName.localeCompare(b.elderName, "zh-CN"));
});

// 用药汇总卡片数据
const medSummaryCards = computed(() => {
  const grouped = meds.value.reduce((acc, row) => {
    const key = row.elder_name || "未知长者";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([elderName, rows]) => {
      // 按用药时间排序，取最近的用药记录
      const sortedMeds = [...rows].sort((a, b) =>
        String(b.take_time || "").localeCompare(String(a.take_time || ""))
      );

      // 去重：同一药品只显示最新的
      const uniqueMeds = [];
      const medNames = new Set();
      for (const med of sortedMeds) {
        if (!medNames.has(med.medicine_name)) {
          medNames.add(med.medicine_name);
          uniqueMeds.push(med);
        }
      }

      return {
        elderName,
        medicines: uniqueMeds.slice(0, 5), // 最多显示5种药品
      };
    })
    .filter((card) => card.medicines.length > 0)
    .sort((a, b) => a.elderName.localeCompare(b.elderName, "zh-CN"));
});

// 获取体温样式类
function getTemperatureClass(temp) {
  if (!temp) return "";
  if (temp > 37.3) return "temp-high";
  if (temp < 36) return "temp-low";
  return "temp-normal";
}

// 判断用药是否逾期
function isMedOverdue(takeTime) {
  if (!takeTime) return false;
  return new Date(takeTime) < new Date();
}

// 格式化时间
function formatTime(time) {
  if (!time) return "";
  const date = new Date(time);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

async function loadSigns() {
  loadingSigns.value = true;
  try {
    const { list } = await getHealthRecords();
    signs.value = list;
  } finally {
    loadingSigns.value = false;
  }
}

async function loadMeds() {
  loadingMeds.value = true;
  try {
    const { list } = await getMedicationRecords();
    meds.value = list;
  } finally {
    loadingMeds.value = false;
  }
}

function openSign() {
  Object.assign(signForm, {
    elder_id: elders.value[0]?.id || null,
    temperature: 36.5,
    blood_pressure: "",
    heart_rate: 72,
    record_time: "",
  });
  signDlg.value = true;
}

function openMed() {
  Object.assign(medForm, {
    elder_id: elders.value[0]?.id || null,
    medicine_name: "",
    dosage: "",
    take_time: "",
    remark: "",
  });
  medDlg.value = true;
}

async function saveSign() {
  if (!signForm.elder_id) {
    ElMessage.warning("请选择长者");
    return;
  }
  const name = elders.value.find((e) => e.id === signForm.elder_id)?.name;
  const row = await saveHealthRecord({ ...signForm, elder_name: name });
  signs.value.unshift(row);
  ElMessage.success("已保存");
  signDlg.value = false;
}

async function saveMed() {
  if (!medForm.elder_id || !medForm.medicine_name) {
    ElMessage.warning("请完善必填项");
    return;
  }
  const name = elders.value.find((e) => e.id === medForm.elder_id)?.name;
  const row = await saveMedicationRecord({ ...medForm, elder_name: name });
  meds.value.unshift(row);
  ElMessage.success("已保存");
  medDlg.value = false;
}

onMounted(async () => {
  const { list } = await getElderList({});
  elders.value = list;
  loadSigns();
  loadMeds();
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

.staff-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.chart-block {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chart-title {
  font-weight: 600;
  font-size: 15px;
}

.chart-sm {
  height: 200px;
  width: 100%;
}

.trend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.trend-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 10px 12px 8px;
  background: #fff;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.trend-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: var(--staff-text);
  margin-bottom: 6px;
}

// 用药汇总样式
.med-summary-block {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.med-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.med-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 12px;
  background: #fff;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.med-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.med-card-title {
  font-weight: 600;
  color: var(--staff-text);
}

.med-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.med-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.med-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.med-name {
  font-weight: 500;
  color: #2c3e50;
}

.med-dosage {
  font-size: 12px;
  color: #6c757d;
}

.med-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

// 体温状态样式
.temp-high {
  color: #f56c6c;
  font-weight: 600;
}

.temp-low {
  color: #409eff;
}

.temp-normal {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

// 表格最大高度滚动
:deep(.el-table__body-wrapper) {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }
}
</style>
