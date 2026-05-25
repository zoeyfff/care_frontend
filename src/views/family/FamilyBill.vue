<template>
  <div class="family-page">

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div>
          <h1 class="page-title">我的账单</h1>
          <p class="page-desc">查看关联长者的月度账单、缴费状态与历史记录</p>
        </div>
      </div>
      <div class="header-right">
        <div class="stat-chip">
          <span class="chip-dot chip-total" />
          <span>累计 <strong>¥{{ totalAmount.toFixed(2) }}</strong></span>
        </div>
        <div class="stat-chip">
          <span class="chip-dot chip-success" />
          <span>已付 <strong>¥{{ paidAmount.toFixed(2) }}</strong></span>
        </div>
        <div class="stat-chip">
          <span class="chip-dot chip-danger" />
          <span>待付 <strong>¥{{ unpaidAmount.toFixed(2) }}</strong></span>
        </div>
      </div>
    </div>

    <!-- 账单列表卡片 -->
    <div class="content-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="toolbar-title">账单明细</span>
        </div>
        <div class="toolbar-right">
          <el-select
            v-model="selectedElderId"
            placeholder="全部长者"
            clearable
            size="large"
            class="elder-select"
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
            size="large"
            class="month-picker"
            @change="loadBills"
          />
          <el-button size="large" @click="loadBills">
            <el-icon style="margin-right: 4px"><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <!-- 账单列表 -->
      <div v-loading="loading">
        <div v-if="!bills.length && !loading" class="empty-state">
          <div class="empty-icon"><el-icon><TrendCharts /></el-icon></div>
          <div class="empty-title">暂无账单记录</div>
          <div class="empty-desc">{{ selectedElderId ? '该长者暂无账单' : '暂未关联长者或暂无账单' }}</div>
        </div>

        <div class="bill-list" v-else>
          <div
            v-for="bill in bills"
            :key="bill.id"
            class="bill-card"
            :class="{ 'bill-done': bill.status === 1 }"
          >
            <div class="bill-card-left">
              <div class="bill-cycle">{{ bill.billing_cycle }}</div>
              <div class="bill-elder">{{ bill.elder_name || '—' }}</div>
              <div class="bill-time">{{ bill.create_time }}</div>
            </div>

            <div class="bill-card-center">
              <div class="bill-items-grid">
                <el-tag :type="bill.email_sent ? 'success' : 'info'" effect="light" size="small" round>
                  <el-icon v-if="bill.email_sent" style="margin-right: 3px"><Message /></el-icon>
                  {{ bill.email_sent ? '已发邮件' : '待通知' }}
                </el-tag>
                <el-tag :type="bill.status === 1 ? 'success' : 'warning'" effect="light" size="small" round>
                  {{ bill.status === 1 ? '已支付' : '待支付' }}
                </el-tag>
              </div>
              <div v-if="bill.status === 1" class="bill-pay-info">
                <el-icon><Check /></el-icon>
                {{ bill.pay_method || '—' }}
                {{ bill.paid_time?.slice(0, 16) || '' }}
              </div>
            </div>

            <div class="bill-card-right">
              <div class="bill-amount">
                <span class="amount-symbol">¥</span>
                <span class="amount-val">{{ Number(bill.total_amount || 0).toFixed(2) }}</span>
              </div>
              <div class="bill-actions">
                <el-button size="small" @click="viewDetail(bill)">查看明细</el-button>
                <el-button
                  v-if="bill.status === 0"
                  type="primary"
                  size="small"
                  class="btn-pay"
                  @click="pay(bill)"
                >
                  立即支付
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 账单明细弹窗 -->
    <el-dialog v-model="detailDlg" title="账单明细" width="600px" destroy-on-close class="bill-dlg">
      <template v-if="currentBill">
        <!-- 摘要卡 -->
        <div class="bill-summary">
          <div class="summary-cycle">{{ currentBill.billing_cycle }}</div>
          <div class="summary-amount">
            <span class="amount-symbol-lg">¥</span>
            <span class="amount-val-lg">{{ Number(currentBill.total_amount || 0).toFixed(2) }}</span>
          </div>
          <div class="summary-status">
            <el-tag :type="currentBill.status === 1 ? 'success' : 'warning'" effect="dark" size="small" round>
              {{ currentBill.status === 1 ? '已支付' : '待支付' }}
            </el-tag>
            <el-tag :type="currentBill.email_sent ? 'success' : 'info'" effect="light" size="small" round style="margin-left: 8px">
              {{ currentBill.email_sent ? '已发邮件' : '待通知' }}
            </el-tag>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">长者姓名</div>
            <div class="info-value">{{ currentBill.elder_name || '—' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">房间号</div>
            <div class="info-value">{{ currentBill.room_no || '—' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">护理等级</div>
            <div class="info-value">{{ currentBill.care_level || '—' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">生成时间</div>
            <div class="info-value">{{ currentBill.create_time }}</div>
          </div>
          <div v-if="currentBill.status === 1" class="info-item">
            <div class="info-label">支付方式</div>
            <div class="info-value">{{ currentBill.pay_method || '—' }}</div>
          </div>
          <div v-if="currentBill.status === 1" class="info-item">
            <div class="info-label">支付时间</div>
            <div class="info-value">{{ currentBill.paid_time?.slice(0, 16) || '—' }}</div>
          </div>
        </div>

        <el-divider />

        <!-- 费用明细 -->
        <div class="section-title">费用明细</div>
        <div class="items-list">
          <div
            v-for="item in currentBillItems"
            :key="item.id"
            class="bill-item-row"
          >
            <span class="item-name">{{ item.item_name }}</span>
            <span class="item-amount">¥{{ Number(item.amount || 0).toFixed(2) }}</span>
          </div>
          <div v-if="!currentBillItems.length" class="items-empty">暂无费用明细</div>
        </div>

        <!-- 待付款提示 -->
        <div v-if="currentBill.status === 0" class="pay-notice">
          <div class="notice-icon"><el-icon><Warning /></el-icon></div>
          <div class="notice-body">
            <div class="notice-title">请及时完成缴费</div>
            <div class="notice-text">
              您的家人正在享受专业、贴心的养老照护服务。本账单依据入住协议及上月实际服务产生，请于收到账单后 <strong>7日内</strong> 完成支付。如有疑问，请致电：<strong>021-1234-5678</strong>。
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button size="large" @click="detailDlg = false">关闭</el-button>
        <el-button
          v-if="currentBill && currentBill.status === 0"
          type="primary"
          size="large"
          class="btn-pay"
          @click="pay(currentBill)"
        >
          立即支付
        </el-button>
      </template>
    </el-dialog>

    <!-- 支付确认弹窗 -->
    <el-dialog v-model="payDlg" title="确认支付" width="420px" destroy-on-close class="pay-dlg">
      <div class="pay-confirm-body">
        <div class="pay-amount-display">
          <span class="pay-symbol">¥</span>
          <span class="pay-val">{{ Number(payTarget?.total_amount || 0).toFixed(2) }}</span>
        </div>
        <div class="pay-meta">
          <div class="pay-meta-item">
            <span class="pay-meta-label">账单周期</span>
            <span class="pay-meta-val">{{ payTarget?.billing_cycle }}</span>
          </div>
          <div class="pay-meta-item">
            <span class="pay-meta-label">长者</span>
            <span class="pay-meta-val">{{ payTarget?.elder_name }}</span>
          </div>
        </div>
        <div class="pay-tip">
          <el-icon><InfoFilled /></el-icon>
          当前为演示环境，支付功能暂不实际扣款。实际请到养老院前台完成付款。
        </div>
      </div>
      <template #footer>
        <el-button size="large" @click="payDlg = false">取消</el-button>
        <el-button type="primary" size="large" class="btn-pay" :loading="paying" @click="confirmPay">
          确认支付
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  Check, InfoFilled, Message, Refresh, TrendCharts, Warning,
} from "@element-plus/icons-vue";
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
.family-page {
  padding-bottom: 24px;
}

// ========== 页面 Header ==========
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #be185d, #f43f5e);
  border-radius: 16px;
  padding: 22px 28px;
  color: #fff;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.page-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.page-desc {
  margin: 0;
  font-size: 13px;
  opacity: 0.75;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  strong { font-weight: 700; }
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.chip-total { background: #fde68a; }
.chip-success { background: #6ee7b7; }
.chip-danger { background: #fda4af; }

// ========== 内容卡片 ==========
.content-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--el-border-color-lighter, #f1f5f9);
}

// ========== 工具栏 ==========
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.elder-select { width: 150px; }
.month-picker { width: 160px; }

// ========== 账单列表 ==========
.bill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bill-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  transition: box-shadow 0.2s, border-color 0.2s;
  gap: 16px;

  &:hover {
    border-color: rgba(244, 63, 94, 0.2);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }

  &.bill-done {
    opacity: 0.7;
  }
}

.bill-card-left {
  min-width: 120px;
}

.bill-cycle {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.bill-elder {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 3px;
}

.bill-time {
  font-size: 12px;
  color: #94a3b8;
}

.bill-card-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bill-items-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bill-pay-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #16a34a;
  .el-icon { color: #16a34a; }
}

.bill-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.bill-amount {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.amount-symbol {
  font-size: 14px;
  font-weight: 600;
  color: #be185d;
}

.amount-val {
  font-size: 22px;
  font-weight: 700;
  color: #be185d;
}

.bill-actions {
  display: flex;
  gap: 8px;
}

.btn-pay {
  background: linear-gradient(135deg, #be185d, #f43f5e);
  border: none;
  color: #fff;
  font-weight: 600;
  &:hover {
    background: linear-gradient(135deg, #9f1239, #be185d);
  }
}

// ========== 弹窗 ==========
.bill-summary {
  background: linear-gradient(135deg, #fdf2f8, #fff5f7);
  border: 1px solid rgba(244, 63, 94, 0.12);
  border-radius: 14px;
  padding: 20px 24px;
  text-align: center;
  margin-bottom: 20px;
}

.summary-cycle {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin-bottom: 12px;
}

.amount-symbol-lg {
  font-size: 18px;
  font-weight: 700;
  color: #be185d;
}

.amount-val-lg {
  font-size: 36px;
  font-weight: 800;
  color: #be185d;
}

.summary-status {
  display: flex;
  justify-content: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 16px;
  margin-bottom: 4px;
}

.info-item { }

.info-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.items-list {
  margin-bottom: 16px;
}

.bill-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f8fafc;
  margin-bottom: 6px;
}

.item-name {
  font-size: 14px;
  color: #334155;
}

.item-amount {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.items-empty {
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  padding: 20px 0;
}

.pay-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 16px 18px;
}

.notice-icon {
  color: #ea580c;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

.notice-title {
  font-size: 14px;
  font-weight: 700;
  color: #c2410c;
  margin-bottom: 6px;
}

.notice-text {
  font-size: 13px;
  color: #9a3412;
  line-height: 1.7;
}

// 支付确认弹窗
.pay-confirm-body {
  text-align: center;
  padding: 8px 0;
}

.pay-amount-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin-bottom: 20px;
}

.pay-symbol {
  font-size: 20px;
  font-weight: 700;
  color: #be185d;
}

.pay-val {
  font-size: 42px;
  font-weight: 800;
  color: #be185d;
}

.pay-meta {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 20px;
  margin-bottom: 16px;
  text-align: left;
}

.pay-meta-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.pay-meta-label {
  font-size: 13px;
  color: #94a3b8;
}

.pay-meta-val {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.pay-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
}

// 空状态
.empty-state {
  text-align: center;
  padding: 64px 0;
}

.empty-icon {
  font-size: 52px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
  color: #9ca3af;
}
</style>
