<template>
  <div class="dashboard-editor-container">
    <github-corner class="github-corner"/>
    <div v-if="checkPermission(['sys:index:monitor'])">
      <panel-group :statistical-data="statisticalData" @handleSetLineChartData="handleSetLineChartData"/>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <line-chart :chart-data="lineChartData"/>
      </el-row>
    </div>
    <div>
      <el-row :gutter="8">
        <el-col :span="18">
          <el-calendar v-model="todayDate">
            <!-- 这里使用的是 2.5 slot 语法，对于新项目请使用 2.6 slot 语法-->
            <template
              slot="dateCell"
              slot-scope="{date, data}">
              <span :class="data.isSelected ? 'is-selected' : ''">
                <p>{{ data.day.split('-').slice(2).join('-')}} {{''}}</p>
                <p>{{ solarDate2lunar(data.day)}} {{ data.isSelected ? '✔️' : ''}}</p>
              </span>
            </template>
          </el-calendar>
        </el-col>
        <el-col :span="6">
          <todo-list :today-date="todayDate"/>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import TodoList from './components/TodoList'
import { getLineChartData, getStatisticalData } from '@/api/index'
import checkPermission from '@/utils/permission'
import calendar from '@/assets/js/calendar.js'

export default {
  name: 'Index',
  components: {
    GithubCorner,
    PanelGroup,
    LineChart,
    TodoList
  },
  data() {
    return {
      remarks: null,
      todayDate: new Date(),
      lineChartData: {
        name: '',
        dateData: [],
        statisticsData: []
      },
      statisticalData: {
        userNum: 0,
        articleNum: 0,
        loginNum: 0,
        musicNum: 0
      }
    }
  },
  created() {
    this.pgData()
    this.lcData()
  },
  methods: {
    checkPermission,
    handleSetLineChartData(type) {
      getLineChartData(type).then(result => {
        this.lineChartData = result.data
      })
    },
    pgData() {
      getStatisticalData().then(response => {
        this.statisticalData = response.data
      })
    },
    lcData() {
      const type = 'user'
      getLineChartData(type).then(result => {
        this.lineChartData = result.data
      })
    },
    solarDate2lunar(solarDate) {
      var solar = solarDate.split('-')
      var lunar = calendar.solar2lunar(solar[0], solar[1], solar[2])
      // return solar[1] + '-' + solar[2] + '\n' + lunar.IMonthCn + lunar.IDayCn + lunar.festival + lunar.lunarFestival
      if (lunar.lunarFestival === '') {
        return lunar.IMonthCn + lunar.IDayCn
      }
      return lunar.lunarFestival
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 39px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

  .is-selected {
    color: #1989FA;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>

