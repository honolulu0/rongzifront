import {
  listList
} from "@/api/rzauditlist/list";
import {
  Message
} from 'element-ui'
import store from '../store/index'

// 校验数据是否审批通过
export async function inspectionPendingReview(rzaudit_data) {
  const search = {}

  try {
    const passStatus = ['1759515025552179200', '1759514942710481000', '1759515068883533800'];
    search['orderByColumn'] = 'id';
    // search['managementId'] = this.form.managementId;
    search['createBy'] = store.getters.name;
    search['auditState'] = '1759514891045044200';
    search['uuid'] = rzaudit_data.uuid;
    const res = await listList(search)
    if (res.code === 200 && res.rows.length !== 0) {
      const data = res.rows[0];
      // 判断数据的状态 只有使用 审批不通过，审批通过，已撤回的状才可以提交
      if (!passStatus.includes(data.auditState)) {
        Message.warning('您有一个审核编号为：' + data.id + ' 正在审核中，请等待审核通过后在进行操作！')
        return new Promise((resolve, reject) => {
          // reject(false);
        });
      }
    }
  } catch (error) {

  }
}

export function formatDateTime(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要加1
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
