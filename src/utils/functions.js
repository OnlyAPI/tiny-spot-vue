/** 公共方法类 */
import { getToken } from '@/utils/auth'
import config from '@/config/config'

/**
 * 人性化时间显示
 *
 * @param {Object} datetime
 */
export function formateTime(datetime) {
  if (datetime == null) return ''

  datetime = datetime.replace(/-/g, '/')

  let time = new Date()
  let outTime = new Date(datetime)
  if (/^[1-9]\d*$/.test(datetime)) {
    outTime = new Date(parseInt(datetime) * 1000)
  }

  if (
    time.getTime() < outTime.getTime() ||
    time.getFullYear() != outTime.getFullYear()
  ) {
    return parseTime(outTime, '{y}-{m}-{d} {h}:{i}')
  }

  if (time.getMonth() != outTime.getMonth()) {
    return parseTime(outTime, '{m}-{d} {h}:{i}')
  }

  if (time.getDate() != outTime.getDate()) {
    let day = outTime.getDate() - time.getDate()
    if (day == -1) {
      return parseTime(outTime, '昨天 {h}:{i}')
    }

    if (day == -2) {
      return parseTime(outTime, '前天 {h}:{i}')
    }

    return parseTime(outTime, '{m}-{d} {h}:{i}')
  }

  let diff = time.getTime() - outTime.getTime()

  if (time.getHours() != outTime.getHours() || diff > 30 * 60 * 1000) {
    return parseTime(outTime, '{h}:{i}')
  }

  let minutes = outTime.getMinutes() - time.getMinutes()
  if (minutes == 0) {
    return '刚刚'
  }

  minutes = Math.abs(minutes)
  return `${minutes}分钟前`
}

/**
 * 格式化文件大小
 *
 * @param {String} value 文件大小(字节)
 */
export function formateSize(value) {
  if (null == value || value == '') {
    return '0'
  }
  let unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let index = 0
  let srcsize = parseFloat(value)
  index = Math.floor(Math.log(srcsize) / Math.log(1000))
  let size = srcsize / Math.pow(1000, index)
  size = size.toFixed(2) //保留的小数位数
  return size + unitArr[index]
}
/**
 * 获取文件后缀名
 *
 * @param {String} fileName
 */
export function getFileExt(fileName) {
  let ext = fileName.split('.')
  ext = ext[ext.length - 1] // 获取文件后缀名
  return ext
}

/**
 * 根据图片url下载图片
 * @param {String} imgsrc
 * @param {String} name
 */
export function downloadIamge(imgsrc, name) {
  //下载图片地址和图片名
  let image = new Image()
  // 解决跨域 Canvas 污染问题
  image.setAttribute('crossOrigin', 'anonymous')
  image.onload = function() {
    let canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    let context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height)
    let url = canvas.toDataURL('image/png') //得到图片的base64编码数据
    let a = document.createElement('a') // 生成一个a元素
    let event = new MouseEvent('click') // 创建一个单击事件
    a.download = name || 'photo' // 设置图片名称
    a.href = url // 将生成的URL设置为a.href属性
    a.dispatchEvent(event) // 触发a的单击事件
  }
  image.src = imgsrc
}

/**
 * 通过图片url获取图片大小
 *
 * @param {String} imgsrc 例如图片名： D8x5f13a53dbc4b9_350x345.png
 */
export function getImageInfo(imgsrc) {
  let data = {
    width: 0,
    height: 0,
  }

  let arr = imgsrc.split('_')
  if (arr.length == 1) return data

  let info = arr[arr.length - 1].match(/\d+x\d+/g)
  if (info == null) return data

  info = info[0].split('x')
  return {
    width: parseInt(info[0]),
    height: parseInt(info[1]),
  }
}

/**
 * 文件下载方法
 *
 * @param {Number} cr_id
 */
export function download(cr_id) {
  let api = config.BASE_API_URL
  let token = getToken()
  try {
    let link = document.createElement('a')
    link.target = "_blank"
    link.href = `${api}/api/v1/talk/records/file/download?cr_id=${cr_id}&token=${token}`
    link.click()
  } catch (e) {}
}

/**
 * 时间格式化方法
 *
 * @param {(Object|string|number)} time
 * @param {String} cFormat
 * @returns {String | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }

  let date
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'

  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }

    date = new Date(time.replace(/-/g, '/'))
  }

  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }

  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }

    return value.toString().padStart(2, '0')
  })

  return time_str
}

/**
 * 去除字符串控制
 *
 * @param {String} str
 */
export function trim(str, type = null) {
  if (type) {
    return str.replace(/(^\s*)|(\s*$)/g, '')
  } else if (type == 'l') {
    return str.replace(/(^\s*)/g, '')
  } else {
    return str.replace(/(\s*$)/g, '')
  }
}

/**
 * 解析url中参数
 *
 * @param {String} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]

  if (!search) return {}

  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
  )
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''

      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }

  return newArray
}

/**
 * @param {HTMLElement} element
 * @param {String} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }

  let classString = element.className
  let nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * Check if an element has a class
 *
 * @param {HTMLElement} elm
 * @param {String} cls
 * @returns {Boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 *
 * @param {HTMLElement} elm
 * @param {String} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 *
 * @param {HTMLElement} elm
 * @param {String} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

/**
 * 通过图片Url获取图片等比例缩放的宽度和高度信息
 *
 * @param {String} src
 * @param {Number} width
 */
