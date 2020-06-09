import React, { useState, useEffect } from 'react'
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { Checkbox, Input, Row, Col } from 'antd';
import { debounce } from 'lodash';

import { FormComponentProps } from '@ant-design/compatible/lib/form';

import { ConnectProps, ConnectState } from '@/models/connect';

import styles from './index.less';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { IUsers } from '@/models/users';

interface ISearchUserProps {
  onChange?: (selectedUserId: number[]) => void;
}

const { Search } = Input;

const SelectGroup: React.FC<ISearchUserProps & FormComponentProps & ConnectProps & ConnectState> = ({ users, onChange, dispatch }) => {
  const { list: userList } = users;
  const fetchUsers = (search?: string) => {
    dispatch({
      type: 'users/fetchUsers',
      payload: {
        search: search,
      }
    });
  }
  useEffect(() => {
    fetchUsers();
  }, [])
  const [selectedUsers, setSelectedUsers] = useState<IUsers[]>([]);

  const onCheckboxSelect = (checkedValue: CheckboxValueType[]) => {
    const selectedUsers: IUsers[] = []
    checkedValue.forEach(id => {
      userList.forEach(u => {
        if (u.id === id) {
          selectedUsers.push(u)
        }
      })
    })
    setSelectedUsers(selectedUsers);
    onChange && onChange(checkedValue as number[]);
  }

  const onSearch = debounce((value: string) => {
    const s = value;
    fetchUsers(s);
  }, 800);
  return (
    <div>
      <Row>
        <Col span={11}>
          <div className={styles.container}>
            <div className="ant-modal-title">
              Choose Users ( total: {userList.length} )
            </div>
            <Search placeholder="input search text" onChange={(e) => onSearch(e.target.value)} style={{marginTop: '10px'}} />
            <Checkbox.Group className={styles.checkbox} onChange={onCheckboxSelect} style={{marginTop: '10px'}}>
              {
                userList.map((u) => (
                  <Col span={24}>
                    <Checkbox style={{marginTop: '5px'}} key={u.id} value={u.id}>{u.userName}</Checkbox>
                  </Col>
                ))
              }
              {
                userList.length === 0 && <div>No availble users</div>
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
              selectedUsers.map(u => (
                <div>{u.userName}</div>
              ))
            }
          </div>
        </Col>
      </Row>
    </div>
  )
}


export default connect(({ users }: ConnectState) => ({ users }))(Form.create<FormComponentProps & ConnectProps & ISearchUserProps>()(SelectGroup));
