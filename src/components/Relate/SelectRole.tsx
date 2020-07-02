import React, { useState, useEffect } from 'react'
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { Checkbox, Input, Row, Col } from 'antd';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import { formatMessage } from 'umi-plugin-react/locale';


import { ConnectProps, ConnectState } from '@/models/connect';

import styles from './index.less';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { IRoleListItem } from '@/models/roles';


interface ISearchRoleProps {
  currentUserId?: number;
  currentUserRoles?: number[];
  onChange?: (selectedRoleIds: number[]) => void;
}


const SelectGroup: React.FC<ISearchRoleProps & FormComponentProps & ConnectProps & ConnectState> = ({ roles, onChange, dispatch, currentUserId, currentUserRoles }) => {
  const { total: roleTotal } = roles;
  const fetchRoles = (pageSize?: number, search?: string) => {
    dispatch({
      type: 'roles/fetchRoles',
      payload: {
        pageNo: 1,
        pageSize: pageSize || roleTotal || 20,
        search,
      }
    })
  };
  useEffect(() => {
    dispatch({
      type: 'roles/getRolesTotalCount'
    }).then(() => {
      fetchRoles(roles.total);
    });
  }, [])

  useEffect(() => {
    // 初始化选择的角色
    onCheckboxSelect(currentUserRoles || []);
  }, [])

  const roleList: IRoleListItem[] = roles.list;
  useEffect(() => {
    if (roleTotal > 20) {
      fetchRoles(roleTotal)
    }
  }, [roleTotal])
  const [selectedRoles, setSelectedRoles] = useState<IRoleListItem[]>([]);
  const onCheckboxSelect = (checkedValue: CheckboxValueType[]) => {
    const selectedRoles: IRoleListItem[] = []
    checkedValue.forEach(id => {
      roleList.forEach(r => {
        if (r.id === id) {
          selectedRoles.push(r);
        }
      })
    })
    setSelectedRoles(selectedRoles);
    onChange && onChange(checkedValue as number[]);
  }
  return (
    <div>
      <Row>
        <Col span={11}>
          <div className={styles.container}>
            <div className="ant-modal-title">
              {formatMessage({id: 'component.select.role.choose.roles'})} ( {formatMessage({id: 'component.select.role.total'})}: {roleList.length} )
            </div>
            <Checkbox.Group className={styles.checkbox} defaultValue={currentUserRoles} onChange={onCheckboxSelect} style={{marginTop: '10px'}}>
              {
                roleList.map((r) => (
                  <Col span={24} key={r.id}>
                    <Checkbox style={{marginTop: '5px'}} key={r.id} value={r.id}>{r.name}</Checkbox>
                  </Col>
                ))
              }
              {
                roleList.length === 0 && <div>
                  { formatMessage({id: 'component.select.role.no.roles'}) }
                </div>
              }
            </Checkbox.Group>
          </div>
        </Col>
        <Col span={11} offset={2}>
          <div className={styles.container}>
            <div className="ant-modal-title">
              {formatMessage({id: 'component.select.role.selected'})}
            </div>
            {
              selectedRoles.map(u => (
                <div>{u.name}</div>
              ))
            }
          </div>
        </Col>
      </Row>
    </div>
  )
}


export default connect(({ roles }: ConnectState) => ({ roles }))(Form.create<FormComponentProps & ConnectProps & ISearchRoleProps>()(SelectGroup));
