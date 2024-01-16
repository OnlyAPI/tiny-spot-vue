<!--音乐播放-->
<template>
  <el-popover placement="bottom" width="400" trigger="click">
    <svg-icon :icon-class="'music'" slot="reference" style="cursor: pointer"/>
    <div id="aplayer"></div>
  </el-popover>
</template>
<script>

import APlayer from 'aplayer' // 引入音乐插件
import '@/styles/APlayer.min.css' // 引入音乐插件的样式
import { list } from '@/api/tool/music/index'

export default {
  name: 'MusicPlayer',
  data() {
    return {
      audio: [],
      info: {
        // 不开启吸底模式
        fixed: false,
        // 折叠歌曲列表
        listFolded: false,
        // 开启自动播放
        autoplay: false,
        // 自动预加载歌曲
        preload: 'auto',
        // 播放循环模式、all全部循环 one单曲循环 none只播放一次
        loop: 'all',
        //  播放模式，list列表播放, random随机播放
        order: 'list',
        // 主题
        theme: '#FADFA3'
      }
    }
  },
  mounted() {
    // 初始化播放器
    this.initAudio()
  },
  methods: {
    initAudio() {
      // 创建一个音乐播放器实例，并挂载到DOM上，同时进行相关配置
      list().then(res => {
        const ap = new APlayer({
          container: document.getElementById('aplayer'),
          audio: res.data, // 音乐信息
          ...this.info // 其他配置信息
        })
      }).catch()
    }
  }
}
</script>

<style lang="less" scoped>
  #aplayer {
    width: 360px; // 定个宽度
  }
</style>
