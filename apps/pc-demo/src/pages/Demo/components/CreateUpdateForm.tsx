import { t } from '@/utils/i18n'
import { ProFormSelect, ProFormText } from '@ant-design/pro-components'
import { useIntl } from '@umijs/max'
import React from 'react'

const CreateUpdateForm: React.FC = () => {
  useIntl()
  return (
    <>
      <ProFormText
        name="id"
        label={t('宠物ID')}
        placeholder={t('请输入宠物ID')}
        rules={[
          {
            required: true,
            message: t('请输入宠物ID！'),
          },
        ]}
      />

      <ProFormText
        name="name"
        label={t('宠物名称')}
        placeholder={t('请输入宠物名称')}
        rules={[
          {
            required: true,
            message: t('请输入宠物名称！'),
          },
        ]}
      />

      <ProFormSelect
        name="status"
        label={t('状态')}
        placeholder={t('请选择状态')}
        valueEnum={{
          available: 'Available',
          pending: 'Pending',
          sold: 'Sold',
        }}
        rules={[
          {
            required: true,
            message: t('请选择状态！'),
          },
        ]}
      />
    </>
  )
}

export default CreateUpdateForm
