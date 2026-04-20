<template>
  <div>
    <h1 class="staff-page-title">用药执行</h1>
    <p class="sub">
      演示以
      <code>medication_record</code>
      为主；实际项目建议增加“执行状态/执行人/执行时间”字段或独立执行表。
    </p>

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
        </el-select>
        <el-button type="primary" @click="load">刷新</el-button>
      </div>

      <el-table :data="list" stripe border v-loading="loading">
        <el-table-column prop="elder_name" label="长者" width="100" />
        <el-table-column prop="medicine_name" label="药品" min-width="160" />
        <el-table-column prop="dosage" label="剂量" width="140" />
        <el-table-column prop="take_time" label="计划时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? "已执行" : "未执行" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status !== 1"
              link
              type="primary"
              @click="done(row)"
            >
              标记已执行
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { getNurseMedications, markMedicationDone } from "@/api/staffApi";

const status = ref("");
const loading = ref(false);
const list = ref([]);

async function load() {
  loading.value = true;
  try {
    const { list: rows } = await getNurseMedications({ status: status.value });
    list.value = rows;
  } finally {
    loading.value = false;
  }
}

async function done(row) {
  await markMedicationDone(row.id);
  ElMessage.success("已标记");
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
