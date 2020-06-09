import React, { useState, useEffect, useMemo } from 'react';
import { Input, Checkbox, Tree, Button, message } from 'antd';
import { Form } from '@ant-design/compatible'
import { connect } from 'dva';
import router from 'umi/router';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import { FormComponentProps } from '@ant-design/compatible/es/form';
import { AntTreeNodeSelectedEvent } from 'antd/lib/tree';
import { ConnectState, ConnectProps } from '@/models/connect';

import { createRole } from '@/services/roles';
import { TreeNodeNormal, AntTreeNodeCheckedEvent } from 'antd/lib/tree/Tree';

const FormItem = Form.Item;
const { TreeNode } = Tree;

type TypeKeys = string[];


const Add: React.FC<FormComponentProps & ConnectProps & ConnectState> = ({ form, dispatch, roles }) => {
  const [expandedKeys, setExpandedKeys] = useState<TypeKeys>(['DLWORKSPACE']);
  const [checkedKeys, setCheckedKeys] = useState<TypeKeys>([]);
  const [selectedKeys, setSelectedKeys] = useState<TypeKeys>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { validateFields, getFieldDecorator } = form;
  const { permissions } = roles;
  const projectTypes = [...new Set(permissions.map(val => val.project))];

  let treeData: TreeNodeNormal[] = projectTypes.map(val => {
    return {
      title: val,
      key: val,
      children: []
    }
  });
  treeData.forEach(t => {
    permissions.forEach(p => {
      if (t.title === p.project) {
        t.children?.push({
          key: p.key,
          title: p.name,
        })
      }
    })
  })
  const layout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 8 },
  };
  useEffect(() => {
    dispatch({
      type: 'roles/fetchAllPermissions'
    });
  }, []);
  useEffect(() => {
    // console.log('projectTypes', projectTypes)
    // onExpand(projectTypes);
  }, [projectTypes])
  const onExpand = (expandedKeys:TypeKeys) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeys: string[] | { checked: string[]; halfChecked: string[]; }, e: AntTreeNodeCheckedEvent) => {
    setCheckedKeys(checkedKeys as string[] );
  };

  const onSelect = (selectedKeys: TypeKeys, info: AntTreeNodeSelectedEvent) => {
    setSelectedKeys(selectedKeys);
  };
  const next = () => {
    validateFields(async (err, values) => {
      if (err) return;
      setButtonLoading(true);
      const result = await createRole({
        name: values.name,
        note: values.note,
        permissions: checkedKeys
      });
      setButtonLoading(false)
      if (result.success) {
        message.success('Success Create Role ' + values.name);
        router.push('/admin/role/list');
      } else if (result.success === false) {
        message.error(`RoleName ${name} have existed, please try another`);
      }
    });
  }
  return (
    <PageHeaderWrapper>
      <FormItem label="RoleName" {...layout} style={{width: '80%'}}>
        {
          getFieldDecorator('name', {
            rules: [
              { required: true },
              { max: 15 },
              { whitespace: true, message: 'role name cannot be empty' }
            ]
          })(<Input />)
        }
      </FormItem>
      <FormItem label="Decription" {...layout} style={{width: '80%'}}>
        {
          getFieldDecorator('note', {
            rules: [
              { required: true },
              { max: 15 }
            ]
          })(<Input.TextArea />)
        }
      </FormItem>
      <h1>Choose permissions:</h1>
      <Tree
        checkable
        onExpand={onExpand}
        expandedKeys={projectTypes}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        onSelect={onSelect}
        selectedKeys={selectedKeys}
        treeData={treeData}
        defaultExpandAll
      />
      <Button style={{marginTop: '20px'}} loading={buttonLoading} onClick={next}>Submit</Button>
    </PageHeaderWrapper>
  )
}


export default connect(({user, roles}: ConnectState) => ({user, roles}))(Form.create<FormComponentProps>()(Add));