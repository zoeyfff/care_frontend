<template>
  <div>
    <h1 class="staff-page-title">入住与费用</h1>

    <el-tabs v-model="tab" type="border-card" class="staff-card tabs-wrap">
      <!-- 入住记录 -->
      <el-tab-pane label="入住记录" name="checkin">
        <div class="staff-toolbar">
          <span class="toolbar-title">在住长者入住档案</span>
          <el-button @click="loadCheckins">刷新</el-button>
        </div>
        <el-table :data="checkins" stripe border v-loading="loadingC" max-height="420">
          <el-table-column prop="elder_name" label="长者姓名" width="110" />
          <el-table-column prop="room_no" label="房间号" width="100" />
          <el-table-column prop="start_date" label="入住开始" width="120" />
          <el-table-column label="结束日期" width="120">
            <template #default="{ row }">{{ row.end_date || "—" }}</template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                {{ row.status === 1 ? "在住" : "已离院" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="建档时间" width="170" />
        </el-table>
        <el-empty v-if="!checkins.length && !loadingC" description="暂无入住记录" :image-size="60" />
      </el-tab-pane>

      <!-- 账单管理 -->
      <el-tab-pane label="账单管理" name="bill">
        <!-- 顶部工具栏 -->
        <div class="staff-toolbar" style="flex-wrap: wrap; gap: 8px">
          <el-date-picker
            v-model="billCycle"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择计费周期"
            style="width: 160px"
            @change="loadBills"
          />
          <el-button @click="loadBills">刷新账单</el-button>
          <el-button type="primary" @click="openGenerateDlg">
            生成月度账单
          </el-button>
          <el-button
            v-if="billCycle"
            type="warning"
            :loading="pushingEmail"
            @click="handlePushEmail"
          >
            推送账单邮件
          </el-button>
        </div>

        <!-- 统计卡片 -->
        <el-row :gutter="12" class="summary-row">
          <el-col :xs="12" :sm="6">
            <div class="summary-card">
              <div class="summary-icon" style="background: #ede9fe">
                <el-icon style="color: #7c3aed"><TrendCharts /></el-icon>
              </div>
              <div class="summary-info">
                <div class="summary-value">{{ stats.total_revenue?.toFixed(2) || "0.00" }}</div>
                <div class="summary-label">实收金额（元）</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="summary-card">
              <div class="summary-icon" style="background: #fee2e2">
                <el-icon style="color: #dc2626"><Clock /></el-icon>
              </div>
              <div class="summary-info">
                <div class="summary-value" style="color: #dc2626">{{ stats.total_unpaid?.toFixed(2) || "0.00" }}</div>
                <div class="summary-label">待收款（元）</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="summary-card">
              <div class="summary-icon" style="background: #dcfce7">
                <el-icon style="color: #16a34a"><CircleCheck /></el-icon>
              </div>
              <div class="summary-info">
                <div class="summary-value">{{ stats.paid_count || 0 }}</div>
                <div class="summary-label">已付账单</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="summary-card">
              <div class="summary-icon" style="background: #fef3c7">
                <el-icon style="color: #d97706"><Warning /></el-icon>
              </div>
              <div class="summary-info">
                <div class="summary-value">{{ stats.unpaid_count || 0 }}</div>
                <div class="summary-label">待付账单</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 月度趋势图 -->
        <div v-if="monthlyChartData.length" class="chart-block">
          <div class="chart-title">近12个月账单趋势</div>
          <v-chart class="chart-lg" :option="monthlyChartOption" autoresize />
        </div>

        <!-- 账单列表 -->
        <el-table :data="bills" stripe border v-loading="loadingB" max-height="380">
          <el-table-column prop="billing_cycle" label="计费周期" width="100" />
          <el-table-column prop="elder_name" label="长者姓名" width="110" />
          <el-table-column prop="room_no" label="房间" width="80" />
          <el-table-column label="账单金额" width="130">
            <template #default="{ row }">
              <span style="font-weight: 700; color: #7c3aed">
                ¥{{ Number(row.total_amount || 0).toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="邮件状态" width="110">
            <template #default="{ row }">
              <el-tag :type="row.email_sent ? 'success' : 'info'" size="small">
                {{ row.email_sent ? "已发送" : "未发送" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="支付状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
                {{ row.status === 1 ? "已支付" : "待支付" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="支付信息" width="140">
            <template #default="{ row }">
              <span v-if="row.status === 1" style="font-size: 12px; color: var(--staff-muted)">
                {{ row.pay_method || "—" }}
                <br />{{ row.paid_time?.slice(0, 16) || "" }}
              </span>
              <span v-else style="color: var(--staff-muted)">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="生成时间" width="160" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="showDetail(row)">明细</el-button>
              <el-button
                v-if="row.status === 0"
                link
                type="success"
                size="small"
                @click="openPayDlg(row)"
              >
                确认支付
              </el-button>
              <el-button
                link
                type="warning"
                size="small"
                @click="handlePushEmailOne(row)"
              >
                {{ row.email_sent ? "重发邮件" : "发邮件" }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!bills.length && !loadingB" description="暂无账单，请先点击「生成月度账单」" :image-size="60" />
      </el-tab-pane>

      <!-- 额外费用 -->
      <el-tab-pane label="额外费用" name="extra">
        <div class="staff-toolbar">
          <span class="toolbar-title">零星额外费用登记</span>
          <el-select
            v-model="extraElderId"
            placeholder="选择长者"
            clearable
            style="width: 160px"
            @change="loadExtraCharges"
          >
            <el-option v-for="e in elderOptions" :key="e.id" :label="e.name" :value="e.id" />
          </el-select>
          <el-date-picker
            v-model="extraCycle"
            type="month"
            value-format="YYYY-MM"
            placeholder="计费周期"
            style="width: 160px"
            @change="loadExtraCharges"
          />
          <el-button type="primary" plain @click="openExtraDlg">新增费用</el-button>
          <el-button @click="loadExtraCharges">刷新</el-button>
        </div>
        <el-table :data="extraCharges" stripe border v-loading="loadingE" max-height="380">
          <el-table-column prop="charge_date" label="发生日期" width="110" />
          <el-table-column prop="elder_name" label="长者" width="100" />
          <el-table-column prop="charge_type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.charge_type || "其他" }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="item_name" label="费用项目" min-width="160" show-overflow-tooltip />
          <el-table-column label="金额" width="120">
            <template #default="{ row }">
              <span style="font-weight: 600">¥{{ Number(row.amount || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="入账状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.billed ? 'success' : 'warning'" size="small">
                {{ row.billed ? "已入账" : "未入账" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creator_name" label="登记人" width="100" />
          <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="!row.billed"
                link
                type="danger"
                size="small"
                @click="doDeleteExtraCharge(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!extraCharges.length && !loadingE" description="暂无额外费用记录" :image-size="60" />
      </el-tab-pane>

      <!-- 费用标准 -->
      <el-tab-pane label="费用标准" name="standard">
        <div class="staff-toolbar">
          <span class="toolbar-title">当前生效的护理费与床位费标准</span>
          <el-button @click="loadStandards">刷新</el-button>
        </div>
        <el-row :gutter="16">
          <el-col :xs="24" :lg="12">
            <div class="staff-card" style="padding: 16px">
              <div class="sub-card-title">护理费标准（按护理等级）</div>
              <el-table :data="careStandards" stripe border size="small">
                <el-table-column prop="type_name" label="护理等级" width="140" />
                <el-table-column label="月度护理费" width="140" align="right">
                  <template #default="{ row }">¥{{ Number(row.care_fee || 0).toFixed(2) }}</template>
                </el-table-column>
                <el-table-column label="月度餐饮费" width="140" align="right">
                  <template #default="{ row }">¥{{ Number(row.meal_fee || 0).toFixed(2) }}</template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" min-width="120" />
              </el-table>
            </div>
          </el-col>
          <el-col :xs="24" :lg="12">
            <div class="staff-card" style="padding: 16px">
              <div class="sub-card-title">床位费标准（按房间类型）</div>
              <el-table :data="roomStandards" stripe border size="small">
                <el-table-column prop="type_name" label="房型" width="140" />
                <el-table-column label="月度床位费（/人）" width="180" align="right">
                  <template #default="{ row }">¥{{ Number(row.bed_fee || 0).toFixed(2) }}</template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" min-width="120" />
              </el-table>
            </div>
          </el-col>
        </el-row>
        <div class="staff-card" style="padding: 14px 16px; margin-top: 16px">
          <div class="sub-card-title">计费说明</div>
          <div class="bill-rule">
            <p>账单金额 = 床位费（按房间类型）+ 护理费（按护理等级）+ 餐饮费（固定）+ 额外费用（如有）</p>
            <p>每月1日系统为所有在住长者自动生成上月账单，也可手动选择月份生成。额外费用需在下月账单生成前完成登记。账单生成后自动统计至该月应收款。确认支付后录入支付方式（微信/支付宝/银行转账/现金）。</p>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 账单明细抽屉 -->
    <el-drawer v-model="detailDrawer" title="账单明细" size="440px">
      <el-descriptions v-if="currentBill" :column="1" border size="small">
        <el-descriptions-item label="长者姓名">{{ currentBill.elder_name }}</el-descriptions-item>
        <el-descriptions-item label="计费周期">{{ currentBill.billing_cycle }}</el-descriptions-item>
        <el-descriptions-item label="房间号">{{ currentBill.room_no || "—" }}</el-descriptions-item>
        <el-descriptions-item label="护理等级">{{ currentBill.care_level || "—" }}</el-descriptions-item>
        <el-descriptions-item label="生成时间">{{ currentBill.create_time }}</el-descriptions-item>
        <el-descriptions-item label="邮件状态">
          <el-tag :type="currentBill.email_sent ? 'success' : 'info'" size="small">
            {{ currentBill.email_sent ? "已发送 " + (currentBill.email_sent_time || "") : "未发送" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="currentBill.status === 1 ? 'success' : 'warning'" size="small">
            {{ currentBill.status === 1 ? "已支付" : "待支付" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentBill.status === 1" label="支付方式">
          {{ currentBill.pay_method || "—" }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentBill.status === 1" label="支付时间">
          {{ currentBill.paid_time || "—" }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentBill.operator_name || "—" }}</el-descriptions-item>
        <el-descriptions-item label="账单总额">
          <span style="font-size: 20px; font-weight: 700; color: #7c3aed">
            ¥{{ Number(currentBill.total_amount || 0).toFixed(2) }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <template v-if="currentBill && currentBill.items && currentBill.items.length">
        <el-divider>费用明细</el-divider>
        <el-table :data="currentBill.items" stripe border size="small">
          <el-table-column prop="item_name" label="费用项目" min-width="160" />
          <el-table-column label="金额" width="130" align="right">
            <template #default="{ row }">
              ¥{{ Number(row.amount || 0).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>

    <!-- 生成月度账单弹窗 -->
    <el-dialog v-model="generateDlg" title="生成月度账单" width="420px" destroy-on-close>
      <el-form-item label="计费周期" required>
        <el-date-picker
          v-model="generateCycle"
          type="month"
          value-format="YYYY-MM"
          placeholder="选择月份"
          style="width: 100%"
        />
      </el-form-item>
      <div class="gen-tip">
        将为所有在住长者生成所选月份的账单（已生成的会自动跳过）。<br>
        费用项包含：床位费 + 护理费 + 餐饮费 + 本月额外费用。
      </div>
      <template #footer>
        <el-button @click="generateDlg = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="confirmGenerate">
          确认生成
        </el-button>
      </template>
    </el-dialog>

    <!-- 确认支付弹窗 -->
    <el-dialog v-model="payDlg" title="确认收款" width="380px" destroy-on-close>
      <div style="text-align: center; padding: 12px 0 20px">
        <div style="font-size: 14px; color: var(--staff-muted); margin-bottom: 8px">确认收款金额</div>
        <div style="font-size: 32px; font-weight: 700; color: #7c3aed">
          ¥{{ Number(payTarget?.total_amount || 0).toFixed(2) }}
        </div>
        <div style="font-size: 13px; color: var(--staff-muted); margin-top: 4px">
          {{ payTarget?.elder_name }} · {{ payTarget?.billing_cycle }}月账单
        </div>
      </div>
      <el-form label-width="80px">
        <el-form-item label="支付方式" required>
          <el-select v-model="payMethod" placeholder="请选择" style="width: 100%">
            <el-option label="微信支付" value="微信支付" />
            <el-option label="支付宝" value="支付宝" />
            <el-option label="银行转账" value="银行转账" />
            <el-option label="现金" value="现金" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="payDlg = false">取消</el-button>
        <el-button type="primary" :loading="payingBill" @click="confirmPayBill">确认收款</el-button>
      </template>
    </el-dialog>

    <!-- 新增额外费用弹窗 -->
    <el-dialog v-model="extraDlg" title="登记额外费用" width="480px" destroy-on-close>
      <el-form :model="extraForm" label-width="90px">
        <el-form-item label="长者" required>
          <el-select v-model="extraForm.elder_id" placeholder="请选择长者" style="width: 100%">
            <el-option v-for="e in elderOptions" :key="e.id" :label="e.name" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="发生日期" required>
          <el-date-picker
            v-model="extraForm.charge_date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="费用类型" required>
          <el-select v-model="extraForm.charge_type" placeholder="请选择" style="width: 100%">
            <el-option label="医疗" value="医疗" />
            <el-option label="药品" value="药品" />
            <el-option label="材料" value="材料" />
            <el-option label="餐费" value="餐费" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称" required>
          <el-input v-model="extraForm.item_name" placeholder="如：CT检查、特殊护理垫" maxlength="200" />
        </el-form-item>
        <el-form-item label="金额（元）" required>
          <el-input-number v-model="extraForm.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="extraForm.remark" type="textarea" :rows="2" maxlength="255" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="extraDlg = false">取消</el-button>
        <el-button type="primary" :loading="savingExtra" @click="confirmAddExtra">确认登记</el-button>
      </template>
    </el-dialog>

    <!-- 邮件发送结果详情弹窗 -->
    <el-dialog v-model="emailResultDlg" title="邮件发送结果" width="560px" destroy-on-close>
      <div v-if="emailResult">
        <el-alert
          :title="`发送完成：成功 ${emailResult.sent_count || 0} 封，失败 ${emailResult.failed_count || 0} 封`"
          :type="emailResult.failed_count > 0 ? 'warning' : 'success'"
          :closable="false"
          show-icon
          style="margin-bottom: 14px; border-radius: 6px"
        />
        <el-table :data="emailResult.results || []" stripe border size="small" max-height="340">
          <el-table-column prop="elder_name" label="长者" width="100" />
          <el-table-column prop="family_name" label="家属" width="100" />
          <el-table-column prop="email" label="收件邮箱" min-width="160" show-overflow-tooltip />
          <el-table-column label="状态" width="70">
            <template #default="{ row }">
              <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="原因" min-width="120" show-overflow-tooltip />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="emailResultDlg = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";
import {
  TrendCharts,
  CircleCheck,
  Clock,
  Warning,
} from "@element-plus/icons-vue";
import {
  getBills,
  getBillDetail,
  generateBills,
  getBillStats,
  getBillMonthlyStats,
  payBillByStaff,
  pushBillEmail,
  getExtraCharges,
  addExtraCharge,
  deleteExtraCharge,
  getBillingStandards,
  getCheckins,
  getElderList,
} from "@/api/staffApi";
import store from "@/store";

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent]);

const tab = ref("checkin");
const loadingC = ref(false);
const loadingB = ref(false);
const loadingE = ref(false);

// 入住记录
const checkins = ref([]);

// 账单
const billCycle = ref("");
const bills = ref([]);
const stats = ref({});
const monthlyChartData = ref([]);
const detailDrawer = ref(false);
const currentBill = ref(null);

// 生成月度账单
const generateDlg = ref(false);
const generateCycle = ref("");
const generating = ref(false);

// 确认支付
const payDlg = ref(false);
const payTarget = ref(null);
const payMethod = ref("微信支付");
const payingBill = ref(false);

// 额外费用
const extraElderId = ref(null);
const extraCycle = ref("");
const extraCharges = ref([]);
const extraDlg = ref(false);
const extraForm = reactive({
  elder_id: null,
  charge_date: "",
  charge_type: "医疗",
  item_name: "",
  amount: 0,
  remark: "",
});
const savingExtra = ref(false);

// 费用标准
const careStandards = ref([]);
const roomStandards = ref([]);

// 邮件推送
const pushingEmail = ref(false);

// 长者选项
const elderOptions = ref([]);

// ========== 图表 ==========
const monthlyChartOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: "5%", right: "5%", bottom: "12%", top: "12%", containLabel: true },
  legend: { data: ["实收", "待收"], bottom: 0 },
  xAxis: {
    type: "category",
    data: monthlyChartData.value.map((v) => v.billing_cycle?.slice(5) || ""),
    axisLabel: { fontSize: 11 },
  },
  yAxis: { type: "value", axisLabel: { fontSize: 11, formatter: (v) => "¥" + v } },
  series: [
    {
      name: "实收",
      type: "bar",
      itemStyle: { color: "#16a34a" },
      data: monthlyChartData.value.map((v) => Number(v.paid_amount || 0)),
    },
    {
      name: "待收",
      type: "bar",
      itemStyle: { color: "#d97706" },
      data: monthlyChartData.value.map((v) => Number(v.unpaid_amount || 0)),
    },
  ],
}));

// ========== 入住记录 ==========
async function loadCheckins() {
  loadingC.value = true;
  try {
    const res = await getCheckins();
    checkins.value = res?.list || [];
  } catch {
    checkins.value = [];
  } finally {
    loadingC.value = false;
  }
}

// ========== 长者选项（用于额外费用登记） ==========
async function loadElderOptions() {
  try {
    const res = await getElderList();
    elderOptions.value = res?.list || [];
  } catch {
    elderOptions.value = [];
  }
}

// ========== 账单 ==========
async function loadBills() {
  loadingB.value = true;
  try {
    const params = billCycle.value ? { billing_cycle: billCycle.value } : {};
    const [billRes, statsRes, chartRes] = await Promise.all([
      getBills(params),
      getBillStats(billCycle.value || undefined),
      getBillMonthlyStats(),
    ]);
    bills.value = billRes?.list || billRes || [];
    stats.value = statsRes || {};
    monthlyChartData.value = chartRes?.list || chartRes || [];
  } finally {
    loadingB.value = false;
  }
}

async function showDetail(row) {
  const res = await getBillDetail(row.id);
  currentBill.value = res || row;
  detailDrawer.value = true;
}

// ========== 生成账单 ==========
function openGenerateDlg() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  generateCycle.value = prev.toISOString().slice(0, 7);
  generateDlg.value = true;
}

async function confirmGenerate() {
  if (!generateCycle.value) {
    ElMessage.warning("请选择计费周期");
    return;
  }
  generating.value = true;
  try {
    const res = await generateBills(generateCycle.value);
    const d = res || {};
    ElMessage.success(
      `账单生成完成！共生成 ${d.generated_count || 0} 条，`
        + `跳过 ${d.skipped_count || 0} 条（已存在）`
    );
    generateDlg.value = false;
    billCycle.value = generateCycle.value;
    loadBills();
  } catch (e) {
    ElMessage.error("生成失败：" + (e?.message || "未知错误"));
  } finally {
    generating.value = false;
  }
}

// ========== 确认支付 ==========
function openPayDlg(row) {
  payTarget.value = row;
  payMethod.value = "微信支付";
  payDlg.value = true;
}

async function confirmPayBill() {
  if (!payMethod.value) {
    ElMessage.warning("请选择支付方式");
    return;
  }
  payingBill.value = true;
  try {
    await payBillByStaff(payTarget.value.id, payMethod.value);
    ElMessage.success("收款确认成功！");
    payDlg.value = false;
    detailDrawer.value = false;
    loadBills();
  } catch (e) {
    ElMessage.error("操作失败：" + (e?.message || "未知错误"));
  } finally {
    payingBill.value = false;
  }
}

// ========== 邮件推送 ==========
const emailResultDlg = ref(false);
const emailResult = ref(null);

async function handlePushEmail() {
  if (!billCycle.value) {
    ElMessage.warning("请先选择计费周期");
    return;
  }
  pushingEmail.value = true;
  try {
    const res = await pushBillEmail(billCycle.value);
    const d = res || {};
    emailResult.value = d;
    emailResultDlg.value = true;
    loadBills();
  } catch (e) {
    ElMessage.error("邮件推送失败：" + (e?.message || "未知错误"));
  } finally {
    pushingEmail.value = false;
  }
}

async function handlePushEmailOne(row) {
  pushingEmail.value = true;
  try {
    const res = await pushBillEmail(row.id);
    const d = (res || {});
    emailResult.value = d;
    emailResultDlg.value = true;
    loadBills();
  } catch (e) {
    ElMessage.error("邮件发送失败：" + (e?.message || "未知错误"));
  } finally {
    pushingEmail.value = false;
  }
}

// ========== 额外费用 ==========
async function loadExtraCharges() {
  loadingE.value = true;
  try {
    const params = {};
    if (extraElderId.value) params.elder_id = extraElderId.value;
    if (extraCycle.value) params.billing_cycle = extraCycle.value;
    const res = await getExtraCharges(params);
    extraCharges.value = res?.list || res || [];
  } finally {
    loadingE.value = false;
  }
}

function openExtraDlg() {
  Object.assign(extraForm, { elder_id: null, charge_date: "", charge_type: "医疗", item_name: "", amount: 0, remark: "" });
  extraDlg.value = true;
}

async function confirmAddExtra() {
  if (!extraForm.elder_id || !extraForm.item_name || extraForm.amount <= 0) {
    ElMessage.warning("请填写完整信息（长者、项目名称、金额）");
    return;
  }
  savingExtra.value = true;
  try {
    await addExtraCharge(extraForm);
    ElMessage.success("额外费用登记成功，将计入下月账单");
    extraDlg.value = false;
    loadExtraCharges();
  } catch (e) {
    ElMessage.error("登记失败：" + (e?.message || "未知错误"));
  } finally {
    savingExtra.value = false;
  }
}

async function doDeleteExtraCharge(row) {
  try {
    await deleteExtraCharge(row.id);
    ElMessage.success("删除成功");
    loadExtraCharges();
  } catch {
    ElMessage.error("删除失败");
  }
}

// ========== 费用标准 ==========
async function loadStandards() {
  try {
    const res = await getBillingStandards();
    const d = res || {};
    careStandards.value = d.care || [];
    roomStandards.value = d.room || [];
  } catch {
    careStandards.value = [];
    roomStandards.value = [];
  }
}

onMounted(async () => {
  // 等待 session 恢复完成（确保 token 已加载）
  if (!store.state.user) {
    await store.dispatch("restoreSession");
  }
  loadCheckins();
  loadBills();
  loadExtraCharges();
  loadStandards();
  loadElderOptions();
});
</script>
<style lang="scss" scoped>
.tabs-wrap {
  border-radius: var(--staff-radius);
  overflow: hidden;
  box-shadow: var(--staff-card-shadow);
  padding: 0;
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

.summary-row {
  margin-bottom: 14px;
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

.chart-block {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 14px;
  border: 1px solid var(--el-border-color-lighter);
}

.chart-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--staff-text);
  margin-bottom: 12px;
}

.chart-lg {
  height: 200px;
  width: 100%;
}

.sub-card-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--staff-text);
  margin-bottom: 12px;
}

.bill-rule {
  font-size: 13px;
  color: var(--staff-muted);
  line-height: 1.8;

  p {
    margin: 0 0 6px;
  }
}

.gen-tip {
  background: #f0fdf4;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 13px;
  color: #166534;
  line-height: 1.7;
  margin-top: 8px;
}
</style>