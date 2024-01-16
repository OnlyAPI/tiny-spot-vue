<template>
  <div class="app-container">
    <div class="chat-app">
      <div class="friends-list">
        <div class="create-session">
          <div class="create-session-text" @click="openConversation">新建聊天</div>
        </div>
        <div v-if="conversations.length <= 0" class="empty-friends-list">
          <img src="@/assets/image/empty-friends-list.png" alt="avatar"/>
        </div>
        <div v-else ref="scrollbar-wrap" class="scrollbar-wrap">
          <div v-for="conversation in conversations"
               :key="conversation.conversationId"
               class="friend-item"
               :class="{ 'friend-item-click': (currConversationInfo != null && conversation.conversationId === currConversationInfo.conversationId) }"
               @click="sotreConversationInfo(conversation)"
               @contextmenu.prevent.stop="conversationHandleRightClick($event, conversation.conversationId)">
            <img :src="conversation.avatar" alt="avatar" class="friend-avatar">
            <div class="friend-info">
              <span class="friend-name" :title="conversation.name">{{ conversation.name }}</span>
              <p class="friend-last-message" :title="conversation.lastMessage">{{ conversation.lastMessage }}</p>
            </div>
            <span class="friend-last-message-time">{{ conversation.lastMessageTime }}</span>
          </div>
        </div>
      </div>
      <div class="chat-box">
        <div v-if="currConversationInfo != null" class="message-header">
          <div class="message-header-name">{{ currConversationInfo.name }}</div>
          <div class="message-header-icon">
            <i class="el-icon-more-outline"></i>
          </div>
        </div>
        <div ref="message-display" class="message-display">
          <div v-if="currConversationInfo === null" class="empty-message">
            <img src="@/assets/image/empty-message.png">
          </div>
          <div v-for="message in history" v-else :key="message.messageId" class="message" :class="{ 'mine': message.isMine }">
            <div class="message-img">
              <img :src="message.isMine? myInfo.icon: currConversationInfo.avatar" class="message-avatar">
            </div>
            <div class="message-content-time">
              <span class="message-time">{{ message.time }}</span>
              <span v-if="!message.isMine" class="message-content">
                <v-md-preview :text="message.content"></v-md-preview>
              </span>
              <span v-else class="message-content">
                {{ message.content }}
              </span>
            </div>
          </div>
          <div v-if="isAiAnswering" class="message">
            <div class="message-img">
              <img :src="currConversationInfo.avatar" class="message-avatar">
            </div>
            <div class="message-content-time">
              <span class="message-time"></span>
              <span class="message-content">{{ aiMsg }}</span>
            </div>
          </div>
        </div>
        <div class="message-input">
          <el-input
            ref="input"
            v-model="newMessage"
            maxlength="1000"
            show-word-limit
            suffix-icon="el-icon-s-promotion"
            :placeholder="placeHolder"
            :disabled="currConversationInfo === null || isAiAnswering"
            @keyup.enter.native="sendMessage"
          />
        </div>
      </div>
    </div>

    <!-- 创建会话弹出层-->
    <el-dialog :before-close="handleClose" :visible.sync="open" :center="true" :show-close="false" width="500px" append-to-body>
      <div style="height: 350px">
        <div class="form-item">
          <div class="lable">聊天名称</div>
          <input v-model="chatName" type="text" placeholder="请输入聊天名称"/>
        </div>
        <div style="display:flex; padding-right: 54px;">
          <div class="ai-robot-title">AI模型</div>
          <div class="ai-robot">
            <div v-for="robot in aiRobot" :key="robot.id" class="ai-robot-card" :class="{ 'ai-robot-card-click': (currentRobot !== null && robot.id === currentRobot.id) }" @click="selectRobot(robot)">
              <img :src="robot.avatar" alt="avatar">
              <div style="margin-left: 5px;width: 200px">
                <span class="robot-name">{{ robot.name }}</span>
                <span class="robot-desc" :title="robot.description">{{ robot.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="start-chat" @click="startChat">开始聊天</div>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getInfo } from '@/api/login/login'
import { getWsToken } from '@/api/chat/wsToken'
import { getAiRobotList, createConversation, queryConversationList, queryConversationInfoByCId, getAiConversationHistoryList, delConversation } from '@/api/chat/ai'

export default {
  name: 'Chat',
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_WEB_SOCKET_API,
      conversations: [], // 会话列表
      history: [], // 会话聊天记录
      aiMsg: '',
      isAiAnswering: false, // Ai正在回答？
      newMessage: '', // 输入的消息
      currConversationInfo: null, // 当前选中的会话信息
      myInfo: null,
      placeHolder: '',
      wstoken: '',
      socket: null,
      isConnected: false,
      wsReqMsg: { type: '', mark: '', text: '', conversationId: '' },

      // 创建对话弹出层
      title: '新建对话',
      open: false,
      form: {},

      aiRobot: [], // ai模型,
      currentRobot: null,

      chatName: '', // 聊天名称
      showPopup: false
    }
  },
  created() {
    this.getUser()
    this.getConversations()
    this.initWebSocket()
  },
  destroyed() {
    this.closeWebSocket()
  },
  methods: {
    initWebSocket() {
      getWsToken().then(response => {
        this.wstoken = response.data.wstoken
        if (this.wstoken !== '') {
          if (this.socket === null || this.socket.readyState !== WebSocket.OPEN) {
            this.connWebSocket()
          }
        }
      })
    },
    connWebSocket() {
      this.socket = new WebSocket(this.baseUrl + '/websocket/' + this.wstoken)
      this.socket.onopen = () => {
        this.isConnected = true
        console.log('WebSocket connected')
      }
      this.socket.onmessage = (event) => {
        const message = event.data
        console.log('Received message:', message)
        const msgJson = JSON.parse(message)
        if (msgJson.type === 'resp_ai_chat') {
          if (msgJson.data === '[END]') {
            const message = { id: Date.now(), content: this.aiMsg, isMine: false, time: new Date().toLocaleTimeString().slice(0, 5) }
            this.history.push(message)
            this.aiMsg = ''
            this.scrollToBottom()
            this.isAiAnswering = false
            this.focusInput()
          } else {
            this.aiMsg += msgJson.data
          }
        }
      }
      this.socket.onclose = () => {
        this.isConnected = false
        console.log('WebSocket disconnected')
        // Message({ message: '与服务器断开连接', type: 'error' })
      }
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    },
    closeWebSocket() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close()
        this.socket = null
      }
    },
    sendWebSocketMsg() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.wsReqMsg.type = this.currConversationInfo.type
        this.wsReqMsg.text = this.newMessage
        this.wsReqMsg.mark = this.currConversationInfo.mark
        this.wsReqMsg.conversationId = this.currConversationInfo.conversationId
        this.socket.send(JSON.stringify(this.wsReqMsg))
      } else {
        console.error('WebSocket未打开，无法发送消息')
      }
    },
    getUser() {
      getInfo().then(response => {
        this.myInfo = response.data.userInfo
      })
    },
    scrollToTop() {
      if (this.conversations.length > 0) {
        this.$nextTick(() => {
          this.$refs['scrollbar-wrap'].scrollTop = 0
        })
      }
    },
    // 移动到聊天底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs['message-display'].scrollTop = this.$refs['message-display'].scrollHeight
      })
    },
    sotreConversationInfo(conversation) {
      this.currConversationInfo = conversation
      this.placeHolder = '发送给 ' + conversation.name
      this.getHistoryMessage()
      this.scrollToBottom()
      // setTimeout(() => {
      //   this.scrollToBottom()
      // }, 500)
    },
    openConversation() {
      this.currentRobot = null
      this.open = true
      getAiRobotList().then(response => {
        this.aiRobot = response.data
      })
    },
    getConversations() {
      queryConversationList().then(response => {
        // console.log('result=' + response.data)
        this.conversations = response.data
      })
    },
    getHistoryMessage() {
      getAiConversationHistoryList(this.currConversationInfo.conversationId).then(response => {
        this.history = response.data
      })
    },
    sendMessage() {
      if (!this.newMessage || this.newMessage.trim().length <= 0) {
        this.newMessage = ''
        Message({ message: '不能发送空白消息', type: 'warning' })
        return
      }
      // 假设所有发送的消息都是当前用户的
      const message = { id: Date.now(), content: this.newMessage, isMine: true, time: new Date().toLocaleTimeString().slice(0, 5) }
      this.currConversationInfo.lastMessage = this.newMessage
      this.currConversationInfo.lastMessageTime = message.time
      this.history.push(message)
      this.sendWebSocketMsg()
      this.scrollToBottom()
      this.newMessage = ''
      this.isAiAnswering = this.currConversationInfo.isAi
    },
    // 焦点回到输入框
    focusInput() {
      setTimeout(() => {
        this.$refs.input.focus()
      }, 0)
    },
    selectRobot(robot) {
      this.currentRobot = robot
    },
    handleClose() {
      this.chatName = ''
      this.currentRobot = null
      this.open = false
    },
    startChat() {
      if (this.currentRobot === null) {
        Message({ message: '请选择一个AI模型', type: 'warning' })
        return
      }
      if (this.chatName.trim().length > 0) {
        if (this.chatName.trim().length < 2 || this.chatName.trim().length > 10) {
          Message({ message: '聊天名称在2-10字之间', type: 'warning' })
          return
        } else {
          this.form.name = this.chatName.trim()
        }
      }
      this.form.robotId = this.currentRobot.id
      createConversation(this.form).then(response => {
        queryConversationInfoByCId(response.data).then(response => {
          this.sotreConversationInfo(response.data)
          this.scrollToTop()
          this.getConversations()
          this.chatName = ''
          this.form = {}
          this.open = false
        })
      })
    },
    deleteConversation(cid) {
      this.$confirm('确认要删除聊天吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.currConversationInfo) {
          if (this.currConversationInfo.conversationId === cid) {
            this.currConversationInfo = null
            this.history = []
          }
        }
        delConversation(cid).then(() => {
          this.getConversations()
        })
      }).catch(() => {})
    },
    chatConversation(cid) {
      queryConversationInfoByCId(cid).then(response => {
        this.sotreConversationInfo(response.data)
      })
    },
    conversationHandleRightClick(event, cid) {
      event.preventDefault() // 阻止默认的右键菜单弹出
      const items = {
        items: [
          {
            label: '发消息',
            icon: 'el-icon-s-promotion',
            onClick: () => {
              this.chatConversation(cid)
            }
          },
          // {
          //   label: '修改备注',
          //   icon: 'el-icon-edit-outline',
          //   click: function(event) {
          //     Message({ message: '修改备注' + cid, type: 'success' })
          //   }
          // },
          {
            label: '删除聊天',
            icon: 'el-icon-delete',
            onClick: () => {
              this.deleteConversation(cid)
            }
          }
        ],
        event: event,
        zIndex: 3
      }
      this.$contextmenu(items)
      // return false
    }
  }
}
</script>

