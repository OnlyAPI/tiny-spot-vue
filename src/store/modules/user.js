import { login, logout, getInfo } from '@/api/login/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permission: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSION: (state, permissions) => {
    state.permission = permissions
  }
}

const actions = {
  // user login
  Login({ commit }, userInfo) {
    const { username, password, uuid, code } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password, uuid: uuid, code: code }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data)
        setToken(data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  GetInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { userInfo, roles, permissions } = data

        commit('SET_ROLES', roles)
        commit('SET_PERMISSION', permissions)
        commit('SET_NAME', userInfo.nickName)
        commit('SET_AVATAR', userInfo.icon)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 设置token
  ReSetToken({ commit }, newToken) {
    return new Promise(resolve => {
      commit('SET_TOKEN', newToken)
      setToken(newToken)
      resolve()
    })
  },

  // user logout
  Logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  ResetToken({ commit }) {
    return new Promise(resolve => {
      commit('RESET_STATE')
      removeToken() // must remove  token  first
      resetRouter()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

