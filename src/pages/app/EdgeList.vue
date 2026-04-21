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
  <div class="edge-list-page">
    <div class="btnMain">
      <el-button
        type="primary"
        @click="distribute"
      >
        <span
          class="iconcont"
          style="top:0;"
        >√</span>
        <span>{{ $t('app.packageList.distribute') }}</span>
      </el-button>
    </div>
    <div class="contentList">
      <Search
        :placeholder="$t('tip.fuzzyQuery')"
        @getSearchData="getSearchData"
      />
      <span class="btnSearch">
        <el-button
          type="primary"
          @click="multipleDeploy"
        >
          <span>{{ $t('app.distriList.multipleDeploy') }}</span>
        </el-button>
      </span>
      <div class="tableDiv">
        <el-table
          class="mt20"
          size="small"
          :data="currPageTableData"
          v-loading="dataLoading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            revers-selection
            width="50"
          />
          <el-table-column
            prop="appPackageName"
            :label="$t('app.packageList.name')"
            width="180"
          >
            <template>
              <div>
                {{ this.appPackageName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="appVersion"
            :label="$t('app.packageList.version')"
            width="130"
          >
            <template>
              <div>
                {{ this.appVersion }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="provider"
            :label="$t('app.packageList.vendor')"
            width="160"
          >
            <template>
              <div>
                {{ this.provider }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="appAffinity"
            :label="$t('app.packageList.affinity')"
            width="120"
          >
            <template>
              <div>
                {{ this.appAffinity }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="hostIp"
            :label=" $t('app.distriList.hostIp')"
          />
          <el-table-column
            prop="status"
            :label=" $t('app.distriList.status')"
          >
            <template slot-scope="scope">
              <span
                v-if="scope.row.status === 'Distributed'||scope.row.status === 'uploaded'"
                class="success"
              ><em class="el-icon-success" />{{ scope.row.status }}</span>
              <span
                v-else-if="scope.row.status === 'Processing'"
                class="primary"
              ><em class="el-icon-loading" />{{ scope.row.status }}</span>
              <span
                v-else
                class="error"
              ><em class="el-icon-error" />{{ scope.row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.operation')"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                id="deleteBtn"
                @click.native.prevent="beforeDelete(scope.row)"
                type="text"
                size="small"
              >
                {{ $t('common.delete') }}
              </el-button>
              <el-button
                id="deployBtn"
                @click="deploy(scope.row,1)"
                :disabled="scope.row.status !=='Distributed' && scope.row.status !=='uploaded'"
                type="text"
                size="small"
              >
                {{ $t('app.distriList.deploy') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pageBar">
          <Pagination
            :page-sizes="[10,15,20,25]"
            :table-data="paginationData"
            @getCurrentPageData="getCurrentPageData"
          />
        </div>
      </div>
      <el-dialog
        :show-close="false"
        :visible.sync="dialogVisible"
        width="55%"
      >
        <div class="secondLabel">
          {{ $t('app.distriList.deploymentConf') }}
        </div>
        <el-form
          label-width="auto"
          class="configForm"
          :model="configForm"
          ref="configForm"
          :rules="rules"
        >
          <p>MEC Host</p>
          <el-form-item
            :label="$t('app.packageList.ip')"
            label-width="140px"
          >
            <div
              v-for="(item,index) in hostList"
              :key="index"
            >
              <span
                class="hostip"
              >{{ item.hostIp }}</span>
              <span
                v-if="item.status === 'Distributed'||item.status === 'uploaded'"
                class="success"
              ><em class="el-icon-success" />{{ item.status }}</span>
            </div>
          </el-form-item>
          <!-- [新增] 2026-01-05 网络平面选择，移到IP地址下面 -->
          <el-form-item
            :label="$t('app.distriList.networkPlane')"
            prop="selectedNetworkPlane"
            label-width="140px"
          >
            <el-select
              v-model="configForm.selectedNetworkPlane"
              :placeholder="$t('app.distriList.selectNetworkPlane')"
              :loading="isLoadingNetworkPlanes"
              style="width: 100%"
            >
              <el-option
                v-for="option in networkPlaneOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('app.distriList.appName')"
            prop="appName"
            label-width="140px"
          >
            <el-input
              id="appname"
              maxlength="20"
              v-model="configForm.appName"
            />
          </el-form-item>
          <el-form-item
            :label="$t('app.distriList.appDesc')"
            prop="appInstanceDescription"
            label-width="140px"
          >
            <el-input
              id="appdesc"
              maxlength="120"
              v-model="configForm.appInstanceDescription"
            />
          </el-form-item>
          <!--
          <el-form-item
            :label="$t('system.edgeNodes.hwCapability')"
            prop="hwCapabilities"
            label-width="140px"
          >
            <el-checkbox-group
              v-model="configForm.hwCapabilities"
            >
              <el-checkbox
                v-for="item in capabilities"
                :label="item"
                :key="item"
              >
                {{ item }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          -->
          <p v-if="templateInputs.length>0">
            Apptemplate Information
          </p>
          <el-row>
            <el-col
              :span="12"
              v-for="(item,index) in templateInputs"
              :key="index"
            >
              <el-form-item
                :label="item.label"
              >
                <el-input
                  id="podsel"
                  maxlength="30"
                  v-model="item.value"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            id="confirmBtn"
            type="primary"
            size="small"
            @click="confirmToDeploy('configForm')"
            :loading="loading"
          >{{ $t('common.confirm') }}</el-button>
          <el-button
            id="cancelBtn"
            size="small"
            @click="dialogVisible = false,loading=false"
          >{{ $t('common.cancel') }}</el-button>
        </span>
      </el-dialog>

      <!-- 分发 -->
      <el-dialog
        :show-close="false"
        :visible.sync="distributionDialogVisible"
        v-loading="disLoading"
      >
        <div class="secondLabel">
          {{ $t('app.packageList.slectEdgeNodes') }}
        </div>
        <el-row class="el-row-search">
          <el-col
            :span="8"
            :offset="16"
          >
            <el-input
              id="nodesearch"
              class="el-input-search"
              v-model="edgeNodeSearchInput"
            >
              <em
                slot="suffix"
                class="el-input__icon el-icon-search"
              />
            </el-input>
          </el-col>
        </el-row>
        <el-row class="el-row-table">
          <el-col :span="24">
            <el-table
              ref="multipleEdgeNodeTable"
              :data="currPageEdgeNodeTableData"
              class="mt20"
              size="small"
              @selection-change="handleEdgeNodeSelectionChange"
            >
              <el-table-column
                type="selection"
              />
              <el-table-column
                prop="mechostName"
                sortable
                :label="$t('app.packageList.name')"
              />
              <el-table-column
                prop="mechostIp"
                :label="$t('app.packageList.ip')"
              />
              <el-table-column
                prop="city"
                :label="$t('app.packageList.city')"
              />
              <el-table-column
                prop="affinity"
                :label="$t('app.packageList.affinity')"
              />
              <el-table-column
                prop="mepmIp"
                :label="$t('system.edgeNodes.mepmIp')"
              />
              <el-table-column
                :label="$t('system.edgeNodes.hwCapability')"
                width="200"
              >
                <template slot-scope="scope">
                  <span
                    v-for="(item,index) in scope.row.hwcapabilities"
                    :key="index"
                  >
                    {{ item.hwType }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <el-row>
          <el-pagination
            background
            class="pagination rt"
            @size-change="handleEdgeNodePageSizeChange"
            @current-change="handleEdgeNodeCurrentPageChange"
            :current-page="edgeNodeCurrentPage"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="edgeNodePageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="edgeNodeTotalNum"
          />
        </el-row>
        <div
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            id="confirmBtn"
            type="primary"
            size="small"
            @click="confirm()"
            :loading="loading"
          >
            {{ $t('common.confirm') }}
          </el-button>
          <el-button
            id="cancelBtn"
            size="small"
            @click="cancel()"
          >
            {{ $t('common.cancel') }}
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Search from '../../components/common/Search.vue'
import Pagination from '../../components/common/Pagination.vue'
import { appo, apm, inventory } from '../../tools/request.js'
export default {
  name: 'EdgeList',
  components: {
    Search, Pagination
  },
  data () {
    return {
      loading: false,
      currPageTableData: [],
      paginationData: [],
      searchVal: '',
      selectData: null,
      selectedData: [],
      appPackageId: '',
      appVersion: '',
      appPackageName: '',
      appAffinity: '',
      provider: '',
      dialogVisible: false,
      configForm: {
        status: '',
        appPackageId: '',
        appName: '',
        appInstanceDescription: '',
        appId: this.appId,
        hwCapabilities: [],
        selectedNetworkPlane: 'default' // [新增] 2026-01-05 选中的网络平面，默认为 default
      },
      dataLoading: true,
      tableData: [],
      packageData: [],
      interval: null,
      instanceId: '',
      timer: null,
      distributionStatus: ['Distributed', 'Error'],
      serchData: null,
      hostList: [],
      // [新增] 2026-01-05 网络平面动态选择功能
      availableNetworkPlanes: {}, // 当前主机可用的网络平面 {"eth1": "n6-net-1", "eth2": "n6-net-2"}
      networkPlaneOptions: [], // 网络平面下拉选项
      isLoadingNetworkPlanes: false, // 加载网络平面数据的状态
      templateInputs: [],
      capabilities: ['GPU', 'NPU'],
      // 分发
      appId: window.location.href.split('=')[1] || sessionStorage.getItem('appId'),
      edgeNodesData: [],
      distributionDialogVisible: false,
      packageSearchInput: '',
      edgeNodeSearchInput: '',
      edgeNodeCurrentPage: 1,
      edgeNodePageSize: 5,
      rowSelection: [],
      nodeSelection: [],
      selectedNodeNum: 0,
      currentRowData: '',
      dialogLoading: false
    }
  },
  computed: {
    edgeNodeTotalNum: function () {
      return this.edgeNodesData.length
    },
    totalNum: function () {
      return this.tableData.length
    },
    currPageEdgeNodeTableData: function () {
      return this.edgeNodesData.filter(data => !this.edgeNodeSearchInput || data.mechostName.toLowerCase().includes(this.edgeNodeSearchInput.toLowerCase()))
    },
    rules () {
      return {
        appName: [
          { required: true, message: this.$t('verify.appNameVerify'), trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]{4,16}$/, message: this.$t('verify.hostNameVerify') }
        ],
        appInstanceDescription: [
          { required: true, message: this.$t('verify.descVerify'), trigger: 'blur' }
        ],
        selectedNetworkPlane: [
          { required: true, message: '请选择网络平面', trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
    this.initList()
    this.interval = setInterval(() => {
      this.initList()
    }, 15000)
  },
  beforeDestroy () {
    this.clearInterval()
  },
  methods: {
    clearInterval () {
      clearTimeout(this.interval)
      this.interval = null
      clearTimeout(this.timer)
      this.timer = null
    },
    // 对app表格进行筛选 val：需要查询的值  key: 数据对应的字段
    filterTableData (val) {
      this.paginationData = this.paginationData.filter(item => {
        return Object.keys(item).some(key => {
          return String(item[key]).toLowerCase().indexOf(val) > -1
        })
      })
    },
    // 根据搜索组件进行筛选
    getSearchData (data) {
      this.serchData = data
      this.paginationData = this.tableData
      if (data) {
        this.filterTableData(data.toLowerCase())
      } else {
        this.initList()
      }
    },
    getCurrentPageData (data) {
      this.currPageTableData = data
    },
    multipleDeploy () {
      this.configForm = {
        status: '',
        appPackageId: '',
        appName: '',
        appInstanceDescription: '',
        appId: this.appId,
        hwCapabilities: []
      }
      if (this.selectData !== null && this.selectData.length > 0) {
        let allStatus = []
        this.selectData.forEach(item => {
          allStatus.push(item.status)
        })
        if (!allStatus.includes('Error')) {
          this.deploy(this.selectData, 2)
        } else {
          this.$message.error(this.$t('app.distriList.deleteError'))
        }
      } else {
        this.$message.warning(this.$t('tip.onePackageAtLeast'))
      }
    },
    beforeDelete (rows) {
      this.$confirm(this.$t('tip.beforeDeleteFromMechost'), this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        let hostIp = rows.hostIp
        let type = 1
        apm.deleteDistributionApp(type, hostIp, this.appPackageId).then(res => {
          this.showMessage('success', this.$t('tip.deletePacFrmoHost'), 1500)
          this.initList()
        })
      })
    },
    initList () {
      apm.getDistributionList().then(res => {
        this.paginationData = []
        res.data.forEach(item => {
          if (item.appId === this.appId) {
            this.appPackageId = item.appPkgId
            this.appPackageName = item.appPkgName
            this.appVersion = item.appPkgVersion
            this.appAffinity = item.appPkgAffinity
            this.provider = item.appProvider
            this.paginationData = item.mecHostInfo
          }
        })
        this.tableData = this.paginationData
        if (this.serchData) {
          this.getSearchData(this.serchData)
        }
        this.dataLoading = false
      }).catch((error) => {
        console.log(error)
        this.dataLoading = false
        this.tableData = this.paginationData = []
      })
    },
    deploy (row, type) {
      // [临时测试] 如果开启测试模式，使用mock模板数据
      if (this.testMode) {
        this.showDeployDialog(row, type, [])
        return
      }

      apm.getApptemplateApi(this.appPackageId).then(res => {
        this.templateInputs = []
        if (res.data.deployType !== 'container') {
          let inputs = res.data.inputs
          inputs.forEach(ele => {
            let obj = {
              label: '',
              value: ''
            }
            obj.label = ele.name
            obj.value = ele.defaultValue
            this.templateInputs.push(obj)
          })
        }
        this.configForm = {
          status: '',
          appPackageId: '',
          appName: '',
          appInstanceDescription: '',
          appId: this.appId,
          hwCapabilities: [],
          selectedNetworkPlane: 'default' // [修复] 重置网络平面选择为默认值
        }
        this.hostList = []
        this.configForm.appPackageId = this.appPackageId
        this.configForm.appId = this.appId
        this.dialogVisible = true
        this.$nextTick(() => {
          this.$refs.configForm.resetFields()
        })
        if (type === 2) {
          let array = []
          row.forEach(item => {
            array.push(item.hostIp)
          })
          this.configForm.mecHost = array
          this.hostList = row
          // [修复] 批量部署时，查询第一个主机的网络平面数据填充下拉框
          // 注意：这只是查询数据，不影响方案2的参数传递逻辑
          this.fetchHostNetworkPlanes(row[0].hostIp)
        } else {
          this.configForm.mecHost = row.hostIp
          this.hostList.push(row)
          // [修复] 单主机部署时，查询该主机的网络平面数据填充下拉框
          // 注意：这只是查询数据，不影响方案2的参数传递逻辑
          this.fetchHostNetworkPlanes(row.hostIp)
        }
      }).catch(() => {
        this.$message({
          showClose: true,
          type: 'warning',
          message: this.$t('tip.getTemplateListFail'),
          duration: 2000
        })
      })
    },
    confirmToDeploy (configForm) {
      this.$refs[configForm].validate(valid => {
        if (valid) {
          // [方案2修改] Create阶段不传递networkPlane参数
          // networkPlane将在Instantiate阶段通过parameters传递给AppLCM
          let params = {
            appId: this.configForm.appId,
            appPackageId: this.configForm.appPackageId,
            appName: this.configForm.appName,
            appInstanceDescription: this.configForm.appInstanceDescription,
            mecHost: this.configForm.mecHost,
            hwCapabilities: this.configForm.hwCapabilities
            // [已移除] networkPlane 参数不在Create阶段传递
            // networkPlane: this.configForm.selectedNetworkPlane !== 'default'
            //   ? this.configForm.selectedNetworkPlane
            //   : null
          }
          this.loading = true
          if (typeof (params.mecHost) === 'string') {
            appo.confirmToDeploy(params).then(res => {
              let instanceId = res.data.response.app_instance_id
              this.timer = setTimeout(() => { this.queryInstanceStatus(instanceId) }, 1000)
            }).catch(() => {
              this.$message.error(this.$t('tip.deployFailed'))
              this.dialogVisible = false
            })
          } else {
            appo.confirmToBatchDeploy(params).then(res => {
              let instanceIds = res.data.response
              let len = instanceIds.length
              this.timer = setTimeout(() => { this.batchInstaniateApp(instanceIds) }, 6000 * len)
            }).catch(() => {
              this.$message.error(this.$t('tip.deployFailed'))
              this.dialogVisible = false
            })
          }
        }
      })
    },
    queryInstanceStatus (instanceids) {
      appo.getInstanceInfo(instanceids).then(res1 => {
        let status = res1.data.response.operationalStatus
        if (status === 'Created') {
          this.instaniateApp(instanceids)
        } else if (status === 'Create failed') {
          this.$message.error(res1.data.response.operationInfo)
          this.dialogVisible = false
          this.loading = false
        } else {
          this.timer = setTimeout(() => { this.queryInstanceStatus(instanceids) }, 1000)
        }
      }).catch(err => {
        if (err.name === 'Error' && err.message === 'Request failed with status code 404') {
          setTimeout(() => { this.queryInstanceStatus() }, 1000)
        } else {
          throw err
        }
      })
    },
    instaniateApp (instanceId) {
      // [方案2修改] 统一使用parameters传递所有参数
      let params = {
        parameters: {}
      }

      // 添加应用模板参数
      if (this.templateInputs.length > 0) {
        this.templateInputs.forEach(item => {
          let key = item.label
          params.parameters[key] = item.value
        })
      }

      // [关键] 将用户选择的网络平面参数加入parameters
      // 在Instantiate阶段传递给mecm-appo，最终转发给AppLCM进行部署
      if (this.configForm.selectedNetworkPlane && this.configForm.selectedNetworkPlane !== 'default') {
        params.parameters['networkPlane'] = this.configForm.selectedNetworkPlane
        console.log('Network plane selected:', this.configForm.selectedNetworkPlane)
      }

      // 如果没有任何参数，则不传body
      if (Object.keys(params.parameters).length === 0) {
        appo.instantiateApp(instanceId).then(response => {
          this.afterInstantiateApp(instanceId)
        }).catch(() => {
          this.catchInstantiateApp()
        })
      } else {
        // 有参数时传递parameters
        appo.instantiateApp(instanceId, params).then(response => {
          this.afterInstantiateApp(instanceId)
        }).catch(() => {
          this.catchInstantiateApp()
        })
      }
    },
    afterInstantiateApp (instanceId) {
      this.loading = false
      this.dialogVisible = false
      setTimeout(() => {
        appo.setProfile(instanceId).then(res => {
          this.$nextTick(() => {
            this.$router.push('/mecm/app/deploy/instance')
          })
        })
      }, 30000)
    },
    catchInstantiateApp () {
      this.$message.error(this.$t('tip.deployFailed'))
      this.dialogVisible = false
      this.loading = false
    },
    batchInstaniateApp (instanceId) {
      let obj = {
        instantiationParameters: []
      }
      instanceId.forEach(item => {
        let paramObj = {
          parameters: {}
        }
        paramObj.appInstanceId = item.appInstanceId

        // 添加应用模板参数
        this.templateInputs.forEach(val => {
          let key = val.label
          paramObj.parameters[key] = val.value
        })

        // [方案2修改] 批量实例化时也添加网络平面参数
        // 确保批量部署时每个实例都使用相同的网络平面配置
        if (this.configForm.selectedNetworkPlane && this.configForm.selectedNetworkPlane !== 'default') {
          paramObj.parameters['networkPlane'] = this.configForm.selectedNetworkPlane
          console.log('Batch deploy - Network plane selected:', this.configForm.selectedNetworkPlane)
        }

        obj.instantiationParameters.push(paramObj)
      })
      appo.batchInstantiateApp(obj).then(response => {
        this.afterInstantiateApp()
      }).catch(() => {
        this.catchInstantiateApp()
      })
    },
    handleSelectionChange (selection) {
      this.selectData = selection
    },

    /**
     * [新增/修复] 2026-01-05 查询主机的网络平面配置
     * 功能说明：从后端数据库查询指定主机的网络平面数据，填充到下拉框供用户选择
     * 重要：此方法只负责前端数据展示，不影响参数传递的阶段（方案2逻辑不变）
     * @param {String} hostIp - 主机IP地址
     */
    fetchHostNetworkPlanes (hostIp) {
      this.isLoadingNetworkPlanes = true
      this.availableNetworkPlanes = {}
      this.networkPlaneOptions = []

      // [测试模式] 如果启用testMode，使用mock数据
      if (this.testMode) {
        const mockNetworkPlanes = {
          'eth1': 'n6_net_1',
          'eth2': 'n6_net_2'
        }
        this.availableNetworkPlanes = mockNetworkPlanes
        this.buildNetworkPlaneOptions(mockNetworkPlanes)
        this.isLoadingNetworkPlanes = false
        return
      }

      // 从后端inventory服务查询主机记录中的网络平面配置
      inventory.getMecHostRecord(hostIp).then(res => {
        const networkPlanes = res.data.networkPlanes || {}
        this.availableNetworkPlanes = networkPlanes
        this.buildNetworkPlaneOptions(networkPlanes)
        this.isLoadingNetworkPlanes = false
      }).catch(error => {
        console.error('Failed to fetch network planes:', error)
        // 查询失败时使用默认选项
        this.buildNetworkPlaneOptions({})
        this.isLoadingNetworkPlanes = false
      })
    },

    /**
     * [新增/修复] 2026-01-05 构建网络平面下拉选项
     * 功能说明：将后端返回的网络平面数据转换为el-select组件需要的选项格式
     * @param {Object} networkPlanes - 网络平面映射对象 {"eth1": "n6_net_1", "eth2": "n6_net_2"}
     */
    buildNetworkPlaneOptions (networkPlanes) {
      // 始终添加默认选项
      this.networkPlaneOptions = [
        {
          value: 'default',
          label: this.$t('app.distriList.networkPlaneDefault') || '[默认] K8s集群管理网络'
        }
      ]

      // 添加主机实际支持的网络平面选项
      Object.entries(networkPlanes).forEach(([interfaceName, planeName]) => {
        this.networkPlaneOptions.push({
          value: planeName,
          label: `${planeName} (${interfaceName})`
        })
      })

      console.log('Network plane options built:', this.networkPlaneOptions)
    },

    // 分发
    distribute () {
      let row = JSON.parse(sessionStorage.getItem('appRow'))
      console.log(row)
      this.currentRowData = row
      this.distributionDialogVisible = true
      this.getNodeList(row)
    },
    handleEdgeNodeSelectionChange (val) {
      this.nodeSelection = val
      this.selectedNodeNum = val.length
    },
    async getNodeList (row) {
      sessionStorage.setItem('appId', row.appId)
      await inventory.getList(2).then(response => {
        this.edgeNodesData = response.data
      }).catch((error) => {
        console.log(error)
      })
    },
    handleEdgeNodePageSizeChange (edgeNodePageSize) {
      this.edgeNodePageSize = edgeNodePageSize
    },
    handleEdgeNodeCurrentPageChange (edgeNodeCurrentPage) {
      this.edgeNodeCurrentPage = edgeNodeCurrentPage
    },
    cancel () {
      this.distributionDialogVisible = false
      this.$refs.multipleEdgeNodeTable.clearSelection()
    },
    async confirm () {
      this.disLoading = true
      let selectedMecHost = []
      this.nodeSelection.forEach(data => {
        let obj = {}
        obj.hostIp = data.mechostIp
        selectedMecHost.push(obj)
      })
      this.$refs.multipleEdgeNodeTable.clearSelection()
      this.isSecureBackend = sessionStorage.getItem('isSecureBackend')
      let address = 'http://'
      if (this.isSecureBackend === 'true') {
        address = 'https://'
      }
      let params = {
        appPkgId: this.currentRowData.packageId,
        appId: this.currentRowData.appId,
        appPkgName: this.currentRowData.name,
        appPkgVersion: this.currentRowData.version,
        appPkgDesc: this.currentRowData.shortDesc ? this.currentRowData.shortDesc : 'none',
        appPkgAffinity: this.currentRowData.affinity,
        appPkgPath: address + this.currentRowData.appstoreEndpoint + '/mec/appstore/v1/apps/' + this.currentRowData.appId + '/packages/' + this.currentRowData.packageId + '/action/download',
        appProvider: this.currentRowData.provider,
        mecHostInfo: selectedMecHost,
        createdTime: new Date().toString(),
        modifiedTime: new Date().toString()
      }
      if (params.appPkgVersion && params.mecHostInfo.length > 0) {
        apm.confirmToDistribute(params).then(response => {
          sessionStorage.setItem('appId', params.appId)
          this.distributionDialogVisible = false
          this.$nextTick(
            this.initList()
          )
        }).catch(() => {
          this.disLoading = false
          this.$message.error(this.$t('tip.failedToDownload'), 3000)
        })
      } else {
        this.disLoading = false
        if (params.mecHostInfo.length === 0) {
          this.$message.warning(this.$t('tip.mecHost'))
        } else {
          this.$message.warning(this.$t('tip.version'))
        }
      }
    }
  }
}
</script>

<style lang='less' scoped>
.edge-list-page{
  width: 1416px;
  max-width: 100%;
  margin: 0 auto;
  position: relative;

  .btnMain{
    position: static;
    top: auto;
    right: auto;
    height: auto;
    margin: 0 0 16px;
  }

  .contentList{
    width: 100%;
    margin: 0;
    box-sizing: border-box;
  }

  .tableDiv,
  .tableDiv > .el-table{
    width: 100%;
  }
}

.configForm{
  p{
    margin-bottom: 12px;
  }
  p::before{
    content:'';
    display:inline-block;
    width:3px;
    height:15px;
    margin-right:3px;
    background: #409EFF;
    position: relative;
    top:3px;
  }
  .el-form-item{
    margin-bottom: 20px!important;
  }
  .hostip{
    margin-right:10px;
  }
}
</style>