<style>
/* 布局部分 */
.chat-app {
  height: calc(100vh - 90px);
  display: flex;
  /*max-width: 900px;*/
  /*margin: 0 auto;*/
  /*box-shadow: 0 0 10px rgba(0,0,0,0.1);*/
}

.friends-list {
  /*width: 200px;*/
  /*border-right: 1px solid #ddd;*/
  box-shadow: 0 1px 4px rgb(150, 183, 226);
  border-radius: 15px;
  width: 260px;
  margin: 5px;
  /*height: 100%;*/
  position: relative;
  display: flex;
  flex-direction: column;
  /*overflow: auto;*/
}
.create-session {
  /*margin-bottom: 2px;*/
  /*width: 250px;*/
  height: 80px;
  /*box-shadow: 0 1px 2px rgb(154,185,225);*/
  position: relative;
  /*border-radius: 15px;*/
  margin: 5px;
}
.create-session-text {
  align-items: center;
  display: flex;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  width: 180px;
  height: 45px;
  border: 1px rgb(25, 205, 229) solid;
  /*box-shadow: 0 1px 4px #4bc776;*/
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  /*color: #5a5ad7;*/
  color: rgb(25, 205, 229);
}
.create-session-text:hover {
  /*background-color: #8080de;*/
  color: white;
  background: linear-gradient(90deg, rgb(161,149,250), rgb(241, 110, 144));
  border: 0;
}
.search-box {
  position: sticky;
  top: 0;
}

