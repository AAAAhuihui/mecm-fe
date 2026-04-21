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
  <div class="app-deploy padding_default">
    <div class="topLabel">
      {{ $t('nav.appDeploy') }}
      <div class="block" />
    </div>
    <div class="deploy-layout">
      <aside class="deploy-sidebar">
        <el-menu
          :default-active="activeTab"
          class="deploy-menu"
          @select="handleSelect"
        >
          <el-menu-item index="/mecm/app/deploy/package">
            {{ $t('nav.packageMana') }}
          </el-menu-item>
          <el-menu-item index="/mecm/app/deploy/distribution">
            {{ $t('app.packageList.distriAndDeploy') }}
          </el-menu-item>
          <el-menu-item index="/mecm/app/deploy/instance">
            {{ $t('nav.appInstance') }}
          </el-menu-item>
        </el-menu>
      </aside>
      <section class="deploy-main">
        <router-view />
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppDeploy',
  data () {
    return {
      activeTab: '/mecm/app/deploy/package'
    }
  },
  mounted () {
    this.syncActiveTab(this.$route.path)
  },
  watch: {
    '$route.path': function (path) {
      this.syncActiveTab(path)
    }
  },
  methods: {
    syncActiveTab (path) {
      if (path.indexOf('/mecm/app/deploy/distribution') === 0) {
        this.activeTab = '/mecm/app/deploy/distribution'
        return
      }
      if (path.indexOf('/mecm/app/deploy/instance') === 0) {
        this.activeTab = '/mecm/app/deploy/instance'
        return
      }
      this.activeTab = '/mecm/app/deploy/package'
    },
    handleSelect (path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    }
  }
}
</script>

<style lang='less'>
.app-deploy {
  &.padding_default {
    padding: 0 2%;
  }

  .deploy-layout {
    display: flex;
    align-items: stretch;
    width: 100%;
    margin-bottom: 40px;
  }

  .deploy-sidebar {
    width: 220px;
    min-width: 220px;
    margin-right: 22px;

    .deploy-menu {
      border-right: none;
      border-radius: 18px;
      padding: 10px;
      background: #ffffff;
      box-shadow: 0 10px 28px 0 rgba(94, 64, 200, 0.08);
      position: sticky;
      top: 82px;

      .el-menu-item {
        height: 48px;
        line-height: 48px;
        border-radius: 10px;
        margin-bottom: 8px;
        background: transparent !important;
        color: #6f5d84 !important;
      }

      .el-menu-item.is-active {
        color: #5e40c8 !important;
        background: #f3f0ff !important;
      }
    }
  }

  .deploy-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .topLabel {
      display: none;
    }

    .btnMain {
      position: static;
      top: auto;
      right: auto;
      z-index: auto;
      height: auto;
      margin: 0 0 16px;
    }

    .contentList {
      margin: 0;
      width: 100%;
      padding: 30px;
      min-height: calc(100vh - 260px);
      border-radius: 25px;
      box-shadow: none;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;

      .tableDiv {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .tableDiv > .el-row {
        flex: 1;
        min-height: 0;
        display: flex;
      }

      .tableDiv > .el-row > .el-col.table {
        flex: 1;
        min-height: 0;
        display: flex;
      }

      .tableDiv > .el-row > .el-col.table > .el-table,
      .tableDiv > .el-table {
        flex: 1;
        min-height: 0;
      }

      .tableDiv .pageBar {
        margin-top: 12px;
      }
    }

    .btnSearch {
      right: 4%;
    }
  }
}

@media (max-width: 1100px) {
  .app-deploy {
    .deploy-layout {
      display: block;
    }

    .deploy-sidebar {
      width: 100%;
      min-width: 100%;
      margin: 0 0 16px;

      .deploy-menu {
        position: static;
      }
    }
  }
}
</style>
