import React, { useState, useEffect } from 'react';
import { Tree, Button, message, Table, PageHeader } from 'antd';
import { connect } from 'dva';
import { router } from 'umi';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import { ConnectState, ConnectProps } from '@/models/connect';
import { getRoleInfo, getRolePermissions, editRolePermissions } from '@/services/roles';
import { TreeNodeNormal } from 'antd/lib/tree/Tree';
import { useParams } from 'react-router-dom';
import styles from './index.less';

const RoleDetail: React.FC<FormComponentProps & ConnectProps & ConnectState> = ({ form, dispatch, roles }) => {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [roleInfo, setRoleInfo] = useState({});
  const [rolePermissions, setRolePermissions] = useState([]);
  const { permissions } = roles;
  const { id } = useParams();
  const roleId = Number(id);
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
  });

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    dispatch({
      type: 'roles/fetchAllPermissions'
    });
    const requestArr = [getRoleInfo(roleId), getRolePermissions(roleId)];
    const res = await Promise.all(requestArr);
    res.forEach((i, idx) => {
      if (i.success) {
        if (idx === 0) {
          setRoleInfo(i.detail);
        } else {
          setRolePermissions(i.permissions.map((i: any) => i.key));
        }
      }
    })
  }

  const submit = async () => {
    setButtonLoading(true);
    const { success } = await editRolePermissions(roleId, { permissionKeys: rolePermissions });
    if (success) {
      message.success('Edit Successfully！');
      router.push('/admin/role/list');
    }
    setButtonLoading(false);
  }

  const columns = [ 
    {
      title: 'Role Name',
      dataIndex: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'note',
    },
    {
      title: 'Type',
      render(item: any) {
        return (
          <div>{item.isPreset ? 'Preset Role' : 'Custom Role'}</div>
        )
      } 
    },
  ]

  return (
    <div className={styles.roleDetailWrap}>
      <PageHeader
        onBack={() => router.push('/admin/role/list')}
        title="Role Detail"
        subTitle=""
      />
      <Table
        columns={columns}
        title={() => (<h1>Role Info</h1>)}
        dataSource={[roleInfo]}
        pagination={false}
      />
      <h1 style={{ marginTop: 20 }}>Choose permissions:</h1>
      <Tree
        checkable
        onCheck={(keys: any) => setRolePermissions(keys)}
        checkedKeys={rolePermissions}
        treeData={treeData}
        defaultExpandAll
      />
      <Button style={{marginTop: '20px'}} type="primary" loading={buttonLoading} onClick={submit}>Submit</Button>
    </div>
  )
}

export default connect(({user, roles}: ConnectState) => ({user, roles}))(RoleDetail);