<template>
  <div>
    <h1 class="staff-page-title">护理任务</h1>
    <div class="staff-card">
      <div class="staff-toolbar">
        <el-select
          v-model="filterStatus"
          placeholder="任务状态"
          clearable
          style="width: 140px"
          @change="load"
        >
          <el-option label="未完成" :value="0" />
          <el-option label="已完成" :value="1" />
        </el-select>
        <el-button type="primary" @click="load">刷新</el-button>
        <el-button type="success" @click="openTask()">新建任务</el-button>
        <span class="tip">护理员可在此接收任务、录入体征与备注</span>
      </div>
      <el-table :data="list" stripe border v-loading="loading">
        <el-table-column prop="elder_name" label="长者" width="100" />
        <el-table-column prop="task_name" label="服务内容" min-width="200" />
        <el-table-column prop="execute_time" label="计划执行时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? "已完成" : "未完成" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注 / 体征摘要"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              link
              type="primary"
              @click="complete(row)"
            >
              标记完成
            </el-button>
            <el-button link type="primary" @click="openTask(row)"
              >编辑</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dlg"
      :title="taskForm.id ? '编辑任务' : '新建任务'"
      width="520px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item label="选择长者" required>
          <el-select
            v-model="taskForm.elder_id"
            placeholder="请选择"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="e in elderOptions"
              :key="e.id"
              :label="e.name"
              :value="e.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务名称" required>
          <el-input
            v-model="taskForm.task_name"
            placeholder="如：晨间血压测量、康复训练"
          />
        </el-form-item>
        <el-form-item label="执行时间">
          <el-date-picker
            v-model="taskForm.execute_time"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="taskForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getCareTasks, saveCareTask, getElderList } from "@/api/staffApi";

const loading = ref(false);
const list = ref([]);
const filterStatus = ref("");
const elderOptions = ref([]);
const dlg = ref(false);
const taskForm = reactive({
  id: null,
  elder_id: null,
  task_name: "",
  execute_time: "",
  remark: "",
  status: 0,
});

async function load() {
  loading.value = true;
  try {
    const params = {};
    if (filterStatus.value !== "" && filterStatus.value !== null) {
      params.status = filterStatus.value;
    }
    const { list: rows } = await getCareTasks(params);
    list.value = rows;
  } finally {
    loading.value = false;
  }
}

async function loadElders() {
  const { list: rows } = await getElderList({});
  elderOptions.value = rows;
}

function openTask(row) {
  if (row) {
    Object.assign(taskForm, {
      id: row.id,
      elder_id: row.elder_id,
      task_name: row.task_name,
      execute_time: row.execute_time,
      remark: row.remark,
      status: row.status,
    });
  } else {
    Object.assign(taskForm, {
      id: null,
      elder_id: null,
      task_name: "",
      execute_time: "",
      remark: "",
      status: 0,
    });
  }
  dlg.value = true;
}

async function saveTask() {
  if (!taskForm.elder_id || !taskForm.task_name) {
    ElMessage.warning("请填写长者与任务名称");
    return;
  }
  const name =
    elderOptions.value.find((e) => e.id === taskForm.elder_id)?.name || "";
  const saved = await saveCareTask({ ...taskForm, elder_name: name });
  if (taskForm.id) {
    const i = list.value.findIndex((x) => x.id === taskForm.id);
    if (i >= 0)
      list.value[i] = { ...list.value[i], ...saved, elder_name: name };
  } else {
    list.value.unshift({ ...saved, elder_name: name });
  }
  ElMessage.success("已保存");
  dlg.value = false;
}

async function complete(row) {
  const remark = row.remark || "已完成";
  await saveCareTask({ ...row, status: 1, remark });
  row.status = 1;
  ElMessage.success("已标记完成");
}

onMounted(async () => {
  await loadElders();
  load();
});
</script>

<style scoped>
.tip {
  font-size: 13px;
  color: var(--staff-muted);
  margin-left: 8px;
}
</style>
