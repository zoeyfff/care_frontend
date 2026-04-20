<template>
  <div>
    <h1 class="staff-page-title">体征录入</h1>
    <p class="sub">
      体征数据写入
      <code>health_record</code
      >。建议后端提供异常阈值与提醒规则（如体温≥37.3、血压过高等）。
    </p>

    <div class="staff-card">
      <div class="staff-toolbar">
        <el-button type="primary" @click="open">新增体征</el-button>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-table :data="list" stripe border v-loading="loading">
        <el-table-column prop="elder_name" label="长者" width="100" />
        <el-table-column prop="temperature" label="体温℃" width="90" />
        <el-table-column prop="blood_pressure" label="血压" width="100" />
        <el-table-column prop="heart_rate" label="心率" width="80" />
        <el-table-column prop="record_time" label="测量时间" width="170" />
        <el-table-column label="判定" width="110">
          <template #default="{ row }">
            <el-tag :type="isAbnormal(row) ? 'danger' : 'success'">
              {{ isAbnormal(row) ? "异常" : "正常" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dlg" title="录入体征" width="520px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="长者" required>
          <el-select v-model="form.elder_id" filterable style="width: 100%">
            <el-option
              v-for="e in elders"
              :key="e.id"
              :label="e.name"
              :value="e.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="体温">
              <el-input-number
                v-model="form.temperature"
                :min="35"
                :max="42"
                :step="0.1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="心率">
              <el-input-number v-model="form.heart_rate" :min="40" :max="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="血压">
          <el-input v-model="form.blood_pressure" placeholder="如 120/80" />
        </el-form-item>
        <el-form-item label="测量时间">
          <el-date-picker
            v-model="form.record_time"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  getElderList,
  getHealthRecords,
  saveHealthRecord,
} from "@/api/staffApi";

const loading = ref(false);
const list = ref([]);
const elders = ref([]);
const dlg = ref(false);

const form = reactive({
  elder_id: null,
  temperature: 36.5,
  blood_pressure: "",
  heart_rate: 72,
  record_time: "",
});

function isAbnormal(row) {
  const t = Number(row.temperature);
  if (!Number.isNaN(t) && (t >= 37.3 || t <= 35.0)) return true;
  const hr = Number(row.heart_rate);
  if (!Number.isNaN(hr) && (hr >= 110 || hr <= 50)) return true;
  // 血压简单判断（演示）：收缩压≥160 或 舒张压≥100 视为异常
  if (row.blood_pressure && row.blood_pressure.includes("/")) {
    const [s, d] = row.blood_pressure.split("/").map((x) => Number(x));
    if ((s && s >= 160) || (d && d >= 100)) return true;
  }
  return false;
}

async function load() {
  loading.value = true;
  try {
    const { list: rows } = await getHealthRecords();
    list.value = rows;
  } finally {
    loading.value = false;
  }
}

function open() {
  Object.assign(form, {
    elder_id: elders.value[0]?.id || null,
    temperature: 36.5,
    blood_pressure: "",
    heart_rate: 72,
    record_time: "",
  });
  dlg.value = true;
}

async function save() {
  if (!form.elder_id) {
    ElMessage.warning("请选择长者");
    return;
  }
  const name = elders.value.find((e) => e.id === form.elder_id)?.name;
  await saveHealthRecord({ ...form, elder_name: name });
  ElMessage.success("已保存");
  dlg.value = false;
  load();
}

onMounted(async () => {
  const { list: rows } = await getElderList();
  elders.value = rows;
  load();
});
</script>

<style scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}
</style>
