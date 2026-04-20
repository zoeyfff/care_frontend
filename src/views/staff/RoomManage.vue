<template>
  <div>
    <h1 class="staff-page-title">房间资源管理</h1>
    <p class="sub">
      用于管理楼栋/楼层/房号/房型与床位占用情况，为入住分配、床位统计与费用计算提供基础数据。
    </p>

    <div class="staff-card">
      <div class="staff-toolbar">
        <el-input
          v-model="keyword"
          placeholder="房间号 / 楼栋"
          clearable
          style="width: 220px"
          @keyup.enter="load"
        />
        <el-select
          v-model="filterStatus"
          placeholder="状态"
          clearable
          style="width: 140px"
          @change="load"
        >
          <el-option label="可用" :value="1" />
          <el-option label="维修/停用" :value="0" />
        </el-select>
        <el-button type="primary" @click="load">查询</el-button>
        <el-button type="success" @click="openEdit()">新增房间</el-button>
      </div>

      <el-row :gutter="16" class="summary">
        <el-col :xs="24" :sm="12" :lg="6">
          <el-statistic title="房间总数" :value="summary.roomTotal" />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-statistic title="可用房间" :value="summary.roomActive" />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-statistic title="床位总数" :value="summary.bedTotal" />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-statistic title="床位占用" :value="summary.bedOccupied" />
        </el-col>
      </el-row>

      <el-table :data="list" stripe border v-loading="loading">
        <el-table-column prop="room_no" label="房间号" width="110" fixed />
        <el-table-column prop="building" label="楼栋" width="70" />
        <el-table-column prop="floor" label="楼层" width="70" />
        <el-table-column prop="room_type" label="房型" width="100" />
        <el-table-column label="床位" width="120">
          <template #default="{ row }">
            {{ row.bed_occupied }}/{{ row.bed_total }}
          </template>
        </el-table-column>
        <el-table-column label="剩余床位" width="100">
          <template #default="{ row }">
            {{ Math.max(0, (row.bed_total || 0) - (row.bed_occupied || 0)) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? "可用" : "维修/停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column prop="create_time" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)"
              >编辑</el-button
            >
            <el-popconfirm title="确定删除该房间？" @confirm="remove(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dlg"
      :title="form.id ? '编辑房间' : '新增房间'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="楼栋" prop="building">
              <el-input v-model="form.building" placeholder="如 A/B/C" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="楼层" prop="floor">
              <el-input-number
                v-model="form.floor"
                :min="1"
                :max="30"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="房间号" prop="room_no">
          <el-input v-model="form.room_no" placeholder="如 A-201" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="房型" prop="room_type">
              <el-select
                v-model="form.room_type"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="单人间" value="单人间" />
                <el-option label="双人间" value="双人间" />
                <el-option label="四人间" value="四人间" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">可用</el-radio>
                <el-radio :label="0">维修/停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="总床位" prop="bed_total">
              <el-input-number
                v-model="form.bed_total"
                :min="0"
                :max="20"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已占用" prop="bed_occupied">
              <el-input-number
                v-model="form.bed_occupied"
                :min="0"
                :max="form.bed_total || 0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
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
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { deleteRoom, getRoomList, saveRoom } from "@/api/staffApi";

const keyword = ref("");
const filterStatus = ref("");
const loading = ref(false);
const list = ref([]);

const dlg = ref(false);
const formRef = ref();
const form = reactive({
  id: null,
  building: "",
  floor: 1,
  room_no: "",
  room_type: "双人间",
  bed_total: 2,
  bed_occupied: 0,
  status: 1,
  remark: "",
});

const rules = {
  building: [{ required: true, message: "请输入楼栋", trigger: "blur" }],
  floor: [{ required: true, message: "请输入楼层", trigger: "change" }],
  room_no: [{ required: true, message: "请输入房间号", trigger: "blur" }],
  room_type: [{ required: true, message: "请选择房型", trigger: "change" }],
};

const summary = computed(() => {
  const rooms = list.value || [];
  const roomTotal = rooms.length;
  const roomActive = rooms.filter((r) => r.status === 1).length;
  const bedTotal = rooms.reduce((s, r) => s + (r.bed_total || 0), 0);
  const bedOccupied = rooms.reduce((s, r) => s + (r.bed_occupied || 0), 0);
  return { roomTotal, roomActive, bedTotal, bedOccupied };
});

function reset() {
  Object.assign(form, {
    id: null,
    building: "",
    floor: 1,
    room_no: "",
    room_type: "双人间",
    bed_total: 2,
    bed_occupied: 0,
    status: 1,
    remark: "",
  });
}

async function load() {
  loading.value = true;
  try {
    const { list: rows } = await getRoomList({
      keyword: keyword.value,
      status: filterStatus.value,
    });
    list.value = rows;
  } finally {
    loading.value = false;
  }
}

function openEdit(row) {
  reset();
  if (row) Object.assign(form, row);
  dlg.value = true;
}

async function save() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  if ((form.bed_occupied || 0) > (form.bed_total || 0)) {
    ElMessage.warning("已占用床位不能大于总床位");
    return;
  }
  await saveRoom({ ...form });
  ElMessage.success("已保存");
  dlg.value = false;
  load();
}

async function remove(row) {
  await deleteRoom(row.id);
  ElMessage.success("已删除");
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

.summary {
  margin: 4px 0 14px;
}
</style>
