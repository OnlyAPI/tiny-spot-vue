/**
 * 动态表情
 */
const emojis = {
  '[微笑]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/0.gif'>",
  '[撇嘴]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/1.gif'>",
  '[色]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/2.gif'>",
  '[发呆]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/3.gif'>",
  '[得意]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/4.gif'>",
  '[流泪]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/5.gif'>",
  '[害羞]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/6.gif'>",
  '[闭嘴]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/7.gif'>",
  '[睡]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/8.gif'>",
  '[大哭]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/9.gif'>",
  '[尴尬]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/10.gif'>",
  '[发怒]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/11.gif'>",
  '[调皮]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/12.gif'>",
  '[呲牙]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/13.gif'>",
  '[惊讶]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/14.gif'>",
  '[难过]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/15.gif'>",
  '[酷]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/16.gif'>",
  '[冷汗]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/17.gif'>",
  '[抓狂]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/18.gif'>",
  '[吐]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/19.gif'>",
  '[偷笑]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/20.gif'>",
  '[可爱]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/21.gif'>",
  '[白眼]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/22.gif'>",
  '[傲慢]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/23.gif'>",
  '[饥饿]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/24.gif'>",
  '[困]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/25.gif'>",
  '[惊恐]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/26.gif'>",
  '[流汗]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/27.gif'>",
  '[憨笑]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/28.gif'>",
  '[大兵]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/29.gif'>",
  '[奋斗]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/30.gif'>",
  '[咒骂]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/31.gif'>",
  '[疑问]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/32.gif'>",
  '[嘘]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/33.gif'>",
  '[晕]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/34.gif'>",
  '[折磨]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/35.gif'>",
  '[衰]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/36.gif'>",
  '[骷髅]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/37.gif'>",
  '[敲打]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/38.gif'>",
  '[再见]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/39.gif'>",
  '[擦汗]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/40.gif'>",
  '[抠鼻]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/41.gif'>",
  '[鼓掌]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/42.gif'>",
  '[糗大了]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/43.gif'>",
  '[坏笑]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/44.gif'>",
  '[左哼哼]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/45.gif'>",
  '[右哼哼]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/46.gif'>",
  '[哈欠]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/47.gif'>",
  '[鄙视]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/48.gif'>",
  '[委屈]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/49.gif'>",
  '[快哭了]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/50.gif'>",
  '[阴险]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/51.gif'>",
  '[亲亲]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/52.gif'>",
  '[吓]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/53.gif'>",
  '[可怜]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/54.gif'>",
  '[菜刀]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/55.gif'>",
  '[西瓜]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/56.gif'>",
  '[啤酒]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/57.gif'>",
  '[篮球]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/58.gif'>",
  '[咖啡]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/60.gif'>",
  '[饭]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/61.gif'>",
  '[猪头]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/62.gif'>",
  '[玫瑰]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/63.gif'>",
  '[凋谢]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/64.gif'>",
  '[示爱]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/65.gif'>",
  '[爱心]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/66.gif'>",
  '[心碎]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/67.gif'>",
  '[蛋糕]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/68.gif'>",
  '[炸弹]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/70.gif'>",
  '[刀]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/71.gif'>",
  '[足球]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/72.gif'>",
  '[礼物]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/77.gif'>",
  '[拥抱]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/78.gif'>",
  '[强]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/79.gif'>",
  '[弱]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/80.gif'>",
  '[握手]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/81.gif'>",
  '[胜利]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/82.gif'>",
  '[抱拳]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/83.gif'>",
  '[勾引]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/84.gif'>",
  '[拳头]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/85.gif'>",
  '[差劲]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/86.gif'>",
  '[爱你]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/87.gif'>",
  '[NO]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/88.gif'>",
  '[OK]': "<img src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/89.gif'>"
}

/**
 * 符号表情
 */
const symbol = [
  '😠', '😩', '😲', '😞', '😵', '😰', '😒', '😍', '😤', '😜', '😝', '😋', '😘', '😚', '😷',
  '😳', '😃', '😅', '😆', '😁', '😂', '😊', '☺', '😄', '😢',
  '😭', '😨', '😣', '😡', '😌', '😖', '😔', '😱', '😪', '😏', '😓', '😥', '😫', '😉',
  '✊', '✋', '✌', '👊', '👍', '☝', '👆', '👇', '👈', '👉',
  '👋', '👏', '👌', '👎'
]

const emojisKeys = Object.keys(emojis)

export const emojiList = {
  symbol,
  emojis
}

const regEmoji = emojisKeys.map((value) => '|\\' + value).join('').replace('|', '')

/**
 * 替换表情文字
 *
 * @param {String} content 需要替换的字符串
 */
export function textReplaceEmoji(content) {
  return content.replace(new RegExp(`(${regEmoji})`, 'gi'), ($0, $1) => {
    return emojis[$1]
  })
}
