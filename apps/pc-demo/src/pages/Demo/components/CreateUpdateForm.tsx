import { t } from "@/utils/i18n";
import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import React from 'react';
const CreateUpdateForm: React.FC = () => {
  return <>
      <ProFormText name="id" label={t("pages.Demo.components.CreateUpdateForm.chongWuID", "宠物ID")} placeholder={t("pages.Demo.components.CreateUpdateForm.qingShuRuChongWuID", "请输入宠物ID")} rules={[{
      required: true,
      message: t("pages.Demo.components.CreateUpdateForm.qingShuRuChongWuID！", "请输入宠物ID！")
    }]} />

      <ProFormText name="name" label={t("pages.Demo.components.CreateUpdateForm.chongWuMingCheng", "宠物名称")} placeholder={t("pages.Demo.components.CreateUpdateForm.qingShuRuChongWuMingCheng", "请输入宠物名称")} rules={[{
      required: true,
      message: t("pages.Demo.components.CreateUpdateForm.qingShuRuChongWuMingCheng！", "请输入宠物名称！")
    }]} />

      <ProFormSelect name="status" label={t("pages.Demo.components.CreateUpdateForm.zhuangTai", "状态")} placeholder={t("pages.Demo.components.CreateUpdateForm.qingXuanZeZhuangTai", "请选择状态")} valueEnum={{
      available: 'Available',
      pending: 'Pending',
      sold: 'Sold'
    }} rules={[{
      required: true,
      message: t("pages.Demo.components.CreateUpdateForm.qingXuanZeZhuangTai！", "请选择状态！")
    }]} />
    </>;
};
export default CreateUpdateForm;