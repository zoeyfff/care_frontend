<template>
  <div>
    <h1 class="staff-page-title">用药执行</h1>
   

    <div class="staff-card">
      <div class="staff-toolbar">
        <el-select
          v-model="status"
          placeholder="执行状态"
          clearable
          style="width: 160px"
          @change="load"
        >
          <el-option label="未执行" :value="0" />
          <el-option label="已执行" :value="1" />
          <el-option label="已确认" :value="2" />
          <el-option label="已拒绝" :value="3" />
        </el-select>
        <el-button type="primary" @click="load">刷新</el-button>
      </div>

      <el-table :data="list" stripe border v-loading="loading">
        <el-table-column prop="elder_name" label="长者" width="100" />
        <el-table-column prop="medicine_name" label="药品" min-width="160" />
        <el-table-column prop="dosage" label="剂量" width="140" />
        <el-table-column prop="frequency" label="频率" width="110" />
        <el-table-column prop="take_time" label="计划时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="确认要求" width="90">
          <template #default="{ row }">
            <el-tag :type="Number(row.need_confirm || 0) === 1 ? 'warning' : 'info'">
              {{ Number(row.need_confirm || 0) === 1 ? "需确认" : "免确认" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="reject_reason"
          label="拒绝原因"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="Number(row.status) === 0"
              link
              type="primary"
              @click="done(row)"
            >
              标记已执行
            </el-button>
            <el-button
              v-if="Number(row.status) === 1 && Number(row.need_confirm || 0) === 1"
              link
              type="success"
              @click="confirm(row)"
            >
              确认
            </el-button>
            <el-button
              v-if="Number(row.status) === 1 && Number(row.need_confirm || 0) === 1"
              link
              type="danger"
              @click="openReject(row)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="rejectDlg" title="拒绝执行" width="420px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="药品">
          <el-input :model-value="rejectForm.medicine_name" disabled />
        </el-form-item>
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reject_reason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDlg = false">取消</el-button>
        <el-button type="danger" @click="submitReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  getNurseMedications,
  markMedicationDone,
  confirmNurseMedication,
  rejectNurseMedication,
} from "@/api/staffApi";

const status = ref("");
const loading = ref(false);
const list = ref([]);
const rejectDlg = ref(false);
const rejectForm = reactive({
  id: null,
  medicine_name: "",
  reject_reason: "",
});

function statusLabel(status) {
  return (
    {
      0: "待执行",
      1: "已执行",
      2: "已确认",
      3: "已拒绝",
    }[Number(status)] || "未知"
  );
}

function statusTagType(status) {
  return (
    {
      0: "warning",
      1: "info",
      2: "success",
      3: "danger",
    }[Number(status)] || "info"
  );
}

async function load() {
  loading.value = true;
  try {
    const { list: rows } = await getNurseMedications({
      status: status.value,
    });
    list.value = rows || [];
  } finally {
    loading.value = false;
  }
}

async function done(row) {
  await markMedicationDone(row.id);
  ElMessage.success("已标记执行");
  load();
}

async function confirm(row) {
  await confirmNurseMedication(row.id);
  ElMessage.success("已确认");
  load();
}

function openReject(row) {
  rejectForm.id = row.id;
  rejectForm.medicine_name = row.medicine_name;
  rejectForm.reject_reason = "";
  rejectDlg.value = true;
}

async function submitReject() {
  if (!rejectForm.reject_reason.trim()) {
    ElMessage.warning("请填写拒绝原因");
    return;
  }
  await rejectNurseMedication(rejectForm.id, rejectForm.reject_reason.trim());
  ElMessage.success("已拒绝执行");
  rejectDlg.value = false;
  load();
}

onMounted(load);
</script>

<style scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}
</style>
