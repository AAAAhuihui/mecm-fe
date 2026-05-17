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
  <div class="ruleconfig">
    <div class="topLabel">
      {{ $t('nav.ruleConfiguration') }}
      <div class="block" />
    </div>
    <div class="btnMain">
      <el-button
        type="primary"
        id="deleteInsBtn"
        @click="addNew"
      >
        <span class="iconcont add" />
        <span>{{ $t('app.instanceList.newRules') }}</span>
      </el-button>
    </div>
    <div class="contentList">
      <el-tabs
        v-model="activeName"
        type="card"
      >
        <el-tab-pane
          :label="$t('app.ruleConfig.dnsRule')"
          name="dns"
        >
          <DnsPannel :showtype="type" />
        </el-tab-pane>
        <!-- 隐藏分流规则 Tab：仅展示 DNS 规则（2026-05-16） -->
        <!--
        <el-tab-pane
          :label="$t('app.ruleConfig.trafficRule')"
          name="traffic"
        >
          <TrafficPannel :showtype="type" />
        </el-tab-pane>
        -->
      </el-tabs>
    </div>
  </div>
</template>

<script>
import DnsPannel from './Dns.vue'
// import TrafficPannel from './Traffic.vue' // 隐藏分流规则：不再挂载（2026-05-16）
export default {
  components: {
    DnsPannel
    // TrafficPannel // 隐藏分流规则（2026-05-16）
  },
  data () {
    return {
      activeName: 'dns',
      type: 0
    }
  },
  methods: {
    addNew () {
      if (this.activeName === 'dns') {
        this.type = 1
      }
      // 分流规则 Tab 已隐藏，不再处理 traffic（2026-05-16）
      // else if (this.activeName === 'traffic') {
      //   this.type = 2
      // }
    }
  }
}
</script>
