<template>
  <div>
    <h1 class="staff-page-title">我的任务</h1>
    <p class="sub">任务来自护理计划与排班；可在此标记完成并补充体征/备注。</p>

    <div class="staff-card">
      <div class="staff-toolbar">
        <el-select
          v-model="status"
          placeholder="状态"
          clearable
          style="width: 140px"
          @change="load"
        >
          <el-option label="未完成" :value="0" />
          <el-option label="已完成" :value="1" />
        </el-select>
        <el-button type="primary" @click="load">刷新</el-button>
      </div>

      <el-table :data="list" stripe border v-loading="loading">
        <el-table-column prop="elder_name" label="长者" width="100" />
        <el-table-column prop="task_name" label="任务内容" min-width="220" />
        <el-table-column prop="execute_time" label="计划时间" width="170" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? "完成" : "待办" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              link
              type="primary"
              @click="openDone(row)"
            >
              完成并记录
            </el-button>
            <el-button link type="primary" @click="openEdit(row)"
              >编辑备注</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dlg"
      :title="mode === 'done' ? '完成任务' : '编辑备注'"
      width="520px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item label="任务">
          <el-input v-model="form.task_name" disabled />
        </el-form-item>
        <el-form-item label="长者">
          <el-input v-model="form.elder_name" disabled />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="4"
            placeholder="可记录体征摘要、异常情况等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="submit">{{
          mode === "done" ? "完成" : "保存"
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { getNurseTasks, saveCareTask } from "@/api/staffApi";

const status = ref("");
const loading = ref(false);
const list = ref([]);

const dlg = ref(false);
const mode = ref("done"); // done | edit
const form = reactive({
  id: null,
  elder_id: null,
  elder_name: "",
  task_name: "",
  remark: "",
  status: 0,
  execute_time: "",
});

async function load() {
  loading.value = true;
  try {
    const { list: rows } = await getNurseTasks({ status: status.value });
    list.value = rows;
  } finally {
    loading.value = false;
  }
}

function openDone(row) {
  mode.value = "done";
  Object.assign(form, row);
  dlg.value = true;
}

function openEdit(row) {
  mode.value = "edit";
  Object.assign(form, row);
  dlg.value = true;
}

async function submit() {
  const payload = { ...form };
  if (mode.value === "done") payload.status = 1;
  await saveCareTask(payload);
  ElMessage.success("已提交");
  dlg.value = false;
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
