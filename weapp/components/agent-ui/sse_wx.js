// 存储上次解析时剩余的不完整数据
let lastArrayBuffer = new Map()

// arrayBuffer 转 String，处理不完整字符的情况
function arrayBufferToString(arr, uid) {
  // 如果已经是字符串，直接返回
  if (typeof arr === 'string') {
    return arr
  }

  // 合并上次的不完整数据（如果有）
  if (lastArrayBuffer.has(uid)) {
    console.log('存在未解析字段')

    // 创建一个新的 ArrayBuffer 来合并数据
    const combinedLength = lastArrayBuffer.get(uid).byteLength + arr.byteLength
    const combinedBuffer = new ArrayBuffer(combinedLength)
    const combinedView = new Uint8Array(combinedBuffer)

    // 复制上次剩余的数据
    combinedView.set(new Uint8Array(lastArrayBuffer.get(uid)), 0)
    // 复制新的数据
    combinedView.set(new Uint8Array(arr), lastArrayBuffer.get(uid).byteLength)

    // 使用合并后的数据替换当前输入
    arr = combinedBuffer
    // 清空 lastArrayBuffer，因为已合并
    lastArrayBuffer.delete(uid)
  }

  const dataview = new DataView(arr)
  const ints = new Uint8Array(arr.byteLength)
  for (let i = 0; i < ints.length; i++) {
    ints[i] = dataview.getUint8(i)
  }

  let str = ''
  let _arr = ints
  let i = 0

  while (i < _arr.length) {
    if (_arr[i]) {
      let one = _arr[i].toString(2).padStart(8, '0')
      let v = one.match(/^1+?(?=0)/)

      if (v && one.length === 8) {
        const bytesLength = v[0].length

        // 检查是否有足够的字节来完成这个多字节字符
        if (i + bytesLength - 1 >= _arr.length) {
          // 不完整字符，保存剩余数据到 lastArrayBuffer
          const remainingBytes = _arr.slice(i)
          const buffer = new ArrayBuffer(remainingBytes.length)
          new Uint8Array(buffer).set(remainingBytes)
          lastArrayBuffer.set(uid, buffer)
          console.log('==================出现半个字符解析==================')
          break // 中断处理
        }

        let store = _arr[i].toString(2).slice(7 - bytesLength)
        let validSequence = true

        for (let st = 1; st < bytesLength; st++) {
          const continuationByteIndex = st + i
          if (continuationByteIndex < _arr.length) {
            // 验证后续字节是否是有效的 UTF-8 延续字节（以 10 开头）
            const nextByte = _arr[continuationByteIndex].toString(2).padStart(8, '0')
            if (nextByte.slice(0, 2) === '10') {
              store += nextByte.slice(2)
            } else {
              validSequence = false
              break
            }
          } else {
            validSequence = false
            break
          }
        }

        if (validSequence) {
          str += String.fromCharCode(parseInt(store, 2))
          i += bytesLength
        } else {
          // 无效的 UTF-8 序列，当作单字节处理
          str += String.fromCharCode(_arr[i])
          i++
        }
      } else {
        // 单字节字符
        str += String.fromCharCode(_arr[i])
        i++
      }
    } else {
      // 0 值字节
      i++
    }
  }

  return str
}

function parseSSEData(sseData) {
  // 使用正则表达式匹配每个data:开头的块，包括可能的多行内容
  const regex = /data:([\s\S]*?)(?=\n\s*data:|$)/g
  const matches = [...sseData.matchAll(regex)]

  // 从匹配结果中提取JSON字符串
  const jsonStrings = matches.map(match => {
    // 获取匹配的内容并清理
    const jsonContent = match[0].trim().replace(/\n/g, '')
    return jsonContent
  })

  return jsonStrings
}

// 解析`data:`开头的json字符串
const safeJsonParse = (str = '') => {
  const str1 = str.trim()
  if (str1.startsWith('data:')) {
    try {
      const data = JSON.parse(str1.slice(5))
      return data
    } catch (err) {
      throw new Error('[json解析失败]')
    }
  } else {
    throw new Error('[未匹配到消息头]')
  }
}

/**
 * 遗留消息
 * 如果一条消息解析失败，则认为该消息为半条消息，和后续消息拼接后再进行解析
 */
const LegacyMessage = new Map()

// 微信小程序实现sse,通过wx自己的方式实现 -- 该接口有一个明显的问题，同时只能触发一次
export const SSE_WX = ({ url, data, success, error, finish, header }) => {
  // lastArrayBuffer = null // 重置半个流数据
  // 接口赋值
  let requestTask = null
  try {
    const uid = Math.random().toString(36).substring(2, 9)

    // 处理接收到的数据
    const listener = res => {
      // 1. 转换成字符串的格式
      const str1 = arrayBufferToString(res.data, uid)
      // console.log('------------------------------------------')
      // console.log('接收消息:\n', str1)
      // 明确区分空字符串和 null
      if (!str1 && str1 !== '') {
        return
      }
      // 2. 判断是否存在未解析部分，如果存在，则解析合并后的字符串
      let prefix = ''
      if (LegacyMessage.has(uid)) {
        prefix = LegacyMessage.get(uid)
      }
      const str2 = `${prefix}${str1}`
      // 3. 进行解析
      const jsonStrings = parseSSEData(str2)
      if (!jsonStrings.length) {
        // 3.1. 如果解析为空 则代表该部分为片段部分
        LegacyMessage.set(uid, str2)
      } else {
        // 3.2. 解析内容不为空
        LegacyMessage.delete(uid)
        // 4.1. 判断解析后数组，是否是完整的数据，最后一项进行特殊处理
        for (let i = 0; i < jsonStrings.length - 1; i++) {
          const data = safeJsonParse(jsonStrings[i])
          success && success(data)
        }
        // 4.2. 最后一项特殊处理，判断正常解析，还是记录未处理的内容
        const last = jsonStrings[jsonStrings.length - 1]
        try {
          const data = safeJsonParse(last)
          success && success(data)
        } catch (err) {
          LegacyMessage.set(uid, last)
        }
      }
    }

    // 发起请求
    requestTask = wx.request({
      url,
      method: 'POST',
      enableChunked: true, // enableChunked必须为true
      data: data,
      header: {
        'content-type': 'application/json',
        ...header
      },
      // 执行完成
      complete(res) {
        LegacyMessage.delete(uid)
        lastArrayBuffer.delete(uid)
        // 触发完成回调
        if (finish && typeof finish === 'function') {
          finish(res)
        }
      }
    })
    // 监听服务端返回的数据
    requestTask.onChunkReceived(listener)

    return {
      abort: () => {
        // 移除监听 需传入与监听时同一个的函数对象
        requestTask.offChunkReceived(listener)
        requestTask.abort()
      }
    }
  } catch (err) {
    console.error('[sse请求异常]', err)
    error(err)
    requestTask.abort()
  }
}

