<template>
  <div>
    <h1 class="staff-page-title">健康监测与医疗记录</h1>
    <p class="sub">体征数据、用药记录</p>

    <el-tabs v-model="tab" type="border-card" class="staff-card tabs-wrap">
      <el-tab-pane label="体征记录" name="signs">
        <div class="staff-toolbar">
          <el-button type="primary" @click="openSign()">新增体征</el-button>
          <el-button @click="loadSigns">刷新</el-button>
        </div>
        <el-table :data="signs" stripe border v-loading="loadingSigns">
          <el-table-column prop="elder_name" label="长者" width="100" />
          <el-table-column prop="temperature" label="体温 ℃" width="90" />
          <el-table-column prop="blood_pressure" label="血压" width="100" />
          <el-table-column prop="heart_rate" label="心率" width="80" />
          <el-table-column prop="record_time" label="测量时间" width="170" />
        </el-table>
        <div class="chart-block">
          <div class="chart-title">体温趋势（演示 · 王秀英）</div>
          <v-chart class="chart-sm" :option="tempTrendOption" autoresize />
        </div>
      </el-tab-pane>

      <el-tab-pane label="用药记录" name="med">
        <div class="staff-toolbar">
          <el-button type="primary" @click="openMed()">新增用药记录</el-button>
          <el-button @click="loadMeds">刷新</el-button>
        </div>
        <el-table :data="meds" stripe border v-loading="loadingMeds">
          <el-table-column prop="elder_name" label="长者" width="100" />
          <el-table-column
            prop="medicine_name"
            label="药品名称"
            min-width="160"
          />
          <el-table-column prop="dosage" label="剂量与频次" width="140" />
          <el-table-column prop="take_time" label="用药时间" width="170" />
          <el-table-column
            prop="remark"
            label="备注"
            min-width="120"
            show-overflow-tooltip
          />
        </el-table>
      </el-tab-pane>
    </el-tabs>

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

const tempTrendOption = computed(() => {
  const w = signs.value.filter((s) => s.elder_name === "王秀英").slice(-7);
  return {
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: w.map((_, i) => `测次${i + 1}`) },
    yAxis: { type: "value", min: 35, max: 38 },
    series: [
      {
        type: "line",
        smooth: true,
        data: w.length ? w.map((s) => s.temperature) : [36.5, 36.6, 36.4, 36.5],
        itemStyle: { color: "#0d9488" },
        areaStyle: { opacity: 0.1 },
      },
    ],
  };
});

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

.chart-block {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.chart-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.chart-sm {
  height: 240px;
  width: 100%;
}
</style>
