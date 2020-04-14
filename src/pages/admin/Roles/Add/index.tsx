import React, { useState } from 'react';
import { Input, Checkbox, Tree, Button } from 'antd';
import { Form } from '@ant-design/compatible'

import { FormComponentProps } from '@ant-design/compatible/es/form';
import { AntTreeNodeSelectedEvent } from 'antd/lib/tree';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';

const FormItem = Form.Item;
const { TreeNode } = Tree;

type TypeKeys = string[];

const treeData = [
  {
    title: '存储资源相关权限',
    key: 'CCZYQX',
    children: [
      {
        title: '使用存储资源',
        key: 'SYCCZY',
      },
      {
        title: '修改存储资源',
        key: 'XGCCZY',
      }
    ],
  },
  {
    title: '集群配置相关权限',
    key: 'JIPZXGQX',
    children: [
      { title: '0-1-0-0', key: '0-1-0-0' },
    ],
  },
  {
    title: '0-2',
    key: '0-2',
  },
];
const Add: React.FC<FormComponentProps> = ({ form }) => {
  const [expandedKeys, setExpandedKeys] = useState<TypeKeys>([]);
  const [checkedKeys, setCheckedKeys] = useState<TypeKeys>(['0-0-0']);
  const [selectedKeys, setSelectedKeys] = useState<TypeKeys>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const { validateFields, getFieldDecorator } = form;
  const layout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 8 },
  };
  const onExpand = (expandedKeys:TypeKeys) => {
    console.log('onExpand', expandedKeys);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeys: TypeKeys) => {
    console.log('onCheck', checkedKeys);
    setCheckedKeys(checkedKeys);
  };

  const onSelect = (selectedKeys: TypeKeys, info: AntTreeNodeSelectedEvent) => {
    console.log('onSelect', info);
    setSelectedKeys(selectedKeys);
  };
  const next = async () => {
    const values = await validateFields();
    console.log('values', values)
  }
  return (
    <>
      <FormItem label="RoleName" {...layout} style={{width: '50%'}}>
        {
          getFieldDecorator('roleName', {
            rules: [
              { required: true },
              { max: 15 }
            ]
          })(<Input />)
        }
      </FormItem>
      <h1>Choose permissions:</h1>
      <Tree
        checkable
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        onSelect={onSelect}
        selectedKeys={selectedKeys}
        treeData={treeData}
      />
      <Button onClick={next}>Next</Button>
    </>
  )
}


export default connect(({user}: ConnectState) => user)(Form.create<FormComponentProps>()(Add));