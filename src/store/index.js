import { createStore } from "vuex";

export default createStore({
  state: {
    sidebarCollapse: false,
    user: null,
    portal: "staff", // staff | nurse（演示：登录选择）
  },
  getters: {
    displayName: (s) => s.user?.real_name || s.user?.username || "工作人员",
    portal: (s) => s.portal,
  },
  mutations: {
    SET_SIDEBAR(state, v) {
      state.sidebarCollapse = v;
    },
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapse = !state.sidebarCollapse;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_PORTAL(state, portal) {
      state.portal = portal || "staff";
    },
    CLEAR_USER(state) {
      state.user = null;
    },
  },
  actions: {
    loginDemo({ commit }, { username, portal }) {
      localStorage.setItem("staff_token", "demo-token");
      localStorage.setItem("staff_username", username);
      localStorage.setItem("staff_portal", portal || "staff");
      commit("SET_PORTAL", portal || "staff");
      commit("SET_USER", {
        id: 1,
        username,
        real_name: username === "admin" ? "系统管理员" : "工作人员",
      });
    },
    restoreSession({ commit }) {
      const username = localStorage.getItem("staff_username") || "admin";
      const portal = localStorage.getItem("staff_portal") || "staff";
      commit("SET_PORTAL", portal);
      commit("SET_USER", {
        id: 1,
        username,
        real_name: username === "admin" ? "系统管理员" : "工作人员",
      });
    },
    logout({ commit }) {
      localStorage.removeItem("staff_token");
      localStorage.removeItem("staff_username");
      localStorage.removeItem("staff_portal");
      commit("CLEAR_USER");
    },
  },
  modules: {},
});
