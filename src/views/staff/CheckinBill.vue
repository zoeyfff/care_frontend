<template>
  <div>
    <h1 class="staff-page-title">入住与费用</h1>

    <el-tabs v-model="tab" type="border-card" class="staff-card tabs-wrap">
      <el-tab-pane label="入住记录" name="checkin">
        <el-table :data="checkins" stripe border v-loading="loadingC">
          <el-table-column prop="elder_name" label="长者" width="100" />
          <el-table-column prop="start_date" label="入住开始" width="120" />
          <el-table-column prop="end_date" label="结束日期" width="120">
            <template #default="{ row }">{{ row.end_date || "—" }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? "在住" : "已离院" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="建档时间" width="170" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="账单管理" name="bill">
        <div class="staff-toolbar">
          <el-button @click="loadBills">刷新</el-button>
          <el-button type="primary" @click="billHint"
            >生成月度账单（后端）</el-button
          >
        </div>
        <el-table :data="bills" stripe border v-loading="loadingB">
          <el-table-column prop="elder_name" label="长者" width="100" />
          <el-table-column prop="total_amount" label="应付金额" width="120">
            <template #default="{ row }"
              >¥ {{ row.total_amount?.toFixed(2) }}</template
            >
          </el-table-column>
          <el-table-column label="支付状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'warning'">
                {{ row.status === 1 ? "已支付" : "未支付" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="账单日期" width="170" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="showDetail(row)"
                >明细</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-drawer v-model="drawer" title="账单明细" size="400px">
      <template v-if="current">
        <p class="drawer-elder">{{ current.elder_name }}</p>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="总金额"
            >¥ {{ current.total_amount?.toFixed(2) }}</el-descriptions-item
          >
          <el-descriptions-item label="状态">
            {{ current.status === 1 ? "已支付" : "未支付" }}
          </el-descriptions-item>
        </el-descriptions>
        <h4 class="mt">费用项目</h4>
        <el-table :data="current.items || []" size="small" border>
          <el-table-column prop="item_name" label="项目" />
          <el-table-column prop="amount" label="金额">
            <template #default="{ row }"
              >¥ {{ row.amount?.toFixed(2) }}</template
            >
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getCheckins, getBills } from "@/api/staffApi";

const tab = ref("checkin");
const loadingC = ref(false);
const loadingB = ref(false);
const checkins = ref([]);
const bills = ref([]);
const drawer = ref(false);
const current = ref(null);

async function loadCheckins() {
  loadingC.value = true;
  try {
    const { list } = await getCheckins();
    checkins.value = list;
  } finally {
    loadingC.value = false;
  }
}

async function loadBills() {
  loadingB.value = true;
  try {
    const { list } = await getBills();
    bills.value = list;
  } finally {
    loadingB.value = false;
  }
}

function showDetail(row) {
  current.value = row;
  drawer.value = true;
}

function billHint() {
  ElMessage.info(
    "后端按 elder_id 汇总床位费、护理费等 bill_item，支持分页导出与支付回调。"
  );
}

onMounted(() => {
  loadCheckins();
  loadBills();
});
</script>

<style lang="scss" scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.tabs-wrap {
  border-radius: var(--staff-radius);
  overflow: hidden;
  box-shadow: var(--staff-card-shadow);
}

.drawer-elder {
  font-weight: 600;
  margin: 0 0 12px;
}

.mt {
  margin: 20px 0 10px;
  font-size: 14px;
}
</style>
