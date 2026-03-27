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
            <div
              class="select-item"
              v-if="form.ueType === 'all'"
            >
              <label>网段输入</label>
              <el-input
                v-model="form.networkSegment"
                placeholder="请输入网段，例如：10.60.0.0/16"
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
                  v-for="app in appList"
                  :key="app.appInstanceId"
                  :label="`${app.appInstanceId} ${app.appName ? `[${app.appName}]` : ''}`"
                  :value="app.appInstanceId"
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
            label="APP实例ID"
            min-width="200"
          >
            <template slot-scope="{ row }">
              <span>{{ row.appInstanceId }} {{ row.appName ? `[${row.appName}]` : '' }}</span>
            </template>
          </el-table-column>
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
                :loading="cancelLoading"
                class="cancel-btn"
                :disabled="cancelLoading"
              >
                取消
              </el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                v-if="row.status === 'FAILED'"
                @click="handleDelete(row.id)"
                :loading="deleteLoading"
                class="delete-btn"
                :disabled="deleteLoading"
              >
                删除
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
      form: {
        ueType: '',
        ueIp: '',
        networkSegment: '',
        dnn: '',
        sst: '',
        sd: '',
        appId: '',
        dnaiCode: ''
      },
      loading: false,
      showLoading: false,
      cancelLoading: false,
      deleteLoading: false,
      appList: [],
      signalingList: [],
      emptyText: '暂无信令数据'
    }
  },
  created () {
    this.loadAppInstanceIdsWithN6Ip()
    this.refreshSignalingList()
  },
  methods: {
    // ✅【最终修复】加载APPID列表，解决“暂无APPID数据”问题
    async loadAppInstanceIdsWithN6Ip () {
      try {
        const res = await getAllAppinstanceIdsWithN6Ip()
        console.log('✅ 接口完整返回:', res)

        // 兼容 axios 包装层
        const responseData = res.data || res

        if (responseData.code === 200 && Array.isArray(responseData.data)) {
          this.appList = responseData.data
          console.log('✅ APPID渲染成功:', this.appList)
        } else {
          this.$message.warning('暂无APPID数据')
          this.appList = []
        }
      } catch (error) {
        this.$message.error('加载APPID失败')
        console.error('❌ 接口错误:', error)
      }
    },

    // 信令下发
    async handleDeploy () {
      try {
        this.loading = true
        const app = this.appList.find(item => item.appInstanceId === this.form.appId)
        const targetIp = app ? app.n6Ip : ''
        if (!targetIp) {
          this.$message.warning('该APPID未关联N6IP！')
          this.loading = false
          return
        }

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

        const params = {
          appId: this.form.appId,
          dnai: this.form.dnaiCode,
          targetIp: targetIp,
          ueType: this.form.ueType,
          ueIp: this.form.ueIp || '',
          networkSegment: this.form.networkSegment || '',
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
          if (res.data && res.data.msg) {
            this.$message.error(res.data.msg)
          } else {
            this.$message.error('下发失败')
          }
        }
      } catch (error) {
        if (this.signalingList.length > 0) {
          this.signalingList[this.signalingList.length - 1].status = 'FAILED'
        }
        this.$message.error('信令下发失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    // 重置表单
    resetForm () {
      this.form = {
        ueType: '',
        ueIp: '',
        networkSegment: '',
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
          }
        }
        this.signalingList = data
        this.emptyText = data.length ? '' : '暂无信令数据'
      } catch (error) {
        this.emptyText = '加载失败'
      } finally {
        this.showLoading = false
      }
    },

    // 取消信令
    async handleCancel (id) {
      try {
        await this.$confirm('确定要取消该信令吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.cancelLoading = true
        const res = await signaling.cancelSignaling(id)
        if (res.data && res.data.code === 200) {
          this.$message.success('信令取消成功！')
          this.refreshSignalingList()
        } else {
          if (res.data && res.data.msg) {
            this.$message.error(res.data.msg)
          } else {
            this.$message.error('信令取消失败')
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('取消请求失败，请重试')
          console.error('取消接口错误：', error)
        }
      } finally {
        this.cancelLoading = false
      }
    },

    // 删除失败信令
    async handleDelete (id) {
      try {
        await this.$confirm('确定要删除该失败信令吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.deleteLoading = true
        const res = await signaling.deleteFailedSignaling(id)
        if (res.data && res.data.code === 200) {
          this.$message.success('信令删除成功！')
          this.refreshSignalingList()
        } else {
          if (res.data && res.data.msg) {
            this.$message.error(res.data.msg)
          } else {
            this.$message.error('信令删除失败')
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除请求失败，请重试')
          console.error('删除接口错误：', error)
        }
      } finally {
        this.deleteLoading = false
      }
    },

    formatStatus (row) {
      const map = { SUCCESS: '成功', FAILED: '失败', PENDING: '处理中', DEPLOYING: '下发中' }
      return map[row.status] || '未知'
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
    .contentList {
        padding: 20px;
        box-sizing: border-box;
    }

    .select-container {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        align-items: center;
        padding: 20px;
        background: rgba(62, 39, 155, 0.5);
        border-radius: 16px;
        margin-bottom: 20px;
    }

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

    .form-row {
        display: flex;
        gap: 20px;
        align-items: flex-end;
        width: 100%;
    }

    :deep(.signaling-dialog .el-dialog__title) {
        color: #fff !important;
    }

    .signaling-select,
    .signaling-input {
        width: 100%;
        /deep/ .el-input__inner
    {
        height: 38px;
        background: #fff;
        border: 1px solid #5e40c8;
        border-radius: 8px;
        color: #000;
    }

    }

    .form-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 10px 0;
    }

    .dialog-footer {
        text-align: right;
    }

    .deploy-btn {
        height: 38px;
        padding: 0 30px;
        background: #3E279B;
        border-color: #5e40c8;
        border-radius: 8px;
        &:hover
    {
        background: #5e40c8;
    }

    }

    .show-btn {
        height: 38px;
        padding: 0 30px;
        background: #27899B;
        border-color: #40A0C8;
        border-radius: 8px;
        &:hover
    {
        background: #40A0C8;
    }

    }

    .table-container {
        background: #fff;
        border-radius: 16px;
        padding: 20px;
    }

    /deep/ .el-table {
        --el-table-border-color: #e5e7eb;
        max-height: 400px;
        overflow-y: auto;
    }

        /deep/ .el-table th {
            background: #f5f7fa !important;
        }

    .status-text {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .status-DEPLOYING {
        color: #409EFF;
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

    .cancel-btn {
        color: #F56C6C;
    }
</style>
