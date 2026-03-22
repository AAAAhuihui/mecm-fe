<!--
  -  Copyright 2020-2021 Huawei Technologies Co., Ltd.
  -
  -  Licensed under the Apache License, Version 2.0 (the "License");
  -  you may not use this file except in compliance with the License.
  -  You may obtain a copy of the License at
  -
  -      http://www.apache.org/licenses/LICENSE-2.0
  -
  -  Unless required by applicable law or agreed to in writing, software
  -  distributed under the License is distributed on an "AS IS" BASIS,
  -  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  -  See the License for the specific language governing permissions and
  -  limitations under the License.
  -->
<template>
  <div>
    <!-- 统一标题样式 -->
    <div class="topLabel">
      边缘节点信令管理
    </div>

    <!-- 统一内容容器 -->
    <div class="contentList">
      <!-- 顶部操作按钮 -->
      <div class="select-container">
        <el-button
          type="primary"
          icon="el-icon-send"
          @click="showDialog = true"
          class="deploy-btn"
        >
          信令下发
        </el-button>
        <el-button
          type="primary"
          icon="el-icon-refresh"
          @click="refreshSignalingList"
          class="show-btn"
        >
          刷新数据
        </el-button>
      </div>

      <!-- 信令下发弹窗：添加自定义类名修改标题样式 -->
      <el-dialog
        title="信令下发"
        :visible.sync="showDialog"
        width="800px"
        @close="resetForm"
        append-to-body
        custom-class="signaling-dialog"
      >
        <div class="form-content">
          <!-- 第一行：UE类型 + UE IP -->
          <div class="form-row">
            <div class="select-item">
              <label>UE类型</label>
              <el-select
                v-model="form.ueType"
                placeholder="请选择UE类型"
                clearable
                class="signaling-select"
              >
                <el-option
                  label="单独UE"
                  value="single"
                />
                <el-option
                  label="全部UE"
                  value="all"
                />
              </el-select>
            </div>
            <div
              class="select-item"
              v-if="form.ueType === 'single'"
            >
              <label>UE IP地址</label>
              <el-input
                v-model="form.ueIp"
                placeholder="请输入UE IP地址"
                clearable
                class="signaling-input"
              />
            </div>
          </div>

          <!-- 第二行：APPID -->
          <div class="form-row">
            <div class="select-item">
              <label>边缘节点APPID</label>
              <el-select
                v-model="form.appId"
                placeholder="请选择边缘节点APPID"
                clearable
                filterable
                class="signaling-select"
              >
                <el-option
                  v-for="appId in appIdList"
                  :key="appId"
                  :label="appId"
                  :value="appId"
                />
              </el-select>
            </div>
          </div>

          <!-- 第三行：DNN -->
          <div class="form-row">
            <div class="select-item">
              <label>DNN</label>
              <el-input
                v-model="form.dnn"
                placeholder="请输入DNN"
                clearable
                class="signaling-input"
              />
            </div>
          </div>

          <!-- 第四行：SST + SD -->
          <div class="form-row">
            <div class="select-item">
              <label>SST</label>
              <el-input
                v-model="form.sst"
                placeholder="请输入SST"
                clearable
                class="signaling-input"
              />
            </div>
            <div class="select-item">
              <label>SD</label>
              <el-input
                v-model="form.sd"
                placeholder="请输入SD"
                clearable
                class="signaling-input"
              />
            </div>
          </div>

          <!-- 第五行：DNAI编码 -->
          <div class="form-row">
            <div class="select-item">
              <label>边缘节点DNAI编码</label>
              <el-input
                v-model="form.dnaiCode"
                placeholder="请输入边缘节点DNAI编码"
                clearable
                class="signaling-input"
              />
            </div>
          </div>
        </div>

        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="resetForm">重置</el-button>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!form.ueType || (form.ueType === 'single' && !form.ueIp) || !form.dnn || !form.sst || !form.sd || !form.appId || !form.dnaiCode"
            @click="handleDeploy"
            class="deploy-btn"
          >
            确认下发
          </el-button>
        </span>
      </el-dialog>

      <!-- 信令数据表格 -->
      <div class="table-container">
        <el-table
          :data="signalingList"
          border
          v-loading="showLoading"
          :empty-text="emptyText"
          style="width: 100%"
        >
          <!-- ID列：下发中不显示 -->
          <el-table-column
            label="ID"
            width="120"
          >
            <template slot-scope="{ row }">
              <span>{{ row.status === 'DEPLOYING' ? '' : row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="appInstanceId"
            label="APP实例ID"
            min-width="200"
          />
          <el-table-column
            prop="targetIp"
            label="目标IP(N6IP)"
            width="160"
          />
          <el-table-column
            prop="targetDnai"
            label="DNAI编码"
            min-width="180"
          />
          <el-table-column
            label="UE信息"
            min-width="180"
          >
            <template slot-scope="{ row }">
              <span>{{ row.ueType === 'all' ? '全部UE' : (row.ueType === 'single' ? `单独UE: ${row.ueIp}` : '-') }}</span>
            </template>
          </el-table-column>
          <!-- 状态列 -->
          <el-table-column
            prop="status"
            label="状态"
            width="140"
          >
            <template slot-scope="{ row }">
              <span
                class="status-text"
                :class="`status-${row.status}`"
              >
                <i
                  class="status-icon"
                  :class="getStatusIcon(row.status)"
                />
                {{ formatStatus(row) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="200"
            :formatter="formatDateTime"
          />
          <!-- 新增：操作列 - 取消按钮 -->
          <el-table-column
            label="操作"
            width="120"
            align="center"
          >
            <template slot-scope="{ row }">
              <el-button
                type="text"
                icon="el-icon-close"
                v-if="row.status === 'SUCCESS'"
                @click="handleCancel(row.id)"
                class="cancel-btn"
              >
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { signaling } from '../../tools/request.js'
import { getAllAppinstanceIdsWithN6Ip } from '../../tools/mecApplication.js'

export default {
  name: 'SignalingMgr',
  data () {
    return {
      showDialog: false,
      // 表单全量字段（已删除QoS相关）
      form: {
        ueType: '',
        ueIp: '',
        dnn: '',
        sst: '',
        sd: '',
        appId: '',
        dnaiCode: ''
      },
      loading: false,
      showLoading: false,
      appIdList: [],
      appIdToN6IpMap: {},
      signalingList: [],
      emptyText: '暂无信令数据'
    }
  },
  created () {
    this.loadAppInstanceIdsWithN6Ip()
    this.refreshSignalingList()
  },
  methods: {
    // 加载APPID列表
    async loadAppInstanceIdsWithN6Ip () {
      try {
        const res = await getAllAppinstanceIdsWithN6Ip()
        if (res.code === 200 && Array.isArray(res.data)) {
          this.appIdList = res.data.map(item => item.appInstanceId)
          this.appIdToN6IpMap = res.data.reduce((map, item) => {
            map[item.appInstanceId] = item.n6Ip
            return map
          }, {})
        } else {
          this.$message.error('加载APPID列表失败')
        }
      } catch (error) {
        this.$message.error('加载APPID列表失败')
        console.error('APPID接口错误：', error)
      }
    },

    // 信令下发：已删除QoS相关参数
    async handleDeploy () {
      try {
        this.loading = true
        const targetIp = this.appIdToN6IpMap[this.form.appId]
        if (!targetIp) {
          this.$message.warning('该APPID未关联N6IP！')
          this.loading = false
          return
        }

        // 表格临时数据：删除QoS字段
        const tempItem = {
          id: Date.now(),
          appInstanceId: this.form.appId,
          targetIp: targetIp,
          targetDnai: this.form.dnaiCode,
          dnn: this.form.dnn,
          sst: this.form.sst,
          sd: this.form.sd,
          ueType: this.form.ueType,
          ueIp: this.form.ueIp || '',
          status: 'DEPLOYING',
          createTime: new Date().toISOString()
        }
        this.signalingList.push(tempItem)

        // 向后端传递参数：删除QoS相关
        const params = {
          appId: this.form.appId,
          dnai: this.form.dnaiCode,
          targetIp: targetIp,
          ueType: this.form.ueType,
          ueIp: this.form.ueIp || '',
          dnn: this.form.dnn,
          sst: this.form.sst,
          sd: this.form.sd
        }
        const res = await signaling.createPolicy(params)

        if (res.data && res.data.code === 200) {
          tempItem.status = 'SUCCESS'
          this.$message.success('信令下发成功！')
          this.showDialog = false
          this.resetForm()
          this.refreshSignalingList()
        } else {
          tempItem.status = 'FAILED'
          this.$message.error(res.data.msg)
        }
      } catch (error) {
        if (this.signalingList.length > 0) {
          this.signalingList[this.signalingList.length - 1].status = 'FAILED'
        }
        this.$message.error('信令下发失败')
        console.error('下发接口错误：', error)
      } finally {
        this.loading = false
      }
    },

    // 重置表单：清空所有字段
    resetForm () {
      this.form = {
        ueType: '',
        ueIp: '',
        dnn: '',
        sst: '',
        sd: '',
        appId: '',
        dnaiCode: ''
      }
    },

    // 刷新列表
    async refreshSignalingList () {
      this.showLoading = true
      this.emptyText = '加载中...'
      try {
        const params = {}
        const res = await signaling.getAllSignaling(params)
        let data = []
        if (res && res.data) {
          if (Array.isArray(res.data.data)) {
            data = res.data.data
          } else if (Array.isArray(res.data)) {
            data = res.data
          } else if (res.data.data && Array.isArray(res.data.data.records)) {
            data = res.data.data.records
          }
        }
        this.signalingList = data
        this.emptyText = data.length ? '' : '暂无信令数据'
      } catch (error) {
        this.emptyText = '加载数据失败'
        console.error('信令接口请求失败：', error)
      } finally {
        this.showLoading = false
      }
    },

    // 新增：取消信令方法
    async handleCancel (id) {
      try {
        await this.$confirm('确定要取消该信令吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 调用后端取消接口，根据实际接口名修改
        const res = await signaling.cancelSignaling(id)
        if (res.data && res.data.code === 200) {
          this.$message.success('信令取消成功！')
          this.refreshSignalingList()
        } else {
          this.$message.error(res.data.msg || '信令取消失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('取消请求失败，请重试')
          console.error('取消接口错误：', error)
        }
      }
    },

    // 格式化函数（已删除QoS格式化）
    formatStatus (row) {
      const map = { SUCCESS: '成功', FAILED: '失败', PENDING: '处理中', DEPLOYING: '下发中' }
      return map[row.status] || row.status || '未知'
    },
    getStatusIcon (status) {
      const iconMap = { DEPLOYING: 'el-icon-loading', SUCCESS: 'el-icon-success', FAILED: 'el-icon-error', PENDING: 'el-icon-time' }
      return iconMap[status] || ''
    },
    formatDateTime (row) {
      if (!row.createTime) return '无'
      return new Date(row.createTime).toLocaleString('zh-CN')
    }
  }
}
</script>

<style lang='less' scoped>
    /* 完全对齐新样式的紫色科技风 */

    .contentList {
        padding: 20px;
        box-sizing: border-box;
    }

    /* 顶部操作栏样式 */
    .select-container {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        align-items: center;
        padding: 20px;
        background: rgba(62, 39, 155, 0.5);
        border-radius: 16px;
        box-sizing: border-box;
        margin-bottom: 20px;
    }

    /* 表单项样式 */
    .select-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        label

    {
        font-size: 15px;
        color: rgba(255, 255, 255, 0.9);
    }

    }

    /* 表单行布局：每行独占一行，子项均分宽度 */
    .form-row {
        display: flex;
        gap: 20px;
        align-items: flex-end;
        width: 100%;
    }

    /* 弹窗自定义样式：标题白色 */
    :deep(.signaling-dialog) {
        .el-dialog__title

    {
        color: #fff !important;
    }

    }

    /* 下拉选择框样式：白色背景 */
    .signaling-select {
        width: 100%;
        /deep/ .el-select

    {
        .el-input__inner

    {
        height: 38px;
        background: #fff; /* 改为白色背景 */
        border: 1px solid #5e40c8;
        border-radius: 8px;
        color: #000; /* 文字黑色 */
        &::placeholder

    {
        color: #999; /* 占位符灰色 */
    }

    }

    .el-input__suffix i {
        color: #3E279B;
    }

    }
    }

    /* 输入框样式：白色背景 */
    .signaling-input {
        width: 100%;
        /deep/ .el-input

    {
        .el-input__inner

    {
        height: 38px;
        background: #fff; /* 改为白色背景 */
        border: 1px solid #5e40c8;
        border-radius: 8px;
        color: #000; /* 文字黑色 */
        &::placeholder

    {
        color: #999; /* 占位符灰色 */
    }

    }
    }
    }

    /* 表单布局 */
    .form-content {
        display: flex;
        flex-direction: column; /* 垂直排列每行 */
        gap: 16px;
        padding: 10px 0;
    }

    /* 弹窗底部 */
    .dialog-footer {
        text-align: right;
    }

    /* 主按钮：紫色主题 */
    .deploy-btn {
        height: 38px;
        padding: 0 30px;
        background: #3E279B;
        border-color: #5e40c8;
        border-radius: 8px;
        font-size: 16px;
        &:hover

    {
        background: #5e40c8;
        border-color: #7a60d0;
    }

    &:disabled {
        background: rgba(62, 39, 155, 0.5);
        border-color: rgba(94, 64, 200, 0.5);
        color: rgba(255, 255, 255, 0.5);
    }

    }

    /* 次按钮：青蓝色主题 */
    .show-btn {
        height: 38px;
        padding: 0 30px;
        background: #27899B;
        border-color: #40A0C8;
        border-radius: 8px;
        font-size: 16px;
        &:hover

    {
        background: #40A0C8;
        border-color: #60B0D0;
    }

    }

    /* 表格容器：整体白色背景 + 灰色线条分隔 + 固定8行高度滚动 */
    .table-container {
        background: #ffffff;
        border-radius: 16px;
        padding: 20px;
    }

    /deep/ .el-table {
        background: #fff;
        --el-table-border-color: #e5e7eb;
        /* 固定高度：正好显示8条数据 + 表头，超出垂直滚动 */
        max-height: 400px;
        overflow-y: auto;
    }

        /deep/ .el-table th,
        /deep/ .el-table th > .cell {
            background: #f5f7fa !important;
            color: #000000 !important;
            border-color: #e5e7eb !important;
            font-weight: 500;
            /* 表头固定，不随滚动 */
            position: sticky;
            top: 0;
            z-index: 1;
        }

        /deep/ .el-table td {
            background: #fff !important;
            color: #000 !important;
            border-color: #e5e7eb !important;
        }

    /deep/ .el-table__empty-text {
        color: #666 !important;
    }

    /deep/ .el-loading-mask {
        background: rgba(255,255,255,0.8);
    }

    /* 状态样式 */
    .status-text {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .status-icon {
        font-size: 14px;
    }

    .status-DEPLOYING {
        color: #409EFF;
        .status-icon

    {
        animation: rotate 1.5s linear infinite;
    }

    }

    .status-SUCCESS {
        color: #67C23A;
    }

    .status-FAILED {
        color: #F56C6C;
    }

    .status-PENDING {
        color: #E6A23C;
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    /* 新增：取消按钮样式 */
    .cancel-btn {
        color: #F56C6C;
        font-size: 14px;
        &:hover

    {
        color: #f78989;
    }
    }
</style>
