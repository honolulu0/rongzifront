import {
  Numeric as TinyNumeric
} from '@opentiny/vue'


// 生成 还款计划的edit 组件
export function renderInput2change(field, change) {
  return (h, {
    row
  }) => h('tiny-numeric', {
    class: 'w',
    props: {
      modelValue: Number(row[field]),
      size: 'small',
      "show-left": false,
      controls: false,
      precision: 2,
    },
    on: {
      'change':change
    }
  })
}
