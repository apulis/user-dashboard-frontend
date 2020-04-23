import React, { useState, useEffect } from 'react'
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { Checkbox, Input, Row, Col } from 'antd';

import { FormComponentProps } from '@ant-design/compatible/lib/form';

import { ConnectProps, ConnectState } from '@/models/connect';

import styles from './index.less';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { IRoleListItem } from '@/models/roles';

interface ISearchRoleProps {
  onChange?: (selectedRoleIds: number[]) => void;
}

const { Search } = Input;

const SelectGroup: React.FC<ISearchRoleProps & FormComponentProps & ConnectProps & ConnectState> = ({ roles, onChange, dispatch }) => {
  const fetchRoles = (pageSize?: number) => {
    dispatch({
      type: 'roles/fetchRoles',
      payload: {
        pageNo: 1,
        pageSize: pageSize || 20,
      }
    })
  }
  useEffect(() => {
    fetchRoles();
  }, [])

  const { total: roleTotal } = roles;
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

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const s = e.target.value;
    fetchRoles(s);
  }
  return (
    <div>
      <Row>
        <Col span={11}>
          <div className={styles.container}>
            <div className="ant-modal-title">
              Choose Roles ( total: {roleList.length} )
            </div>
            <Search placeholder="input search text" onChange={onSearch} style={{marginTop: '10px'}} />
            <Checkbox.Group onChange={onCheckboxSelect} style={{marginTop: '10px'}}>
              {
                roleList.map((r) => (
                  <Col span={24}>
                    <Checkbox style={{marginTop: '5px'}} key={r.id} value={r.id}>{r.name}</Checkbox>
                  </Col>
                ))
              }
              {
                roleList.length === 0 && <div>No availble users</div>
              }
            </Checkbox.Group>
          </div>
        </Col>
        <Col span={11} offset={2}>
          <div className={styles.container}>
            <div className="ant-modal-title">
              Selected: {}
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
