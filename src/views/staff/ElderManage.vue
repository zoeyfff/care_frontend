<template>
  <div>
    <h1 class="staff-page-title">长者管理</h1>

    <div class="staff-card">
      <div class="staff-toolbar">
        <el-input
          v-model="keyword"
          placeholder="姓名 / 房间 / 身份证"
          clearable
          style="width: 240px"
          @keyup.enter="load"
        />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button type="success" @click="openEdit()">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>新增长者
        </el-button>
        <el-button type="warning" @click="handleExportExcel" :loading="exporting">
          <el-icon style="margin-right: 4px"><Download /></el-icon>导出 Excel
        </el-button>
      </div>

      <!-- 统计卡片 -->
      <el-row :gutter="12" class="summary-row">
        <el-col :xs="12" :sm="6">
          <div class="summary-card">
            <div class="summary-icon" style="background: #ede9fe">
              <el-icon style="color: #7c3aed"><User /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ stats.total }}</div>
              <div class="summary-label">在册长者</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="summary-card">
            <div class="summary-icon" style="background: #dcfce7">
              <el-icon style="color: #16a34a"><CircleCheck /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ stats.living }}</div>
              <div class="summary-label">在院长者</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="summary-card">
            <div class="summary-icon" style="background: #fee2e2">
              <el-icon style="color: #dc2626"><Warning /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ stats.special }}</div>
              <div class="summary-label">特级护理</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="summary-card">
            <div class="summary-icon" style="background: #fef3c7">
              <el-icon style="color: #d97706"><HomeFilled /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ stats.rooms }}</div>
              <div class="summary-label">入住房间数</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 护理等级筛选 -->
      <div class="filter-row">
        <span class="filter-label">护理等级：</span>
        <el-radio-group v-model="filterCareLevel" size="small" @change="load">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="特级护理">特级护理</el-radio-button>
          <el-radio-button label="一级护理">一级护理</el-radio-button>
          <el-radio-button label="二级护理">二级护理</el-radio-button>
          <el-radio-button label="三级护理">三级护理</el-radio-button>
        </el-radio-group>
      </div>

      <el-table
        :data="tableData"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        max-height="520"
      >
        <el-table-column prop="name" label="姓名" width="90" fixed>
          <template #default="{ row }">
            <div class="name-cell">
              <el-avatar :size="28" style="background: #7c3aed; font-size: 12px; flex-shrink: 0">
                {{ row.name?.slice(0, 1) }}
              </el-avatar>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="60" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.gender === '男' ? '' : 'danger'">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="id_card"
          label="身份证号"
          min-width="170"
          show-overflow-tooltip
        />
        <el-table-column prop="phone" label="本人电话" width="120" />
        <el-table-column
          prop="family_contact"
          label="家属联系方式"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="care_level" label="护理等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="careLevelTagType(row.care_level)"
            >
              {{ row.care_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="房间 / 床位" width="120" align="center">
          <template #default="{ row }">
            <span class="room-badge">{{ row.room_no || "—" }}</span>
            <span class="bed-badge">{{ row.bed_no || "" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="checkin_date" label="入住日期" width="110" align="center" />
        <el-table-column
          prop="health_info"
          label="健康概况"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button link type="success" size="small" @click="openDetail(row)">
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-popconfirm title="确定删除该档案？" @confirm="remove(row)">
              <template #reference>
                <el-button link type="danger" size="small">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <span class="total-hint">共 {{ tableData.length }} 条记录</span>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="visible"
      :title="form.id ? '编辑长者档案' : '新增长者档案'"
      width="680px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <div class="form-section-title">基本信息</div>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入长者姓名" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="身份证号" prop="id_card">
          <el-input v-model="form.id_card" placeholder="请输入18位身份证号" maxlength="18" />
        </el-form-item>
        <el-form-item label="本人电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="20" />
        </el-form-item>
        <el-form-item label="家属联系方式" prop="family_contact">
          <el-input v-model="form.family_contact" placeholder="姓名 + 电话" />
        </el-form-item>

        <div class="form-section-title">入住信息</div>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="护理等级" prop="care_level">
              <el-select v-model="form.care_level" placeholder="请选择" style="width: 100%">
                <el-option label="特级护理" value="特级护理" />
                <el-option label="一级护理" value="一级护理" />
                <el-option label="二级护理" value="二级护理" />
                <el-option label="三级护理" value="三级护理" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入住日期" prop="checkin_date">
              <el-date-picker
                v-model="form.checkin_date"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="房间号" prop="room_no">
              <el-input v-model="form.room_no" placeholder="如 A-101" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="床位号" prop="bed_no">
              <el-input v-model="form.bed_no" placeholder="如 1床" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-section-title">健康信息</div>
        <el-form-item label="健康概况">
          <el-input
            v-model="form.health_info"
            type="textarea"
            :rows="2"
            placeholder="既往病史、过敏源、特殊需求等"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="个性化护理计划">
          <el-input
            v-model="form.care_plan"
            type="textarea"
            :rows="4"
            placeholder="起居、饮食、康复、用药协助等个性化要点"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">
          {{ form.id ? "保存修改" : "确认新增" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 长者详情抽屉 -->
    <el-drawer v-model="detailDrawer" title="长者档案详情" size="520px" destroy-on-close>
      <div v-if="currentRow" class="detail-root">
        <div class="detail-header">
          <el-avatar :size="56" style="background: #7c3aed; font-size: 24px">
            {{ currentRow.name?.slice(0, 1) }}
          </el-avatar>
          <div class="detail-header-info">
            <div class="detail-name">{{ currentRow.name }}</div>
            <div class="detail-sub">
              <el-tag size="small">{{ currentRow.gender }}</el-tag>
              <el-tag size="small" :type="careLevelTagType(currentRow.care_level)" style="margin-left: 6px">
                {{ currentRow.care_level }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border size="small" class="detail-descriptions">
          <el-descriptions-item label="身份证号">{{ currentRow.id_card || "—" }}</el-descriptions-item>
          <el-descriptions-item label="本人电话">{{ currentRow.phone || "—" }}</el-descriptions-item>
          <el-descriptions-item label="入住日期" :span="2">{{ currentRow.checkin_date || "—" }}</el-descriptions-item>
          <el-descriptions-item label="房间号">{{ currentRow.room_no || "—" }}</el-descriptions-item>
          <el-descriptions-item label="床位号">{{ currentRow.bed_no || "—" }}</el-descriptions-item>
          <el-descriptions-item label="建档时间" :span="2">{{ currentRow.create_time || "—" }}</el-descriptions-item>
          <el-descriptions-item label="家属联系方式" :span="2">{{ currentRow.family_contact || "—" }}</el-descriptions-item>
          <el-descriptions-item label="健康概况" :span="2">
            <span style="white-space: pre-wrap">{{ currentRow.health_info || "暂无" }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="个性化护理计划" :span="2">
            <span style="white-space: pre-wrap">{{ currentRow.care_plan || "暂无" }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-actions">
          <el-button type="primary" @click="openEdit(currentRow); detailDrawer = false">
            编辑档案
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Plus, Download, User, CircleCheck, Warning, HomeFilled,
  Edit, View, Delete,
} from "@element-plus/icons-vue";
import { getElderList, saveElder, deleteElder } from "@/api/staffApi";

const keyword = ref("");
const filterCareLevel = ref("");
const loading = ref(false);
const exporting = ref(false);
const saving = ref(false);
const tableData = ref([]);
const visible = ref(false);
const detailDrawer = ref(false);
const currentRow = ref(null);
const formRef = ref();

const form = reactive({
  id: null,
  name: "",
  gender: "",
  id_card: "",
  phone: "",
  family_contact: "",
  health_info: "",
  care_level: "",
  room_no: "",
  bed_no: "",
  checkin_date: "",
  care_plan: "",
});

const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  family_contact: [{ required: true, message: "请填写家属联系方式", trigger: "blur" }],
  care_level: [{ required: true, message: "请选择护理等级", trigger: "change" }],
  id_card: [
    { min: 18, max: 18, message: "身份证号需为18位", trigger: "blur" },
  ],
};

function careLevelTagType(level) {
  return { "特级护理": "danger", "一级护理": "warning", "二级护理": "", "三级护理": "info" }[level] || "info";
}

const stats = computed(() => {
  const all = tableData.value;
  const rooms = new Set(all.map((e) => e.room_no).filter(Boolean)).size;
  return {
    total: all.length,
    living: all.length,
    special: all.filter((e) => e.care_level === "特级护理").length,
    rooms,
  };
});

function resetForm() {
  Object.assign(form, {
    id: null, name: "", gender: "", id_card: "", phone: "",
    family_contact: "", health_info: "", care_level: "",
    room_no: "", bed_no: "", checkin_date: "", care_plan: "",
  });
}

async function load() {
  loading.value = true;
  try {
    const { list } = await getElderList({ keyword: keyword.value });
    tableData.value = filterCareLevel.value
      ? list.filter((e) => e.care_level === filterCareLevel.value)
      : list;
  } finally {
    loading.value = false;
  }
}

function openEdit(row) {
  resetForm();
  if (row) {
    Object.assign(form, { ...row, care_plan: row.care_plan || "" });
  }
  visible.value = true;
}

function openDetail(row) {
  currentRow.value = row;
  detailDrawer.value = true;
}

async function save() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  saving.value = true;
  try {
    const row = await saveElder({ ...form });
    if (form.id) {
      const i = tableData.value.findIndex((x) => x.id === form.id);
      if (i >= 0) tableData.value[i] = { ...tableData.value[i], ...row };
    } else {
      tableData.value.unshift({
        ...row,
        create_time: new Date().toISOString().slice(0, 19).replace("T", " "),
      });
    }
    ElMessage.success("已保存");
    visible.value = false;
  } catch (e) {
    ElMessage.error("保存失败：" + (e?.message || "未知错误"));
  } finally {
    saving.value = false;
  }
}

async function remove(row) {
  await deleteElder(row.id);
  tableData.value = tableData.value.filter((x) => x.id !== row.id);
  ElMessage.success("已删除");
}

function exportToExcel(data, filename, title) {
  const headers = [
    "姓名", "性别", "身份证号", "本人电话", "家属联系方式",
    "护理等级", "房间号", "床位号", "入住日期", "健康概况", "个性化护理计划",
  ];
  const fields = [
    "name", "gender", "id_card", "phone", "family_contact",
    "care_level", "room_no", "bed_no", "checkin_date", "health_info", "care_plan",
  ];

  const rows = data.map((e) => fields.map((f) => e[f] || ""));
  const allRows = [headers, ...rows];

  let xlsContent = "";
  for (const row of allRows) {
    xlsContent += row.map((cell) => {
      const str = String(cell).replace(/"/g, '""');
      return `"${str}"`;
    }).join("\t") + "\n";
  }

  const blob = new Blob(
    ["\ufeff" + xlsContent],
    { type: "application/vnd.ms-excel;charset=utf-8" }
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function handleExportExcel() {
  if (exporting.value) return;
  exporting.value = true;
  try {
    const { list } = await getElderList({ keyword: "" });
    const data = keyword.value
      ? list.filter(
          (e) =>
            e.name.includes(keyword.value) ||
            (e.room_no && e.room_no.includes(keyword.value)) ||
            (e.id_card && e.id_card.includes(keyword.value))
        )
      : list;

    exportToExcel(
      filterCareLevel.value
        ? data.filter((e) => e.care_level === filterCareLevel.value)
        : data,
      "长者管理清单",
      "长者管理"
    );
    ElMessage.success(`导出成功，共 ${data.length} 条记录`);
  } catch (e) {
    ElMessage.error("导出失败：" + (e?.message || "未知错误"));
  } finally {
    exporting.value = false;
  }
}

onMounted(load);
</script>

<style lang="scss" scoped>
.summary-row {
  margin-bottom: 16px;
}

.summary-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--el-border-color-lighter);
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.summary-info {
  flex: 1;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--staff-text);
  line-height: 1.2;
}

.summary-label {
  font-size: 12px;
  color: var(--staff-muted);
  margin-top: 2px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 13px;
  color: var(--staff-muted);
  white-space: nowrap;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.room-badge {
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #bbf7d0;
}

.bed-badge {
  color: #6b7280;
  font-size: 12px;
  margin-left: 2px;
}

.pagination-wrap {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.total-hint {
  font-size: 13px;
  color: var(--staff-muted);
}

.form-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--staff-text);
  padding: 0 0 4px 2px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 12px;
  margin-top: 4px;
}

.detail-root {
  padding: 0 4px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}

.detail-header-info {
  flex: 1;
}

.detail-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--staff-text);
  margin-bottom: 6px;
}

.detail-sub {
  display: flex;
  align-items: center;
}

.detail-descriptions {
  margin-bottom: 20px;
}

.detail-actions {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  text-align: right;
}
</style>