.chat-box {
  box-shadow: 0 1px 4px rgb(150, 183, 226);
  border-radius: 15px;
  width: 75%;
  flex: 1;
  margin: 5px;
  display: flex;
  flex-direction: column;
}
.message-header{
  padding-left: 20px;
  height: 50px;
  border-radius: 15px 15px 0 0;
  border-bottom: 1px #bcc4cc solid;
  display: inline-flex;
  justify-content: space-between;
}
.message-header-name {
  margin-top: 16px;
  font-weight: bold;
}
.message-header-icon {
  width: 25px;
  height: 25px;
  margin: 16px 16px 0 16px;
  padding: 0.25rem;
}
.message-header-icon:hover {
  background-color: #e4e5e6;
  border-radius: 5px;
}
.empty-friends-list {
  /*width: 100%;*/
  height: calc(100% - 90px);
  display: flex;
  justify-content: center;
  align-items: center;
}
.empty-friends-list img{
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: repeat;
  object-fit: contain;
}
.scrollbar-wrap {
  overflow: auto;
  /*height: 100%;*/
  flex: 1;
}
.message-display {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message-input {
  padding: 10px;
  /*border-top: 1px solid #ddd;*/
  display: flex;
}

/* 好友列表部分 */
.friend-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 2px 6px;
  border-radius: 10px;
  /*border-bottom: 1px solid #f0f0f0;*/
  cursor: pointer;
}

