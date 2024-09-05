<template>
  <div class="app-container" v-loading="loading2">
    <search-panel HeaderIcon="repaymentplan" title="按月汇总(单位:万元)">
      <el-form ref="queryForm" size="small" label-width="80px" label-position="left">
        <!-- Row 1 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="月份筛选">
              <el-date-picker v-model="daterangeRiqi" style="width: 240px" value-format="yyyy-MM" type="monthrange"
                range-separator="-" start-placeholder="点击或者输入" end-placeholder="例子:2024-08"></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="16">
            <!-- Buttons can be placed anywhere, here is an example -->
            <el-form-item class="flex" style="display: flex; justify-content: flex-end;">
              <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜 索</el-button>
              <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>


      </el-form>

    </search-panel>
    <el-divider class="mt20 mb20"></el-divider>
    <el-row type="flex" :gutter="10" class="mb8" justify="end">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['huankuanjihua:mingxi:export']">导 出</el-button>
      </el-col>
    </el-row>

    <el-table ref="tableRef" v-loading="loading" :data="mingxiList" :header-cell-style="header_cell_style"
      :row-class-name="tableRowClassName">
      <el-table-column label="月份" align="center" prop="month" min-width="100" />
      <el-table-column show-overflow-tooltip label="偿还本金" align="right" prop="totalPrincipalWY" />
      <el-table-column show-overflow-tooltip label="支付利息（含手续费）" align="right" prop="totalInterestWY" />
      <el-table-column show-overflow-tooltip label="总计" align="right" prop="totalWY" />
    </el-table>


  </div>
</template>

