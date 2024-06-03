
import moment from 'moment'
/**
 * 通用js方法封装处理
 * Copyright (c) 2019 rongzi
 */

// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/').replace('T', ' ').replace(new RegExp(/\.[\d]{3}/gm), '');
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 添加日期范围
export function addDateRange(params, dateRange, propName) {
  let search = params;
  search.params = typeof (search.params) === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};
  dateRange = Array.isArray(dateRange) ? dateRange : [];
  if (typeof (propName) === 'undefined') {
    search.params['beginTime'] = dateRange[0];
    search.params['endTime'] = dateRange[1];
  } else {
    search.params['begin' + propName] = dateRange[0];
    search.params['end' + propName] = dateRange[1];
  }
  return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  if (value === undefined) {
    return "";
  }
  var actions = [];
  Object.keys(datas).some((key) => {
    if (datas[key].value == ('' + value)) {
      actions.push(datas[key].label);
      return true;
    }
  })
  if (actions.length === 0) {
    actions.push(value);
  }
  return actions.join('');
}

// 回显数据字典（字符串、数组）
export function selectDictLabels(datas, value, separator) {
  if (value === undefined || value.length === 0) {
    return "";
  }
  if (Array.isArray(value)) {
    value = value.join(",");
  }
  var actions = [];
  var currentSeparator = undefined === separator ? "," : separator;
  var temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some((val) => {
    var match = false;
    Object.keys(datas).some((key) => {
      if (datas[key].value == ('' + temp[val])) {
        actions.push(datas[key].label + currentSeparator);
        match = true;
      }
    })
    if (!match) {
      actions.push(temp[val] + currentSeparator);
    }
  })
  return actions.join('').substring(0, actions.join('').length - 1);
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments, flag = true, i = 1;
  str = str.replace(/%s/g, function () {
    var arg = args[i++];
    if (typeof arg === 'undefined') {
      flag = false;
      return '';
    }
    return arg;
  });
  return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}

// 数据合并
export function mergeRecursive(source, target) {
  for (var p in target) {
    try {
      if (target[p].constructor == Object) {
        source[p] = mergeRecursive(source[p], target[p]);
      } else {
        source[p] = target[p];
      }
    } catch (e) {
      source[p] = target[p];
    }
  }
  return source;
};

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
  let config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  };

  var childrenListMap = {};
  var nodeIds = {};
  var tree = [];

  for (let d of data) {
    let parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (let d of data) {
    let parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (let t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (let c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
}

/**
* 参数处理
* @param {*} params  参数
*/
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result
}

// 验证是否为blob格式
export function blobValidate(data) {
  return data.type !== 'application/json'
}

// 格式化金额
export function formatNumberAsRMB(number) {
  // return new Intl.NumberFormat('zh-CN', {
  //     style: 'currency',
  //     currency: 'CNY',
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2
  // }).format(number);

  number = Number(number) / 10000
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}


/* 计算周期 */
export function creditCycleFN(startDate, deadline) {
  if (startDate && deadline) {
    const start = moment(startDate);
    const end = moment(deadline);

    // 计算月份差异
    // const months = end.diff(start, 'months');
    // start.add(months, 'months'); // 将起始日期增加计算出的月数

    // // 计算天数差异，如果相等则算作一天
    // let days = end.diff(start, 'days');
    // if (days === 0) {
    //   days = 1;
    // }

    // // 根据月份和天数创建相应的显示字符串
    // let creditCycle = '';
    // if (months > 0) {
    //   creditCycle += `${months}个月`;
    // }
    // if (days > 0) {
    //   creditCycle += `${creditCycle ? ' ' : ''}${days}天`;
    // }
    // return days + '天';
    let creditCycle = moment(deadline).diff(moment(startDate), 'month', true)
    return (creditCycle).toFixed(2);
  }

  // if (startDate && daysToAdd) {
  //   var startMoment = moment(startDate);
  //   var endMoment = moment(startMoment).add(daysToAdd, 'days');

  //   var months = endMoment.diff(startMoment, 'months');
  //   startMoment.add(months, 'months');
  //   var remainingDays = endMoment.diff(startMoment, 'days');

  //   let creditCycle = '';

  //   if (months > 0) {
  //     creditCycle += `${months}个月`;
  //   }
  //   if (remainingDays > 0) {
  //     if (creditCycle) {
  //       creditCycle += ' ';
  //     }
  //     creditCycle += `${remainingDays}天`;
  //   }

  //   return creditCycle;
  // }
}
/* 期限加上一个单位默认是 '月' */
export function addPeriods(deadline, period, unit) {
  if (deadline && period) {
    const end = moment(deadline);
    end.add(period, unit);
    return end.format('YYYY-MM-DD');
  }
}
export function appendUnit(value, unit = '月') {
  return `${value}${unit}`;
}

export function amountLimitMethod(e) {
  // 匹配非负浮点数，至多两位小数
  // 检查是否存在小数点及其位置
  const dotIndex = e.target.value.indexOf('.');
  if (dotIndex !== -1) {
    // 如果存在小数点，确保只保留小数点后两位
    e.target.value = e.target.value.slice(0, dotIndex + 2);
  }
  // e.target.value = (e.target.value.match(/^\d*(\.?\d{1,2})/g)[0]) || ''
}

// 合计
export function getSummaries(param, specifiedLabels) {
  const { columns, data } = param;
  const sums = [];

  // 定义需要计算合计的列标签
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计';
      return;
    }

    // 检查当前列是否在指定的标签数组中
    if (specifiedLabels.includes(column.label)) {
      const values = data.map(item => Number(item[column.property]));
      if (!values.every(value => isNaN(value))) {
        const sum = values.reduce((prev, curr) => {
          const value = Number(curr);
          if (!isNaN(value)) {
            return prev + curr;
          } else {
            return prev;
          }
        }, 0);
        sums[index] = formatNumberAsRMB(sum);
      } else {
        sums[index] = (0).toFixed(2); // 如果所有值都是 NaN，合计为 0
      }
    } else {
      sums[index] = '/'; // 其他列展示为 /
    }
  });

  return sums;
}

// 合计2 
export function getSummaries2(param, specifiedLabels, zongjia) {
  const {
    columns,
    data
  } = param;
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计';
      return;
    } else if (specifiedLabels[column.label] !== undefined) {
      const value = zongjia[specifiedLabels[column.label]];
      if (value !== 0 || value !== null || value !== undefined) {
        sums[index] = formatNumberAsRMB(value);
      } else {
        sums[index] = (0).toFixed(2);
      }
    } else {
      sums[index] = '/';
    }
  });

  return sums;
}