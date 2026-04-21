/**
 * 工作人员端 API 层：通过环境变量控制是否使用本地 Mock。
 */
import request from "@/utils/request";
import {
  mockElders,
  mockCareTasks,
  mockHealthRecords,
  mockMedicationRecords,
  mockCheckins,
  mockBills,
  mockFeedbacks,
  mockNotices,
  mockActivities,
  mockFiles,
  mockRooms,
  mockHandovers,
  mockIncidents,
  mockUsers,
  mockRoles,
  mockPermissions,
  staffMockApi,
} from "@/mock/staffData";

// Vue CLI 环境变量：`.env*` 中以 VUE_APP_ 开头的变量才会被注入
// - VUE_APP_USE_MOCK=true/false
// 默认 false：优先对接后端真实接口
export const USE_MOCK =
  String(process.env.VUE_APP_USE_MOCK || "false") === "true";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export async function getDashboardStats() {
  if (USE_MOCK) return staffMockApi.getDashboardStats();
  const { data } = await request.get("/staff/dashboard/stats");
  return data;
}

export async function getElderList(params = {}) {
  if (USE_MOCK) {
    let list = clone(mockElders);
    if (params.keyword) {
      const k = params.keyword.trim();
      list = list.filter(
        (e) =>
          e.name.includes(k) ||
          (e.room_no && e.room_no.includes(k)) ||
          (e.id_card && e.id_card.includes(k))
      );
    }
    return { list, total: list.length };
  }
  const { data } = await request.get("/elders", { params });
  return data;
}

export async function saveElder(payload) {
  if (USE_MOCK) {
    return { id: payload.id || Date.now(), ...payload };
  }
  if (payload.id) {
    const { data } = await request.put(`/elders/${payload.id}`, payload);
    return data;
  }
  const { data } = await request.post("/elders", payload);
  return data;
}

export async function deleteElder(id) {
  if (USE_MOCK) return { ok: true };
  await request.delete(`/elders/${id}`);
  return { ok: true };
}

export async function getCareTasks(params = {}) {
  if (USE_MOCK) {
    let list = clone(mockCareTasks);
    if (params.status !== undefined && params.status !== "") {
      list = list.filter((t) => t.status === Number(params.status));
    }
    return { list, total: list.length };
  }
  const { data } = await request.get("/care-tasks", { params });
  return data;
}

export async function saveCareTask(payload) {
  if (USE_MOCK) return { id: payload.id || Date.now(), ...payload };
  if (payload.id) {
    const { data } = await request.put(`/care-tasks/${payload.id}`, payload);
    return data;
  }
  const { data } = await request.post("/care-tasks", payload);
  return data;
}

export async function getHealthRecords() {
  if (USE_MOCK)
    return { list: clone(mockHealthRecords), total: mockHealthRecords.length };
  const { data } = await request.get("/health-records");
  return data;
}

export async function saveHealthRecord(payload) {
  if (USE_MOCK) return { id: Date.now(), ...payload };
  const { data } = await request.post("/health-records", payload);
  return data;
}

export async function getMedicationRecords() {
  if (USE_MOCK)
    return {
      list: clone(mockMedicationRecords),
      total: mockMedicationRecords.length,
    };
  const { data } = await request.get("/medication-records");
  return data;
}

export async function saveMedicationRecord(payload) {
  if (USE_MOCK) return { id: Date.now(), ...payload };
  const { data } = await request.post("/medication-records", payload);
  return data;
}

export async function getCheckins() {
  if (USE_MOCK)
    return { list: clone(mockCheckins), total: mockCheckins.length };
  const { data } = await request.get("/checkins");
  return data;
}

export async function getBills() {
  if (USE_MOCK) return { list: clone(mockBills), total: mockBills.length };
  const { data } = await request.get("/bills");
  return data;
}

export async function getFeedbacks() {
  if (USE_MOCK)
    return { list: clone(mockFeedbacks), total: mockFeedbacks.length };
  const { data } = await request.get("/feedbacks");
  return data;
}

export async function replyFeedback(id, reply) {
  if (USE_MOCK) return { id, reply };
  const { data } = await request.patch(`/feedbacks/${id}/reply`, { reply });
  return data;
}

export async function getNotices() {
  if (USE_MOCK) return { list: clone(mockNotices), total: mockNotices.length };
  const { data } = await request.get("/notices");
  return data;
}

export async function getActivities() {
  if (USE_MOCK)
    return { list: clone(mockActivities), total: mockActivities.length };
  const { data } = await request.get("/activities");
  return data;
}

export async function getFiles() {
  if (USE_MOCK) return { list: clone(mockFiles), total: mockFiles.length };
  const { data } = await request.get("/files");
  return data;
}

