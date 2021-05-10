import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import contest from './modules/contest'
import api from '@oj/api'
import types from './types'

Vue.use(Vuex)
const debug = process.env.NODE_ENV !== 'production'

// 保存 网站和模态框状态 信息
const rootState = {
  website: {},
  modalStatus: {
    mode: 'login', // or 'register',
    visible: false
  }
}

// 获取 网站和模态框状态 信息
const rootGetters = {
  'website' (state) {
    return state.website
  },
  'modalStatus' (state) {
    return state.modalStatus
  }
}

const rootMutations = {
  // 获取网站配置
  [types.UPDATE_WEBSITE_CONF] (state, payload) {
    state.website = payload.websiteConfig
  },
  // 改变模态框的状态：登录或者注册
  [types.CHANGE_MODAL_STATUS] (state, {mode, visible}) {
    if (mode !== undefined) {
      state.modalStatus.mode = mode
    }
    if (visible !== undefined) {
      state.modalStatus.visible = visible
    }
  }
}

const rootActions = {
  // 获取网站配置
  getWebsiteConfig ({commit}) {
    api.getWebsiteConf().then(res => {
      commit(types.UPDATE_WEBSITE_CONF, {
        websiteConfig: res.data.data
      })
    })
  },
  // 改变模态框的状态：登录或者注册
  changeModalStatus ({commit}, payload) {
    commit(types.CHANGE_MODAL_STATUS, payload)
  },
  // 改变网站标题
  changeDomTitle ({commit, state}, payload) {
    if (payload && payload.title) {
      window.document.title = state.website.websiteNameShortcut + ' | ' + payload.title
    } else {
      window.document.title = state.website.websiteNameShortcut + ' | ' + state.route.meta.title
    }
  }
}

export default new Vuex.Store({
  modules: {
    user,
    contest
  },
  state: rootState,
  getters: rootGetters,
  mutations: rootMutations,
  actions: rootActions,
  strict: debug
})

export { types }