export function imgZoom(src, width = 200) {
  const info = getImageInfo(src)

  if (info.width < width) {
    return {
      width: `${info.width}px`,
      height: `${info.height}px`,
    }
  }

  return {
    width: width + 'px',
    height: parseInt(info.height / (info.width / width)) + 'px',
  }
}

/**
 * 获取浏览器光标选中内容
 *
 * @export
 * @returns
 */
export function getSelection() {
  return window.getSelection
    ? window.getSelection().toString()
    : document.selection.createRange().text
}

/**
 * 剪贴板复制功能
 *
 * @param {String} value 复制内容
 * @param {Function} callback 复制成功回调方法
 */
export const copyTextToClipboard = (value, callback) => {
  let textArea = document.createElement('textarea')
  textArea.style.background = 'transparent'
  textArea.value = value

  document.body.appendChild(textArea)

  textArea.select()

  try {
    document.execCommand('copy')
    if (callback) callback()
  } catch (err) {
    alert('Oops, unable to copy')
  }

  document.body.removeChild(textArea)
}

/**
 * 隐藏用户手机号中间四位
 *
 * @param {String} phone  手机号
 */
export function hidePhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 人性化显示时间
 *
 * @param {Object} datetime
 */
export function beautifyTime(time) {
  const today = new Date().getTime()
  // 当前时间减去获取到的时间
  const sub = today - time
  const day = 1000 * 60 * 60 * 24
  const timeDate = new Date(time)
  const currentYear = new Date().getFullYear()
  const getYear = new Date(time).getFullYear()
  const HHmm = `${formatTime2("hh", timeDate)}:${formatTime2("mm", timeDate)}`
  const showWeekDay = isShowWeekDay(sub, timeDate.getDay())
  if (currentYear > getYear) {
    return `${formatTime2("yyyy-MM-dd", timeDate)}`
  } else if (showWeekDay) {
    return `${weekFormat(timeDate.getDay())} ${HHmm}`
  } else if (sub > day && sub < day * 2) {
    return `昨天 ${HHmm}`
  } else if (sub <= day) {
    return HHmm
  } else {
    return `${formatTime2("MM-dd", timeDate)}`
  }
}

// 是否显示周几
function isShowWeekDay(sub, weekDay) {
  const currentWeekDay = new Date().getDay()
  const dayTime = 1000 * 60 * 60 * 24
  // 1.当前时间与消息时间相差必须大于2天小于7天
  // 2.当前时间距离本周一相差必须大于2天且小于当前距离周一的天数
  // 3.消息时间不可能是0-周日，因为周日没有给后面时间留空间，不会走这里的逻辑，而是走今天的逻辑
  if (sub >= dayTime * 2 && weekDay !== 0 && sub <= dayTime * currentWeekDay) {
    return true
  } else {
    return false
  }
}

// 转换今日的时辰格式
function todayTimeFormat(e) {
  if (e >= 0 && e < 7) {
    return "凌晨"
  } else if (e >= 7 && e < 11) {
    return "上午"
  } else if (e >= 11 && e < 13) {
    return "中午"
  } else if (e >= 13 && e < 18) {
    return "下午"
  } else if (e >= 18 && e < 24) {
    return "晚上"
  } else {
    return ""
  }
}

// 星期格式转换 0-6：周日到周六
function weekFormat(e, prefix = "周") {
  switch (e) {
    case 0:
      return prefix + "日"
      break;
    case 1:
      return prefix + "一"
      break;
    case 2:
      return prefix + "二"
      break;
    case 3:
      return prefix + "三"
      break;
    case 4:
      return prefix + "四"
      break;
    case 5:
      return prefix + "五"
      break;
    case 6:
      return prefix + "六"
      break;
    default:
      return ""
      break;
  }
}

// 时间格式化兼容 ios
function formatTime2(fmt, timestamp) {
  var date = new Date(timestamp) // 兼容safari
  var o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

export function getSort(fn) {
  return function(a, b) {
    let ret = 0

    if (fn.call(this, a, b)) {
      ret = -1
    } else if (fn.call(this, b, a)) {
      ret = 1
    }

    return ret
  }
}

/**
 * 批量排序
 *
 * @param {*} arr
 */
export function getMutipSort(arr) {
  return function(a, b) {
    let tmp
    let i = 0

    do {
      tmp = arr[i++](a, b)
    } while (tmp == 0 && i < arr.length)

    return tmp
  }
}

/**
 * Url 替换超链接
 *
 * @param {String} text 文本
 * @param {String} color 超链接颜色
 */
export function textReplaceLink(text, color = '#409eff') {
  let exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
  return text.replace(
    exp,
    `<a href='$1' target="_blank" style="color:${color};text-decoration: revert;">$1</a >`
  )
}

/**
 * 防抖
 *
 * @param {*} func
 * @param {*} wait
 * @param {*} immediate
 * @returns
 */
export function debounce(func, wait, immediate) {
  let timeout

  return function() {
    let context = this
    let args = arguments

    if (timeout) clearTimeout(timeout) // timeout 不为null
    if (immediate) {
      let callNow = !timeout // 第一次会立即执行，以后只有事件执行后才会再次触发
      timeout = setTimeout(function() {
        timeout = null
      }, wait)
      if (callNow) func.apply(context, args)
    } else {
      timeout = setTimeout(function() {
        func.apply(context, args)
      }, wait)
    }
  }
}
