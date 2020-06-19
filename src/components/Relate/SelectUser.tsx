import React, { useState, useEffect } from 'react'
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { Checkbox, Input, Row, Col, Spin } from 'antd';
import { debounce } from 'lodash';

import 'react-virtualized/styles.css';
import List from 'react-virtualized/dist/es/List';
import { FormComponentProps } from '@ant-design/compatible/lib/form';

import { ConnectProps, ConnectState } from '@/models/connect';

import styles from './index.less';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { IUsers } from '@/models/users';

interface ISearchUserProps {
  onChange?: (selectedUserId: number[]) => void;
  defaultSelected: number[];
}

const { Search } = Input;

const SelectUser: React.FC<ISearchUserProps & FormComponentProps & ConnectProps & ConnectState> = ({ users, onChange, dispatch, defaultSelected = [] }) => {
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
  const rowRenderer = ({ index, key, style }: {index: number, key: any, style: React.CSSProperties}) => {
    const u = userList[index];
    console.log('style', style)
    return (
      <Col span={24} key={index}>
        <Checkbox disabled={defaultSelected.includes(u.id)} style={style} key={u.id} value={u.id}>{u.userName}</Checkbox>
      </Col>
        
    )
  }
  return (
    <div>
      <Row type="flex">
        {/* <Col span={11}> */}
          <div className={styles.container} style={{width: '320px'}}>
            <div className="ant-modal-title">
              Choose Users ( total: {userList.length} )
            </div>
            <Search placeholder="search users" onChange={(e) => onSearch(e.target.value)} style={{marginTop: '10px', width: '260px'}} />
            {
              userList.length !== 0 && <Checkbox.Group defaultValue={defaultSelected} onChange={onCheckboxSelect} style={{marginTop: '10px', width: '100%'}}>
                <List
                  width={260}
                  height={260}
                  rowCount={userList.length}
                  rowHeight={30}

                  style={{ paddingLeft: '10px', paddingBottom: '10px', paddingTop: '10px', marginTop: '10px'}}
                  rowRenderer={rowRenderer}
                />
              </Checkbox.Group>
            }
            {
              userList.length === 0 &&  <Spin className="demo-loading" style={{marginLeft: '30px', marginTop: '30px'}} />
            }
          </div>
        {/* </Col> */}
        {/* <Col  offset={2}> */}
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
        {/* </Col> */}
      </Row>
    </div>
  )
}


export default connect(({ users }: ConnectState) => ({ users }))(Form.create<FormComponentProps & ConnectProps & ISearchUserProps>()(SelectUser));