.friend-item-click {
  background-color: #e6f0ff;
}

.friend-item:not(.friend-item-click):hover {
  background-color: #edeeee;
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10%;
  margin-right: 10px;
  box-shadow: 0 1px 4px #adb3b6;
}

.friend-info {
  flex: 1;

}

.friend-name {
  width: 120px;
  padding-top: 1px;
  margin: 0;
  font-size: 14px;
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1; /* 这里是超出几行省略 */
  overflow: hidden;
}

.friend-last-message {
  width: 120px;
  margin: 0;
  padding-top: 10px;
  font-size: 12px;
  color: #999;
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1; /* 这里是超出几行省略 */
  overflow: hidden;
}

.friend-last-message-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

/* 消息展示部分 */
.message {
  display: flex;
  margin: 10px 0;
}
.empty-message {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.message-img {
  max-width: 100%;
  max-height: 100%;
}
.message-content-time {
  max-width: 90%;
  display: flex;
  flex-direction: column;
  margin-top: 5px
}

.message-avatar {
  width: 35px;
  height: 35px;
  border-radius: 10%;
  margin-right: 10px;
  box-shadow: 0 1px 4px #adb3b6;
}

.message-content {
  padding: 10px;
  border-radius: 10px;
  background-color: #f0f0f0;
  /*font-size: 15px;*/
  /*line-height: 25px;*/
}
.message-time {
  font-size: 12px;
  color: #b7b7bd;
  margin-bottom: 3px;
  margin-left: 3px;
}

.message.time {
  font-size: 10px;
  color: #999;
  margin-right: 5px;
}

.message.mine {
  /*flex-direction: row-reverse;*/
}

.message.mine .message-content {
  background-color: #95ec69;
  margin-right: 0;
}

.message.mine .message-avatar {
  /*display: none; !* 隐藏我的头像 *!*/
}

.form-item {
  width: 386px;
  display: flex;
  justify-content: space-between;
  padding-right: 10px;
  align-items: center;
  margin-bottom: 15px;
}
.lable {
  font-size: 16px;
  font-weight: 500;
  user-select: none;
  color: rgb(51, 51, 51);
}
.form-item input {
  margin-left: 13px;
  appearance: none;
  box-shadow: none;
  height: 3.38rem;
  font-size: 16px;
  font-family: PingFangSC-Regular, "PingFang SC", 微软雅黑;
  font-weight: 400;
  color: rgb(51, 51, 51);
  flex: 1 1 0%;
  outline: none;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  background: rgb(242, 244, 249);
  border-radius: 10px;
  padding: 0.81rem 1.13rem;
}
/* 消息输入部分 */
.message-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.message-input button {
  padding: 10px 20px;
  background-color: #1e90ff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}
.ai-robot-title {
  font-size: 16px;
  font-family: PingFangSC-Regular, "PingFang SC", 微软雅黑;
  font-weight: 500;
  user-select: none;
  color: rgb(51, 51, 51);
  /*margin-left: 50px;*/
}
.ai-robot {
  height: 290px;
  margin-left: 10px;
  border-radius: 15px;
  flex: 1;
  overflow: auto;
}
.ai-robot-card {
  height: 70px;
  display: flex;
  margin: 5px 20px;
  border-radius: 10px;
  /*border: 1px red solid;*/
  padding: 5px 15px 5px;
  cursor: pointer;
  align-items: center;
  background-color: rgb(242,244,249);
}
.ai-robot-card-click {
  background: linear-gradient(90deg, rgb(234, 190, 190), rgb(169, 217, 191));
}
.ai-robot-card:not(.ai-robot-card-click):hover {
  background-color: #d0d2d2;
}
.ai-robot-card img {
  width: 40px;
  height: 40px;
  border-radius: inherit;
  align-content: center
}
.robot-name {
  font-size: 16px
}
.robot-desc {
  font-size:12px;
  margin-top: 5px;
  color: #999;
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1; /* 这里是超出几行省略 */
  overflow: hidden;
}
.start-chat {
  width: 150px;
  height: 45px;
  box-shadow: none;
  font-size: 1.1rem;
  /*font-family: PingFangSC-Regular, "PingFang SC", 微软雅黑;*/
  font-weight: 400;
  color: white;
  user-select: none;
  display: flex;
  justify-content: center;
  cursor: pointer;
  align-items: center;
  /*background: linear-gradient(90deg, rgb(13, 127, 239), rgb(0, 224, 253));*/
  /*background-color: #409EFF;*/
  background: linear-gradient(90deg, rgb(13, 127, 239), rgb(0, 224, 253));;
  border-radius: 10px;
  margin: 20px auto 0;
}
</style>