export async function getRoomList(params = {}) {
  if (USE_MOCK) {
    let list = clone(mockRooms);
    if (params.keyword) {
      const k = String(params.keyword).trim();
      list = list.filter(
        (r) =>
          (r.room_no && r.room_no.includes(k)) ||
          (r.building && r.building.includes(k))
      );
    }
    if (
      params.status !== undefined &&
      params.status !== "" &&
      params.status !== null
    ) {
      list = list.filter((r) => r.status === Number(params.status));
    }
    return { list, total: list.length };
  }
  const { data } = await request.get("/rooms", { params });
  return data;
}

export async function saveRoom(payload) {
  if (USE_MOCK) return { id: payload.id || Date.now(), ...payload };
  if (payload.id) {
    const { data } = await request.put(`/rooms/${payload.id}`, payload);
    return data;
  }
  const { data } = await request.post("/rooms", payload);
  return data;
}

export async function deleteRoom(id) {
  if (USE_MOCK) return { ok: true };
  await request.delete(`/rooms/${id}`);
  return { ok: true };
}

export async function getUsers() {
  if (USE_MOCK) return { list: clone(mockUsers), total: mockUsers.length };
  const { data } = await request.get("/users");
  return data;
}

export async function getRoles() {
  if (USE_MOCK) return { list: clone(mockRoles), total: mockRoles.length };
  const { data } = await request.get("/roles");
  return data;
}

export async function getPermissions() {
  if (USE_MOCK)
    return { list: clone(mockPermissions), total: mockPermissions.length };
  const { data } = await request.get("/permissions");
  return data;
}

// ==================== 护理端 API（与 /nurse 页面对应） ====================

export async function getNurseDashboardStats() {
  if (USE_MOCK) {
    const taskTodo = mockCareTasks.filter((t) => t.status === 0).length;
    const medDue = mockMedicationRecords.filter((m) => m.status === 0).length;
    const vitalAbnormal = mockHealthRecords.filter((r) => {
      const t = Number(r.temperature);
      return !Number.isNaN(t) && t >= 37.3;
    }).length;
    const handoverUnread = mockHandovers.filter(
      (h) => h.read_status === 0
    ).length;
    return { taskTodo, medDue, vitalAbnormal, handoverUnread };
  }
  const { data } = await request.get("/nurse/dashboard/stats");
  return data;
}

export async function getNurseTasks(params = {}) {
  // 目前与护理任务同源；后端建议按 nurse_id/班次/区域过滤
  if (USE_MOCK) {
    let list = clone(mockCareTasks);
    if (
      params.status !== undefined &&
      params.status !== "" &&
      params.status !== null
    ) {
      list = list.filter((t) => t.status === Number(params.status));
    }
    return { list, total: list.length };
  }
  const { data } = await request.get("/nurse/tasks", { params });
  return data;
}

export async function getNurseMedications(params = {}) {
  if (USE_MOCK) {
    let list = clone(mockMedicationRecords);
    if (
      params.status !== undefined &&
      params.status !== "" &&
      params.status !== null
    ) {
      list = list.filter(
        (m) => Number(m.status || 0) === Number(params.status)
      );
    }
    return { list, total: list.length };
  }
  const { data } = await request.get("/nurse/medications", { params });
  return data;
}

export async function markMedicationDone(id) {
  if (USE_MOCK) return { ok: true };
  const { data } = await request.patch(`/nurse/medications/${id}/done`);
  return data;
}

export async function getHandovers(params = {}) {
  if (USE_MOCK)
    return { list: clone(mockHandovers), total: mockHandovers.length };
  const { data } = await request.get("/nurse/handovers", { params });
  return data;
}

export async function saveHandover(payload) {
  if (USE_MOCK) return { id: payload.id || Date.now(), ...payload };
  if (payload.id) {
    const { data } = await request.put(
      `/nurse/handovers/${payload.id}`,
      payload
    );
    return data;
  }
  const { data } = await request.post("/nurse/handovers", payload);
  return data;
}

export async function deleteHandover(id) {
  if (USE_MOCK) return { ok: true };
  await request.delete(`/nurse/handovers/${id}`);
  return { ok: true };
}

export async function getIncidents(params = {}) {
  if (USE_MOCK)
    return { list: clone(mockIncidents), total: mockIncidents.length };
  const { data } = await request.get("/nurse/incidents", { params });
  return data;
}

export async function saveIncident(payload) {
  if (USE_MOCK) return { id: Date.now(), status: 0, ...payload };
  const { data } = await request.post("/nurse/incidents", payload);
  return data;
}

export async function markIncidentDone(id) {
  if (USE_MOCK) return { ok: true };
  const { data } = await request.patch(`/nurse/incidents/${id}/done`);
  return data;
}

export async function deleteIncident(id) {
  if (USE_MOCK) return { ok: true };
  await request.delete(`/nurse/incidents/${id}`);
  return { ok: true };
}
