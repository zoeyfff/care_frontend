<template>
  <div>
    <h1 class="staff-page-title">我的账单</h1>
    <p class="sub">查看关联长者的月度账单、缴费状态与历史记录</p>

    <!-- 统计概览 -->
    <el-row :gutter="16" class="summary-row">
      <el-col :xs="24" :sm="8">
        <div class="bill-stat-card">
          <div class="bill-stat-icon" style="background: #ede9fe">
            <el-icon style="color: #7c3aed"><TrendCharts /></el-icon>
          </div>
          <div>
            <div class="bill-stat-value">{{ totalAmount.toFixed(2) }}</div>
            <div class="bill-stat-label">累计账单（元）</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="bill-stat-card">
          <div class="bill-stat-icon" style="background: #dcfce7">
            <el-icon style="color: #16a34a"><CircleCheck /></el-icon>
          </div>
          <div>
            <div class="bill-stat-value" style="color: #16a34a">{{ paidAmount.toFixed(2) }}</div>
            <div class="bill-stat-label">已支付（元）</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="bill-stat-card">
          <div class="bill-stat-icon" style="background: #fee2e2">
            <el-icon style="color: #dc2626"><Warning /></el-icon>
          </div>
          <div>
            <div class="bill-stat-value" style="color: #dc2626">{{ unpaidAmount.toFixed(2) }}</div>
            <div class="bill-stat-label">待支付（元）</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 长者选择 + 账单列表 -->
    <div class="staff-card">
      <div class="staff-toolbar">
        <span class="toolbar-title">账单明细</span>
        <el-select
          v-model="selectedElderId"
          placeholder="全部长者"
          clearable
          style="width: 160px"
          @change="loadBills"
        >
          <el-option
            v-for="e in linkedElders"
            :key="e.id"
            :label="e.name"
            :value="e.id"
          />
        </el-select>
        <el-date-picker
          v-model="filterCycle"
          type="month"
          value-format="YYYY-MM"
          placeholder="筛选月份"
          clearable
          style="width: 160px"
          @change="loadBills"
        />
        <el-button @click="loadBills">刷新</el-button>
      </div>

      <!-- 账单列表 -->
      <el-table :data="bills" stripe border v-loading="loading" max-height="480">
        <el-table-column prop="billing_cycle" label="账单周期" width="100">
          <template #default="{ row }">
            <span style="font-weight: 600">{{ row.billing_cycle }}</span>
          </template>
        </el-table-column>
        <el-table-column label="长者" width="110">
          <template #default="{ row }">
            {{ row.elder_name || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="账单金额" width="140">
          <template #default="{ row }">
            <span style="font-weight: 700; color: #7c3aed; font-size: 15px">
              ¥{{ Number(row.total_amount || 0).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="邮件通知" width="100">
          <template #default="{ row }">
            <el-tooltip :content="row.email_sent ? '账单已发送至您的邮箱' : '尚未收到账单邮件'">
              <el-tag :type="row.email_sent ? 'success' : 'info'" size="small">
                {{ row.email_sent ? "已通知" : "待通知" }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
              {{ row.status === 1 ? "已支付" : "待支付" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付信息" min-width="180">
          <template #default="{ row }">
            <template v-if="row.status === 1">
              <div style="font-size: 13px">
                <el-icon><Check /></el-icon> {{ row.pay_method || "—" }}
              </div>
              <div style="font-size: 12px; color: var(--staff-muted)">
                {{ row.paid_time?.slice(0, 16) || "" }}
              </div>
            </template>
            <span v-else style="color: var(--staff-muted); font-size: 13px">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="账单生成时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              查看明细
            </el-button>
            <el-button
              v-if="row.status === 0"
              link
              type="success"
              size="small"
              @click="pay(row)"
            >
              立即支付
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!bills.length && !loading"
        :description="selectedElderId ? '该长者暂无账单记录' : '暂未关联长者或暂无账单'"
        :image-size="60"
      />
    </div>

    <!-- 账单明细弹窗 -->
    <el-dialog
      v-model="detailDlg"
      title="账单明细"
      width="560px"
      destroy-on-close
    >
      <template v-if="currentBill">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="账单编号">{{ currentBill.id }}</el-descriptions-item>
          <el-descriptions-item label="计费周期">
            <strong style="color: #7c3aed">{{ currentBill.billing_cycle }}</strong>
          </el-descriptions-item>
          <el-descriptions-item label="长者姓名">{{ currentBill.elder_name || "-" }}</el-descriptions-item>
          <el-descriptions-item label="房间">{{ currentBill.room_no || "-" }}</el-descriptions-item>
          <el-descriptions-item label="护理等级">{{ currentBill.care_level || "-" }}</el-descriptions-item>
          <el-descriptions-item label="账单生成时间">{{ currentBill.create_time }}</el-descriptions-item>
          <el-descriptions-item label="邮件通知">
            <el-tag :type="currentBill.email_sent ? 'success' : 'info'" size="small">
              {{ currentBill.email_sent ? "已发送至您的邮箱" : "尚未发送" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付状态">
            <el-tag :type="currentBill.status === 1 ? 'success' : 'warning'" size="small">
              {{ currentBill.status === 1 ? "已支付" : "待支付" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentBill.status === 1" label="支付方式">
            {{ currentBill.pay_method || "-" }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentBill.status === 1" label="支付时间">
            {{ currentBill.paid_time?.slice(0, 16) || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="账单总额" :span="2">
            <span style="font-size: 22px; font-weight: 700; color: #7c3aed">
              ¥{{ Number(currentBill.total_amount || 0).toFixed(2) }}
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">
          <span style="font-size: 14px; font-weight: 600">费用明细</span>
        </el-divider>

        <el-table :data="currentBillItems" stripe border size="small">
          <el-table-column prop="item_name" label="费用项目" min-width="180" />
          <el-table-column label="金额" width="140" align="right">
            <template #default="{ row }">
              <span style="font-weight: 600">¥{{ Number(row.amount || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 未付款提示 -->
        <div v-if="currentBill.status === 0" class="pay-notice">
          <div class="pay-notice-title">请及时完成缴费</div>
          <div class="pay-notice-body">
            您的家人正在享受专业、贴心的养老照护服务。本账单依据入住协议及上月实际服务产生，请于收到账单后 <strong>7日内</strong> 到前台或通过转账方式完成支付。如有疑问，请致电：<strong>021-1234-5678</strong>。
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="detailDlg = false">关闭</el-button>
        <el-button
          v-if="currentBill && currentBill.status === 0"
          type="primary"
          @click="pay(currentBill)"
        >
          立即支付
        </el-button>
      </template>
    </el-dialog>

    <!-- 支付确认弹窗 -->
    <el-dialog v-model="payDlg" title="确认支付" width="400px" destroy-on-close>
      <div style="text-align: center; padding: 16px 0">
        <div style="font-size: 13px; color: var(--staff-muted); margin-bottom: 8px">
          账单周期：{{ payTarget?.billing_cycle }}
        </div>
        <div style="font-size: 13px; color: var(--staff-muted); margin-bottom: 8px">
          长者：{{ payTarget?.elder_name }}
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #7c3aed">
          ¥{{ Number(payTarget?.total_amount || 0).toFixed(2) }}
        </div>
      </div>
      <div style="font-size: 13px; color: var(--staff-muted); text-align: center; line-height: 1.7">
        当前为演示环境，支付功能暂不实际扣款。<br>
        实际请到养老院前台完成付款。
      </div>
      <template #footer>
        <el-button @click="payDlg = false">取消</el-button>
        <el-button type="primary" :loading="paying" @click="confirmPay">确认支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Check, CircleCheck, TrendCharts, Warning } from "@element-plus/icons-vue";
import {
  getMyLinkedElders,
  getMyBills,
  getMyBillItems,
  payBill,
} from "@/api/staffApi";

const linkedElders = ref([]);
const selectedElderId = ref(null);
const filterCycle = ref("");
const bills = ref([]);
const loading = ref(false);
const detailDlg = ref(false);
const currentBill = ref(null);
const currentBillItems = ref([]);
const payDlg = ref(false);
const payTarget = ref(null);
const paying = ref(false);

const totalAmount = computed(() =>
  bills.value.reduce((s, b) => s + Number(b.total_amount || 0), 0)
);
const paidAmount = computed(() =>
  bills.value.filter((b) => b.status === 1).reduce((s, b) => s + Number(b.total_amount || 0), 0)
);
const unpaidAmount = computed(() =>
  bills.value.filter((b) => b.status === 0).reduce((s, b) => s + Number(b.total_amount || 0), 0)
);

async function loadElders() {
  const res = await getMyLinkedElders();
  linkedElders.value = res.list || [];
  if (linkedElders.value.length > 0 && !selectedElderId.value) {
    selectedElderId.value = linkedElders.value[0].id;
  }
}

async function loadBills() {
  loading.value = true;
  try {
    const params = {};
    if (selectedElderId.value) params.elder_id = selectedElderId.value;
    if (filterCycle.value) params.billing_cycle = filterCycle.value;
    const res = await getMyBills(params);
    bills.value = res.list || [];
  } finally {
    loading.value = false;
  }
}

async function viewDetail(row) {
  currentBill.value = row;
  try {
    const res = await getMyBillItems({ bill_id: row.id });
    currentBillItems.value = res.list || [];
  } catch {
    currentBillItems.value = [];
  }
  detailDlg.value = true;
}

function pay(row) {
  payTarget.value = row;
  payDlg.value = true;
}

async function confirmPay() {
  if (!payTarget.value) return;
  paying.value = true;
  try {
    await payBill(payTarget.value.id);
    ElMessage.success("支付成功！请保留支付凭证。");
    payDlg.value = false;
    detailDlg.value = false;
    loadBills();
  } catch (e) {
    ElMessage.error("支付失败：" + (e?.message || "未知错误"));
  } finally {
    paying.value = false;
  }
}

onMounted(async () => {
  await loadElders();
  loadBills();
});
</script>

<style lang="scss" scoped>
.sub {
  margin: -8px 0 16px;
  color: var(--staff-muted);
  font-size: 14px;
}

.summary-row {
  margin-bottom: 16px;
}

.bill-stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--el-border-color-lighter);
}

.bill-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.bill-stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--staff-text);
  line-height: 1.2;
}

.bill-stat-label {
  font-size: 13px;
  color: var(--staff-muted);
  margin-top: 2px;
}

.staff-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.toolbar-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--staff-text);
  margin-right: auto;
}

.pay-notice {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 16px;
}

.pay-notice-title {
  font-weight: 600;
  font-size: 14px;
  color: #c2410c;
  margin-bottom: 6px;
}

.pay-notice-body {
  font-size: 13px;
  color: #9a3412;
  line-height: 1.7;
}
</style>