<script>
  import {
    getRepaymentPlanData,
  } from "@/api/huankuanjihua/mingxi";

  import SearchPanel from '@/components/SearchPanel/index.vue'
  const moment = require('moment');
  import * as XLSX from 'xlsx';
  export default {
    name: "Anyuehuizong",
    components: {
      SearchPanel
    },
    data() {
      return {
        header_cell_style: {
          backgroundColor: '#f2f4f5',
          color: '#000000',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        // 遮罩层
        loading: true,
        loading2: false,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 还款计划明细表格数据
        mingxiList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        daterangeRiqi: [],

      };
    },
    watch: {

    },
    created() {
      const currentMonth = moment().format('YYYY-MM');
      // 获取一年后的月份
      const nextYearMonth = moment().add(1, 'year').format('YYYY-MM');
      console.log(currentMonth, nextYearMonth);
      this.daterangeRiqi = [currentMonth, nextYearMonth]
      this.getList();
    },
    methods: {
      formatNumber(number) {
        return Number(number) || 0
      },
      /** 查询还款计划明细列表 */
      getList() {
        this.loading = true;
        let params = {}

        if (null != this.daterangeRiqi && '' != this.daterangeRiqi) {
          params["startDate"] = this.daterangeRiqi[0];
          params["endDate"] = this.daterangeRiqi[1];
        }
        getRepaymentPlanData(params).then(response => {

          // response.data.total_huankuanjine
          // response.data.total_changhuanben
          // response.data.total_zhifulixi
          if ("data" in response) {
            //防止没有数据的时候报错
            // 修改month格式，并计算total
            const formattedData = response.data.map(entry => {
              const [year, month] = entry.month.split('-');
              const formattedMonth = `${year}年${month}月`;
              const total = this.formatNumber(entry.totalInterest) + this.formatNumber(entry.totalPrincipal) +
                this.formatNumber(entry.totalShouxufei);
              let toa = {
                totalInterest: this.formatNumber(entry.totalInterest) + this.formatNumber(entry
                  .totalShouxufei),
                totalPrincipal: entry.totalPrincipal,
                total: total,
                month: formattedMonth
              };
              toa['totalInterestWY'] = this.formatNumberAsRMB(toa.totalInterest)
              toa['totalPrincipalWY'] = this.formatNumberAsRMB(toa.totalPrincipal)
              toa['totalWY'] = this.formatNumberAsRMB(toa.total)
              return toa
            });
            console.log(formattedData);
            // 按年汇总
            const yearSummary = {};
            formattedData.forEach(entry => {
              const year = entry.month.split('年')[0];
              if (!yearSummary[year]) {
                yearSummary[year] = {
                  month: `${year}年汇总`,
                  totalInterest: 0,
                  totalPrincipal: 0,
                  total: 0
                };
              }
              yearSummary[year].totalInterest += entry.totalInterest;
              yearSummary[year].totalPrincipal += entry.totalPrincipal;
              yearSummary[year].total += entry.total;
            });

            // 计算所有年汇总的总和
            const grandTotal = {
              month: "总汇总",
              totalInterest: 0,
              totalPrincipal: 0,
              total: 0,
              huizong: true
            };
            // 将汇总数据插入到数据中
            const finalData = [];
            Object.keys(yearSummary).forEach(year => {
              const yearData = formattedData.filter(entry => entry.month.startsWith(year));
              finalData.push(...yearData);
              let yeS = yearSummary[year]
              yeS['totalInterestWY'] = this.formatNumberAsRMB(yeS.totalInterest)
              yeS['totalPrincipalWY'] = this.formatNumberAsRMB(yeS.totalPrincipal)
              yeS['totalWY'] = this.formatNumberAsRMB(yeS.total)
              yeS['huizong'] = true
              finalData.push(yeS);
              grandTotal.totalInterest += yeS.totalInterest;
              grandTotal.totalPrincipal += yeS.totalPrincipal;
              grandTotal.total += yeS.total;
            });

            grandTotal['totalInterestWY'] = this.formatNumberAsRMB(grandTotal.totalInterest)
            grandTotal['totalPrincipalWY'] = this.formatNumberAsRMB(grandTotal.totalPrincipal)
            grandTotal['totalWY'] = this.formatNumberAsRMB(grandTotal.total)
            finalData.push(grandTotal);

            this.mingxiList = finalData
          } else {
            this.mingxiList = []
          }

          this.loading = false;
        });
      },

      tableRowClassName({
        row,
        rowIndex
      }) {
        if (row.huizong == true) {
          return 'success-row';
        }
        return '';
      },
      handleQuery() {
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.daterangeRiqi = [];
        this.handleQuery();
      },
      handleExport() {
        // 示例数据
        const tableData = this.mingxiList; // 假设这是您从后端获取的按月汇总数据

        // 准备数据：获取列名
        const columns = this.$refs.tableRef.columns.filter(col => col.property).map(col => col.label);

        // 准备数据：将表头和数据组合
        const data = tableData.map(row =>
          this.$refs.tableRef.columns.filter(col => col.property).map(col => row[col.property])
        );

        // 将列名添加到数据的最前面
        data.unshift(columns);

        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(data);

        // 创建工作簿并添加工作表
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '按月汇总');

        // 生成 Excel 并导出
        XLSX.writeFile(workbook, '按月汇总.xlsx');
      },
      handleExport2() {

        // 导出过滤后去除手续费的数据
        const tableData = this.mingxiList

        // 构建 Excel 文件内容
        let excelContent = `<html><head><meta charset="UTF-8"></head><body><table border="1">`;

        // 添加表头
        excelContent += '<tr>';
        for (const column of this.$refs.tableRef.columns) {
          if (column.property) {
            excelContent += `<th>${column.label}</th>`;
          }
        }
        excelContent += '</tr>';

        // 添加表格数据
        for (const row of tableData) {
          excelContent += '<tr>';
          for (const column of this.$refs.tableRef.columns) {
            if (column.property) {
              excelContent += `<td>${row[column.property]}</td>`;
            }
          }
          excelContent += '</tr>';
        }

        // 构建完整的 Excel 文件内容
        excelContent += '</table></body></html>';
        // console.log(excelContent);
        // 创建 Blob 对象
        const blob = new Blob([excelContent], {
          type: 'application/vnd.ms-excel'
          // type: 'application/vnd.ms-excel'
        });

        // 创建链接并触发下载
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = '按月汇总.xlsx'; // 设置默认文件名
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(link.href);
      },
    }
  };
</script>
<style>
  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>
