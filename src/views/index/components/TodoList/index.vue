<template>
  <section class="todoapp">
    <!-- header -->
    <header class="header">
      <input class="new-todo" autocomplete="off" placeholder="添加待办事项..." @keyup.enter="addTodo">
    </header>
    <!-- main section -->
    <section v-show="todos.length" class="main">
      <ul class="todo-list">
        <todo
          v-for="(todo, index) in filteredTodos"
          :key="index"
          :todo="todo"
          @toggleTodo="toggleTodo"
          @editTodo="editTodo"
          @deleteTodo="deleteTodo"
        />
      </ul>
    </section>
    <!-- footer -->
    <footer v-show="todos.length" class="footer">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        条待办
      </span>
      <ul class="filters">
        <li>
          <a :class="{ selected: visibility === 'all' }" @click.prevent="visibility = 'all'">所有</a>
        </li>
        <li>
          <a :class="{ selected: visibility === 'active' }" @click.prevent="visibility = 'active'">待完成</a>
        </li>
        <li>
          <a :class="{ selected: visibility === 'completed' }" @click.prevent="visibility = 'completed'">已完成</a>
        </li>
      </ul>
    </footer>
  </section>
</template>

<script>
import Todo from './Todo.vue'
import { planList, addPlan, editPlan, deletePlan } from '@/api/index'
import { Message } from 'element-ui'

const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done)
}
export default {
  components: { Todo },
  filters: {
    pluralize: (n, w) => n === 1 ? w : w + 's',
    capitalize: s => s.charAt(0).toUpperCase() + s.slice(1)
  },
  props: {
    todayDate: {
      type: Date,
      required: true
    }
  },
  data() {
    return {
      visibility: 'all',
      filters,
      todos: []
    }
  },
  computed: {
    allChecked() {
      return this.todos.every(todo => todo.done)
    },
    filteredTodos() {
      return filters[this.visibility](this.todos)
    },
    remaining() {
      return this.todos.filter(todo => !todo.done).length
    }
  },
  watch: {
    todayDate(newVal) {
      this.getTodoList(newVal)
    }
  },
  created() {
    this.getTodoList(this.todayDate)
  },
  methods: {
    formatDateTime(newVal) {
      var year = newVal.getFullYear()
      var month = newVal.getMonth() + 1
      var date = newVal.getDate()
      if (date >= 1 && date <= 9) { //日如果小于10就补个0
        date = '0' + date
      }
      if (month >= 1 && month <= 9) { //月如果小于10就补个0
        month = '0' + month
      }
      return year + '-' + month + '-' + date
    },
    // 获取待办列表
    getTodoList(newVal) {
      planList(this.formatDateTime(newVal)).then(response => {
        this.todos = response.data
      })
    },
    // 添加待办
    addTodo(e) {
      const text = e.target.value
      if (text.trim()) {
        addPlan(text, this.formatDateTime(this.todayDate)).then(response => {
          Message({ message: '添加待办成功', type: 'success' })
          this.getTodoList(this.todayDate)
        })
      }
      e.target.value = ''
    },
    toggleTodo(val) {
      var todoStatus
      if (val.done) {
        todoStatus = 0
      } else {
        todoStatus = 1
      }
      editPlan(val.id, val.text, todoStatus).then(response => {
        this.getTodoList(this.todayDate)
      })
    },
    // 删除待办
    deleteTodo(todo) {
      console.log('delete plan' + todo.id)
      this.$confirm('确认要删除此条待办吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return deletePlan(todo.id)
      }).then(() => {
        this.getTodoList(this.todayDate)
        Message({ message: '删除待办成功', type: 'success' })
      })
    },
    editTodo({ todo, value }) {
      var todoStatus
      if (todo.done) {
        todoStatus = 1
      } else {
        todoStatus = 0
      }
      editPlan(todo.id, value, todoStatus).then(response => {
        this.getTodoList(this.todayDate)
      })
    }
  }
}
</script>

<style lang="scss">
  @import './index.scss';
</style>
