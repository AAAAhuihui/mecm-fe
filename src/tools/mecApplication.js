/* // src/tools/mecApplication.js
// 导入request.js导出的appInstance模块
import { appInstance } from './request'

// 获取所有appinstance_id列表（复用request.js的GET封装、权限拦截器）
export function getAllAppinstanceIdsWithN6Ip() {
  return appInstance.getAllAppinstanceIds()
} */

// 仅保留成功场景的Mock数据（可自定义需要显示的appinstance_id）
const MOCK_APP_ID_LIST = [
  {
    'appInstanceId': 'app-10001',
    'n6Ip': '10.60.0.0/16'
  },
  {
    'appInstanceId': 'app-10002',
    'n6Ip': '192.168.10.102'
  },
  {
    'appInstanceId': 'app-10003',
    'n6Ip': null // 无关联边缘主机的APPID，N6IP为null
  }
]

/**
 * 获取所有appinstance_id（仅成功场景）
 * @returns {Promise} 模拟接口成功返回 */

export function getAllAppinstanceIdsWithN6Ip () {
  return new Promise((resolve) => {
    // 模拟500ms接口延迟（可选，注释掉可立即返回）
    setTimeout(() => {
      resolve({
        // 完全匹配前端解析的格式：code + msg + data
        code: 200,
        msg: '查询成功',
        data: MOCK_APP_ID_LIST
      })
    }, 500)
  })
}
