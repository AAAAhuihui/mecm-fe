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
      边缘节点规则下发
    </div>

    <!-- 统一内容容器 -->
    <div class="contentList">
      <!-- 顶部操作按钮 -->
      <div class="select-container">
        <el-button
          type="primary"
          icon="el-icon-send"
          @click="handleDeployDialogOpen"
          class="deploy-btn"
        >
          规则下发
        </el-button>
        <el-button
          type="primary"
          icon="el-icon-refresh"
          @click="refreshSignalingList"
          class="show-btn"
        >
          刷新数据
        </el-button>
        <div
          class="core-network-status"
          :class="{ 'core-network-status-qiantong': isQiantongCoreNetwork }"
        >
          <span class="core-network-status-dot" />
          <span class="core-network-status-label">当前核心网</span>
          <span class="core-network-status-name">{{ currentCoreNetworkLabel }}</span>
        </div>
        <el-button
          type="primary"
          icon="el-icon-setting"
          @click="handleCoreNetworkOpen"
          class="core-network-btn core-network-action"
        >
          核心网选择
        </el-button>
      </div>

      <!-- 核心网选择弹窗 -->
      <el-dialog
        title="核心网选择"
        :visible.sync="showCoreNetworkDialog"
        width="560px"
        append-to-body
        custom-class="signaling-dialog core-network-dialog"
      >
        <div
          slot="title"
          class="custom-dialog-title"
        >
          核心网选择
        </div>
        <div class="form-content core-network-form">
          <div class="form-row">
            <div class="select-item">
              <label>核心网类型</label>
              <el-select
                v-model="coreNetworkForm.coreNetworkType"
                placeholder="请选择核心网类型"
                class="signaling-select"
                @change="handleCoreNetworkChange"
              >
                <el-option
                  v-for="item in coreNetworkOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <div class="form-row">
            <div class="select-item">
              <label>NEF IP</label>
              <el-input
                v-model="coreNetworkForm.nefIp"
                placeholder="请输入NEF IP"
                clearable
                class="signaling-input"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="select-item">
              <label>NEF port</label>
              <el-input
                v-model="coreNetworkForm.nefPort"
                placeholder="请输入NEF port"
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
          <el-button @click="showCoreNetworkDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="coreNetworkLoading"
            :disabled="!coreNetworkForm.coreNetworkType || !coreNetworkForm.nefIp || !coreNetworkForm.nefPort"
            @click="handleCoreNetworkSave"
            class="deploy-btn"
          >
            确定
          </el-button>
        </span>
      </el-dialog>

      <!-- 信令下发弹窗：添加自定义类名修改标题样式 -->
      <el-dialog
        title="规则下发"
        :visible.sync="showDialog"
        width="800px"
        append-to-body
        custom-class="signaling-dialog deploy-dialog"
      >
        <!-- 自定义标题 -->
        <div
          slot="title"
          class="custom-dialog-title"
        >
          规则下发
        </div>
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
                :disabled="isQiantongCoreNetwork"
              >
                <el-option
                  label="单独UE"
                  value="single"
                  :disabled="isQiantongCoreNetwork"
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
              <label>应用名称及其ID</label>
              <el-select
                v-model="form.appId"
                placeholder="请选择应用及其APPID"
                clearable
                filterable
                class="signaling-select"
              >
                <el-option
                  v-for="app in appList"
                  :key="app.appInstanceId"
                  :label="`${app.appName ? app.appName : app.appInstanceId} ${app.appName ? `[${app.appInstanceId}]` : ''}`"
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

          <!-- 第六行：UPF -->
          <div class="form-row">
            <div class="select-item">
              <label>UPF</label>
              <el-input
                v-model="form.upf"
                placeholder="请输入UPF"
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

            :disabled="!form.ueType || (form.ueType === 'single' && !form.ueIp) || (form.ueType === 'all' && !form.networkSegment) || !form.dnn || !form.sst || !form.sd || !form.appId || !form.dnaiCode || !form.upf"

            @click="handleDeploy"
            class="deploy-btn"
          >
            确认下发
          </el-button>
        </span>
      </el-dialog>

      <!-- 信令查看弹窗 -->
      <el-dialog
        :title="''"
        :visible.sync="showViewDialog"
        width="800px"
        append-to-body
        :modal="false"
        custom-class="signaling-dialog view-dialog"
      >
        <!-- 自定义标题 -->
        <div
          slot="title"
          class="custom-dialog-title"
        >
          信令详情
        </div>
        <div class="form-content">
          <!-- 第一行：APP信息 -->
          <div class="form-row">
            <div class="select-item">
              <label>APP信息</label>
              <el-input
                v-model="currentSignaling.appInfo"
                disabled
                class="signaling-input"
              />
            </div>
          </div>

          <!-- 第二行：目标IP + DNAI编码 -->
          <div class="form-row">
            <div class="select-item">
              <label>目标IP</label>
              <el-input
                v-model="currentSignaling.targetIp"
                disabled
                class="signaling-input"
              />
            </div>
            <div class="select-item">
              <label>DNAI编码</label>
              <el-input
                v-model="currentSignaling.targetDnai"
                disabled
                class="signaling-input"
              />
            </div>
          </div>

          <!-- 第三行：UE信息 -->
          <div class="form-row">
            <div class="select-item">
              <label>UE信息</label>
              <el-input
                v-model="currentSignaling.ueInfo"
                disabled
                class="signaling-input"
              />
            </div>
          </div>

          <!-- 第四行：DNN + SST + SD -->
          <div class="form-row">
            <div class="select-item">
              <label>DNN</label>
              <el-input
                v-model="currentSignaling.dnn"
                disabled
                class="signaling-input"
              />
            </div>
            <div class="select-item">
              <label>SST</label>
              <el-input
                v-model="currentSignaling.sst"
                disabled
                class="signaling-input"
              />
            </div>
            <div class="select-item">
              <label>SD</label>
              <el-input
                v-model="currentSignaling.sd"
                disabled
                class="signaling-input"
              />
            </div>
          </div>

          <!-- 第五行：网段（仅当UE类型为全部UE时显示） -->
          <div
            class="form-row"
            v-if="currentSignaling.ueInfo && currentSignaling.ueInfo.includes('全部UE')"
          >
            <div class="select-item">
              <label>网段</label>
              <el-input
                v-model="currentSignaling.networkSegment"
                disabled
                class="signaling-input"
              />
            </div>
          </div>

          <!-- 第六行：状态 + 创建时间 -->
          <div class="form-row">
            <div class="select-item">
              <label>状态</label>
              <el-input
                v-model="currentSignaling.statusText"
                disabled
                class="signaling-input"
              />
            </div>
            <div class="select-item">
              <label>创建时间</label>
              <el-input
                v-model="currentSignaling.createTime"
                disabled
                class="signaling-input"
              />
            </div>
          </div>

          <!-- 第七行：响应信息 -->
          <div class="form-row">
            <div
              class="select-item"
              style="flex: 2;"
            >
              <label>响应信息</label>
              <el-input
                v-model="currentSignaling.responseInfo"
                type="textarea"
                :rows="3"
                disabled
                class="signaling-input"
              />
            </div>
          </div>
        </div>

        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="showViewDialog = false">关闭</el-button>
        </span>
      </el-dialog>

      <!-- 信令数据列表 -->
      <div class="table-container">
        <!-- 表头 -->
        <div class="list-header">
          <div
            class="header-item"
            style="flex: 2;"
          >
            序号
          </div>
          <div
            class="header-item"
            style="flex: 13.5;"
          >
            APP信息
          </div>
          <div
            class="header-item"
            style="flex: 3;"
          >
            DNAI
          </div>
          <div
            class="header-item"
            style="flex: 5;"
          >
            目标IP
          </div>
          <div
            class="header-item"
            style="flex: 5;"
          >
            UE信息
          </div>
          <div
            class="header-item"
            style="flex: 4;"
          >
            状态
          </div>
          <div
            class="header-item"
            style="flex: 5;"
          >
            创建时间
          </div>
          <div
            class="header-item"
            style="flex: 5;"
          >
            操作
          </div>
        </div>

        <!-- 数据列表 -->
        <div
          v-loading="showLoading"
          class="list-body"
        >
          <div
            v-if="paginatedSignalingList.length === 0"
            class="empty-list"
          >
            {{ emptyText }}
          </div>
          <div
            v-else
            v-for="(row, index) in paginatedSignalingList"
            :key="row.id || index"
            class="list-item"
            :class="{ 'data-item': row.id }"
          >
            <div
              class="item-content"
              style="flex: 2;"
            >
              {{ row.id ? ((currentPage - 1) * pageSize + index + 1) : '' }}
            </div>
            <div
              class="item-content"
              style="flex: 13.5;"
            >
              <span v-if="row.appInstanceId">{{ row.appName ? row.appName : row.appInstanceId }} {{ row.appName ? `[${row.appInstanceId}]` : '' }}</span>
            </div>
            <div
              class="item-content"
              style="flex: 3;"
            >
              {{ row.targetDnai }}
            </div>
            <div
              class="item-content"
              style="flex: 5;"
            >
              {{ row.targetIp }}
            </div>
            <div
              class="item-content"
              style="flex: 5;"
            >
              <span v-if="row.ueType">{{ row.ueType === 'all' ? '全部UE' : (row.ueType === 'single' ? `单独UE: ${row.ueIp}` : '-') }}</span>
            </div>
            <div
              class="item-content"
              style="flex: 4;"
            >
              <span
                v-if="row.status"
                class="status-text"
                :class="`status-${row.status}`"
              >
                <i
                  class="status-icon"
                  :class="getStatusIcon(row.status)"
                />
                {{ formatStatus(row) }}
              </span>
            </div>
            <div
              class="item-content"
              style="flex: 5;"
            >
              {{ formatDateTime(row) }}
            </div>
            <div
              class="item-content"
              style="flex: 5;"
            >
              <el-button
                v-if="row.id"
                type="text"
                icon="el-icon-view"
                @click="handleView(row)"
                class="view-btn"
              >
                查看
              </el-button>
              <el-button
                v-if="row.id && (row.status === 'SUCCESS' || !row.status)"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(row.id)"
                :loading="cancelLoading"
                class="delete-btn"
                :disabled="cancelLoading"
              >
                删除
              </el-button>
              <el-button
                v-if="row.id && row.status === 'FAILED'"
                type="text"
                icon="el-icon-delete"
                @click="handleDeleteFailed(row.id)"
                :loading="deleteLoading"
                class="delete-btn"
                :disabled="deleteLoading"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[9, 15]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          />
        </div>
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
      showCoreNetworkDialog: false,
      form: {
        ueType: '',
        ueIp: '',
        networkSegment: '',
        dnn: '',
        sst: '',
        sd: '',
        appId: '',
        dnaiCode: '',
        upf: ''
      },
      loading: false,
      coreNetworkLoading: false,
      showLoading: false,
      cancelLoading: false,
      deleteLoading: false,
      showViewDialog: false,
      currentSignaling: {},
      coreNetworkOptions: [
        { label: '默认核心网', value: 'default' },
        { label: '商业核心网-千通', value: 'qiantong' }
      ],
      coreNetworkConfigs: [],
      coreNetworkForm: {
        coreNetworkType: 'default',
        nefIp: '192.168.254.154',
        nefPort: 8000
      },
      appList: [],
      signalingList: [],
      paginatedSignalingList: [],
      currentPage: 1,
      pageNum: 1,
      pageSize: 9,
      total: 0,
      emptyText: '暂无信令数据'
    }
  },
  computed: {
    isQiantongCoreNetwork () {
      return this.coreNetworkForm.coreNetworkType === 'qiantong'
    },
    currentCoreNetworkLabel () {
      const option = this.coreNetworkOptions.find(item => item.value === this.coreNetworkForm.coreNetworkType)
      return option ? option.label : '默认核心网'
    }
  },
  created () {
    this.updateItemHeight()
    this.loadCoreNetworkConfigs().then(() => {
      this.refreshSignalingList()
    })
    this.loadAppInstanceIdsWithN6Ip()
  },
  methods: {
    async handleCoreNetworkOpen () {
      await this.loadCoreNetworkConfigs()
      this.showCoreNetworkDialog = true
    },

    async loadCoreNetworkConfigs () {
      const that = this
      try {
        const res = await signaling.getCoreNetworkConfigs()
        const responseData = res.data || res
        if (responseData.code === 200 && Array.isArray(responseData.data)) {
          that.coreNetworkConfigs = responseData.data
          const selectedType = window.localStorage.getItem('signalingCoreNetworkType') ||
            that.coreNetworkForm.coreNetworkType ||
            'default'
          const selectedConfig = that.coreNetworkConfigs.find(item => item.coreNetworkType === selectedType) ||
            that.coreNetworkConfigs.find(item => item.coreNetworkType === 'default') ||
            that.coreNetworkConfigs[0]
          if (selectedConfig) {
            that.coreNetworkForm = {
              coreNetworkType: selectedConfig.coreNetworkType,
              nefIp: selectedConfig.nefIp,
              nefPort: selectedConfig.nefPort
            }
            that.applyCoreNetworkFormRules()
          }
        }
      } catch (error) {
        console.error('加载核心网配置失败:', error)
      }
    },

    handleCoreNetworkChange (coreNetworkType) {
      const config = this.coreNetworkConfigs.find(item => item.coreNetworkType === coreNetworkType)
      this.coreNetworkForm = {
        coreNetworkType: coreNetworkType,
        nefIp: config && config.nefIp ? config.nefIp : '192.168.254.154',
        nefPort: config && config.nefPort ? config.nefPort : 8000
      }
      window.localStorage.setItem('signalingCoreNetworkType', coreNetworkType)
      this.applyCoreNetworkFormRules()
      this.currentPage = 1
      this.pageNum = 1
      this.refreshSignalingList()
    },

    getIsQiantongCoreNetwork () {
      return this.coreNetworkForm.coreNetworkType === 'qiantong'
    },

    applyCoreNetworkFormRules () {
      if (this.getIsQiantongCoreNetwork()) {
        this.form.ueType = 'all'
        this.form.ueIp = ''
      }
    },

    handleDeployDialogOpen () {
      this.applyCoreNetworkFormRules()
      this.showDialog = true
    },

    async handleCoreNetworkSave () {
      const portNumber = Number(this.coreNetworkForm.nefPort)
      if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
        this.$message.warning('请输入1-65535范围内的端口')
        return
      }
      this.coreNetworkLoading = true
      try {
        const params = {
          coreNetworkType: this.coreNetworkForm.coreNetworkType,
          nefIp: this.coreNetworkForm.nefIp,
          nefPort: portNumber
        }
        const res = await signaling.saveCoreNetworkConfig(params)
        const responseData = res.data || res
        if (responseData.code === 200) {
          this.$message.success('核心网配置保存成功')
          this.showCoreNetworkDialog = false
          window.localStorage.setItem('signalingCoreNetworkType', this.coreNetworkForm.coreNetworkType)
          await this.loadCoreNetworkConfigs()
          this.applyCoreNetworkFormRules()
          this.currentPage = 1
          this.pageNum = 1
          this.refreshSignalingList()
        } else {
          this.$message.error(responseData.msg || '核心网配置保存失败')
        }
      } catch (error) {
        this.$message.error('核心网配置保存失败')
        console.error(error)
      } finally {
        this.coreNetworkLoading = false
      }
    },

    // ✅【最终修复】加载APPID列表，解决“暂无APPID数据”问题
    async loadAppInstanceIdsWithN6Ip () {
      const that = this
      try {
        const res = await getAllAppinstanceIdsWithN6Ip()
        console.log('✅ 接口完整返回:', res)

        // 兼容 axios 包装层
        const responseData = res.data || res

        if (responseData.code === 200 && Array.isArray(responseData.data)) {
          that.appList = responseData.data
          console.log('✅ APPID渲染成功:', that.appList)
        } else {
          that.$message.warning('暂无APPID数据')
          that.appList = []
        }
      } catch (error) {
        that.$message.error('加载APPID失败')
        console.error('❌ 接口错误:', error)
      }
    },

    // 信令下发
    async handleDeploy () {
      const that = this
      try {
        that.loading = true
        const app = that.appList.find(item => item.appInstanceId === that.form.appId)
        const targetIp = app ? app.n6Ip : ''
        if (!targetIp) {
          that.$message.warning('该APPID未关联N6IP！')
          that.loading = false
          return
        }

        const params = {
          appId: that.form.appId,
          dnai: that.form.dnaiCode,
          targetIp: targetIp,
          coreNetworkType: that.coreNetworkForm.coreNetworkType,
          ueType: that.getIsQiantongCoreNetwork() ? 'all' : that.form.ueType,
          ueIp: that.form.ueIp || '',
          networkSegment: that.form.networkSegment || '',
          dnn: that.form.dnn,
          sst: that.form.sst,
          sd: that.form.sd,
          upf: that.form.upf || ''
        }
        const res = await signaling.createPolicy(params)

        if (res.data && res.data.code === 200) {
          that.$message.success('信令下发成功！')
          that.showDialog = false
          that.resetForm()
          that.refreshSignalingList()
        } else {
          if (res.data && res.data.msg) {
            that.$message.error(res.data.msg)
          } else {
            that.$message.error('下发失败')
          }
          that.refreshSignalingList()
        }
      } catch (error) {
        that.$message.error('信令下发失败')
        console.error(error)
        that.refreshSignalingList()
      } finally {
        that.loading = false
      }
    },

    // 重置表单
    resetForm () {
      this.form = {
        ueType: this.getIsQiantongCoreNetwork() ? 'all' : '',
        ueIp: '',
        networkSegment: '',
        dnn: '',
        sst: '',
        sd: '',
        appId: '',
        dnaiCode: '',
        upf: ''
      }
    },

    // 刷新列表
    async refreshSignalingList () {
      const that = this
      that.showLoading = true
      that.emptyText = '加载中...'
      try {
        const params = {
          page: that.currentPage,
          size: that.pageSize,
          coreNetworkType: that.coreNetworkForm.coreNetworkType
        }
        const res = await signaling.getAllSignaling(params)
        let data = []
        if (res && res.data) {
          if (Array.isArray(res.data.data)) {
            data = res.data.data
            that.total = res.data.total || 0
          } else if (Array.isArray(res.data)) {
            data = res.data
            that.total = data.length
          }
        }

        // 只显示实际数据，不补充空对象
        that.signalingList = data
        that.paginatedSignalingList = data
        that.emptyText = data.length && data[0].id ? '' : '暂无信令数据'
      } catch (error) {
        that.emptyText = '加载失败'
      } finally {
        that.showLoading = false
      }
    },

    // 页码变化
    handleCurrentChange (current) {
      this.currentPage = current
      this.pageNum = current
      this.refreshSignalingList()
    },

    // 每页条数变化
    handleSizeChange (size) {
      this.pageSize = size
      this.currentPage = 1
      this.pageNum = 1
      this.updateItemHeight()
      this.refreshSignalingList()
    },

    // 更新行高
    updateItemHeight () {
      let itemHeight, itemPadding
      if (this.pageSize === 9) {
        itemHeight = 40 // 9条 × 40px = 360px
        itemPadding = '6px'
      } else if (this.pageSize === 15) {
        itemHeight = 24 // 15条 × 24px = 360px
        itemPadding = '2px'
      }
      document.documentElement.style.setProperty('--item-height', `${itemHeight}px`)
      document.documentElement.style.setProperty('--item-padding', itemPadding)
    },

    // 删除信令
    async handleDelete (id) {
      const that = this
      try {
        await that.$confirm('确定要删除该信令吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        that.cancelLoading = true
        const res = await signaling.cancelSignaling(id)
        if (res.data && res.data.code === 200) {
          that.$message.success('信令删除成功！')
          // 检查当前页是否只有一条数据，如果是则跳转到上一页
          if (that.paginatedSignalingList.length === 1 && that.currentPage > 1) {
            that.currentPage--
            that.pageNum--
          }
          that.refreshSignalingList()
        } else {
          if (res.data && res.data.msg) {
            that.$message.error(res.data.msg)
          } else {
            that.$message.error('信令删除失败')
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          that.$message.error('删除请求失败，请重试')
          console.error('删除接口错误：', error)
        }
      } finally {
        that.cancelLoading = false
      }
    },

    // 查看信令详情
    handleView (row) {
      // 格式化信令数据
      const ueInfo = row.ueType ? (row.ueType === 'all' ? '全部UE' : (row.ueType === 'single' ? `单独UE: ${row.ueIp}` : '-')) : ''
      this.currentSignaling = {
        appInfo: row.appInstanceId ? `${row.appName ? row.appName : row.appInstanceId} ${row.appName ? `[${row.appInstanceId}]` : ''}` : '',
        targetIp: row.targetIp || '',
        targetDnai: row.targetDnai || '',
        ueInfo: ueInfo,
        dnn: row.dnn || '',
        sst: row.sst || '',
        sd: row.sd || '',
        networkSegment: row.networkSegment || '',
        statusText: this.formatStatus(row),
        createTime: this.formatDateTime(row),
        responseInfo: row.responseBody || ''
      }
      // 显示查看弹窗
      this.showViewDialog = true
    },

    // 删除失败信令
    async handleDeleteFailed (id) {
      const that = this
      try {
        await that.$confirm('确定要删除该失败信令吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        that.deleteLoading = true
        const res = await signaling.deleteFailedSignaling(id)
        if (res.data && res.data.code === 200) {
          that.$message.success('信令删除成功！')
          // 检查当前页是否只有一条数据，如果是则跳转到上一页
          if (that.paginatedSignalingList.length === 1 && that.currentPage > 1) {
            that.currentPage--
            that.pageNum--
          }
          that.refreshSignalingList()
        } else {
          if (res.data && res.data.msg) {
            that.$message.error(res.data.msg)
          } else {
            that.$message.error('信令删除失败')
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          that.$message.error('删除请求失败，请重试')
          console.error('删除接口错误：', error)
        }
      } finally {
        that.deleteLoading = false
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
      if (!row || !row.createTime) return ''
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
        color: #000;
    }

    }

    .form-row {
        display: flex;
        gap: 20px;
        align-items: flex-end;
        width: 100%;
    }

    /* 弹窗标题样式 */
    .signaling-dialog {
        .el-dialog__header {
            position: relative;
            padding: 0 !important;
            background: #3E279B !important;
            border-radius: 8px 8px 0 0 !important;
            margin: 10px !important;
            margin-bottom: 0 !important;
            height: 80px !important;
        }
        .el-dialog__body {
            background: #fff !important;
            padding: 20px !important;
        }
    }

    /* 弹窗基础样式 */
    .signaling-dialog {
        z-index: 1001 !important;
    }

    /* 确保弹窗内容区域不透明 */
    .signaling-dialog .el-dialog {
        background: #fff !important;
    }

    /* 查看弹窗：透明遮罩，无模糊效果 */
    body .view-dialog {
        background: transparent !important;
        backdrop-filter: none !important;
        z-index: 1000 !important;
        opacity: 1 !important;
        filter: none !important;
        transition: none !important;
    }

    /* 信令下发弹窗：恢复默认遮罩效果 */
    body .deploy-dialog {
        /* 恢复默认样式，不做特殊处理 */
    }

    /* 确保弹窗内容直接显示 */
    .el-dialog {
        transition: none !important;
        animation: none !important;
    }

    /* 自定义标题样式 */
    .custom-dialog-title {
        color: #000 !important;
        font-size: 18px !important;
        font-weight: bold !important;
        position: absolute !important;
        left: 20px !important;
        top: 10px !important;
        margin: 0 !important;
        padding: 0 !important;
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
        color: #000 !important;
    }
    /deep/ .el-input.is-disabled .el-input__inner {
        color: #000 !important;
        background: #fff !important;
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

    .core-network-btn {
        height: 38px;
        padding: 0 30px;
        background: #5e40c8;
        border-color: #5e40c8;
        border-radius: 8px;
        &:hover
    {
        background: #7557df;
        border-color: #7557df;
    }

    }

    .core-network-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 38px;
        padding: 0 16px;
        border: 1px solid rgba(39, 137, 155, 0.45);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 4px 12px rgba(16, 24, 40, 0.12);
        color: #1f2933;
        white-space: nowrap;
    }

    .core-network-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #27899B;
        box-shadow: 0 0 0 4px rgba(39, 137, 155, 0.15);
        flex: 0 0 auto;
    }

    .core-network-status-label {
        color: #5f6b7a;
        font-size: 13px;
    }

    .core-network-status-name {
        color: #1f2933;
        font-size: 14px;
        font-weight: 700;
    }

    .core-network-status-qiantong {
        border-color: rgba(94, 64, 200, 0.45);
        background: #f6f2ff;
        .core-network-status-dot {
            background: #5e40c8;
            box-shadow: 0 0 0 4px rgba(94, 64, 200, 0.16);
        }
        .core-network-status-name {
            color: #3E279B;
        }
    }

    .core-network-action {
        margin-left: auto;
    }

    .table-container {
        background: #fff;
        border-radius: 16px;
        padding: 20px;
        min-height: 490px;
    }

    /* 列表样式 */
    .list-header {
        display: flex;
        align-items: center;
        background: #e9ecef;
        border-bottom: 1px solid #dee2e6;
        padding: 12px 0;
        font-weight: bold;
        border-radius: 8px 8px 0 0;
    }

    .header-item {
        text-align: center;
        padding: 0 10px;
        box-sizing: border-box;
        color: #000;
        font-size: 16px;
        font-weight: bold;
    }

    .list-body {
        min-height: 400px;
        max-height: 400px;
        overflow-y: auto;
    }

    .list-item {
        display: flex;
        align-items: center;
        padding: var(--item-padding) 0;
        transition: background-color 0.3s;
        min-height: var(--item-height);
    }

    .data-item {
        border-bottom: 1px solid #f0f0f0;
    }

    .list-item:hover {
        background-color: #f8f9fa;
    }

    .item-content {
        text-align: center;
        padding: 0 10px;
        box-sizing: border-box;
        word-break: break-all;
        color: #000;
        font-size: 14px;
        font-weight: normal;
    }

    .empty-list {
        text-align: center;
        padding: 100px 0;
        color: #909399;
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

    .view-btn {
        color: #409EFF;
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: 20px;
        font-size: 14px;
    }

    /deep/ .el-pagination {
        display: flex;
        align-items: center;
    }

    /deep/ .el-pagination__total {
        margin-right: 10px;
    }

    /deep/ .el-pagination__sizes {
        margin-right: 10px;
    }

    /deep/ .el-pagination__jump {
        margin-left: 10px;
    }

    /deep/ .el-pagination__button {
        border-color: #dcdfe6;
    }

    /deep/ .el-pagination__button:hover {
        color: #409eff;
        border-color: #c6e2ff;
    }

    /deep/ .el-pagination__active {
        background-color: #409eff;
        border-color: #409eff;
    }

    /deep/ .el-pagination__active:hover {
        background-color: #66b1ff;
        border-color: #66b1ff;
    }

</style>

<style lang='less'>
/* 全局样式：调整Message弹窗位置，向下移动20px */
.el-message {
    top: 80px !important;
}
</style>
