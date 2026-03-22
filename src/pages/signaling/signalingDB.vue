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
    <!-- 与edgeNodes相同位置的标题 -->
    <div class="topLabel">
      边缘节点信令管理
    </div>

    <!-- 核心输入区域 -->
    <div class="contentList">
      <div class="select-container">
        <!-- 1. APPID选择框（动态加载appinstance_id） -->
        <div class="select-item">
          <label>边缘节点APPID</label>
          <el-select
            v-model="form.appId"
            placeholder="请选择边缘节点APPID"
            class="signaling-select"
            clearable
            filterable
          >
            <el-option
              v-for="appId in appInstanceIdList"
              :key="appId"
              :label="appId"
              :value="appId"
            />
          </el-select>
        </div>

        <!-- 2. DNAI文本输入框 -->
        <div class="select-item">
          <label>边缘节点DNAI编码</label>
          <el-input
            v-model="form.dnaiCode"
            placeholder="请输入边缘节点DNAI编码"
            class="signaling-input"
            clearable
          />
        </div>

        <!-- 3. 流量等级选择框 -->
        <div class="select-item">
          <label>边缘节点流量等级</label>
          <el-select
            v-model="form.trafficLevel"
            placeholder="请选择流量等级"
            class="signaling-select"
            clearable
          >
            <el-option
              label="大吞吐量"
              value="High_Bandwidth"
            />
            <el-option
              label="低时延高可靠"
              value="Low_Latency"
            />
            <el-option
              label="三级流量（低优先级）"
              value="level3"
            />
          </el-select>
        </div>

        <!-- 下发部署按钮 -->
        <el-button
          type="primary"
          icon="el-icon-send"
          @click="handleDeploy"
          :disabled="!form.appId || !form.dnaiCode || !form.trafficLevel"
          class="deploy-btn"
          :loading="loading"
        >
          下发部署
        </el-button>

        <!-- 信令展示按钮 -->
        <el-button
          type="primary"
          icon="el-icon-view"
          @click="handleShowSignaling"
          class="show-btn"
        >
          信令展示
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { signaling } from '../../tools/request.js'
import { getAllAppinstanceIds } from '../../tools/mecApplication.js'

export default {
  name: 'SignalingMgr',
  data () {
    return {
      form: {
        appId: '',
        dnaiCode: '',
        trafficLevel: ''
      },
      loading: false,
      appInstanceIdList: []
    }
  },
  created () {
    this.loadAppInstanceIds()
  },
  methods: {
    async loadAppInstanceIds () {
      try {
        const res = await getAllAppinstanceIds()
        if (res.code === 200) {
          this.appInstanceIdList = res.data
        } else {
          this.$message.error('加载APPID列表失败：' + res.msg)
        }
      } catch (error) {
        let errMsg = '加载APPID列表失败，请检查后端服务'
        if (error.response && error.response.data && error.response.data.msg) {
          errMsg = error.response.data.msg
        }
        this.$message.error(errMsg)
        console.error('加载APPID失败：', error)
      }
    },
    async handleDeploy () {
      try {
        this.loading = true
        const params = {
          appId: this.form.appId,
          dnai: this.form.dnaiCode,
          level: this.form.trafficLevel
        }
        const res = await signaling.createPolicy(params)
        this.$message.success('✅ 信令下发成功！\n后端响应：' + res.data.msg)
        console.log('后端返回数据：', res.data)
      } catch (error) {
        let errMsg = '信令下发失败，请检查网络或后端服务'
        if (error.response && error.response.data && error.response.data.msg) {
          errMsg = error.response.data.msg
        }
        this.$message.error('❌ ' + errMsg)
        console.error('接口调用失败：', error)
      } finally {
        this.loading = false
      }
    },
    handleShowSignaling () {
      const levelMap = {
        'High_Bandwidth': '大吞吐量',
        'Low_Latency': '低时延高可靠',
        'level3': '三级流量（低优先级）',
        '': '未选择'
      }

      const signalingData = {
        '边缘节点APPID': this.form.appId || '未选择',
        '边缘节点DNAI编码': this.form.dnaiCode || '未输入',
        '边缘节点流量等级': levelMap[this.form.trafficLevel] || '未选择'
      }
      this.$message.info(`📋 当前信令参数：\n${JSON.stringify(signalingData, null, 2)}`)
      console.log('当前信令参数：', signalingData)
    }
  }
}
</script>

<style lang='less' scoped>
    /* 统一继承edgeNodes页面的样式结构 */
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
        box-sizing: border-box;
    }

    .select-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 200px;
        label

    {
        font-size: 15px;
        color: rgba(255, 255, 255, 0.9);
    }

    .signaling-select {
        width: 100%;
        /deep/ .el-select

    {
        .el-input__inner

    {
        height: 38px;
        background: transparent;
        border: 1px solid #5e40c8;
        border-radius: 8px;
        color: #fff;
        &::placeholder

    {
        color: rgba(255, 255, 255, 0.5);
    }

    }

    .el-input__suffix i {
        color: #fff;
    }

    }
    }

    .signaling-input {
        width: 100%;
        /deep/ .el-input

    {
        .el-input__inner

    {
        height: 38px;
        background: transparent;
        border: 1px solid #5e40c8;
        border-radius: 8px;
        color: #fff;
        &::placeholder

    {
        color: rgba(255, 255, 255, 0.5);
    }

    }

    .el-input__suffix i {
        color: #fff;
    }

    }
    }
    }

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
</style>
