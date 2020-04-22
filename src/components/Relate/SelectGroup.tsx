import React, { useState, Suspense } from 'react'
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { Modal, Checkbox, Button, Input, Row, Col } from 'antd';

import { FormComponentProps } from '@ant-design/compatible/lib/form';

import { IGroup } from '@/pages/admin/Groups/List/index';

import { ConnectProps, ConnectState } from '@/models/connect';

import styles from './index.less';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

interface ISearchGroupProps {
  groupList: IGroup[];
  onChange?: (selectedGroupName: string[]) => void;
}

const { Search } = Input;

const SelectGroup: React.FC<ISearchGroupProps & FormComponentProps & ConnectProps> = ({ groupList, onChange }) => {
  
  const [selectedGroup, setSelectedGroup] = useState<string[]>([]);

  const [currentGroupList, setCurrentGroupList] = useState<IGroup[]>(groupList); 

  const onCheckboxSelect = (checkedValue: CheckboxValueType[]) => {
    setSelectedGroup(checkedValue as string[]);
    onChange && onChange(checkedValue as string[]);
  }

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const s = e.target.value;
    if (!s) {
      setCurrentGroupList(groupList);
      return 
    }
    const currentGroupList = groupList.filter(g => {
      if (g.name.includes(s) || g.note.includes(s)) {
        return g;
      }
    })
    setCurrentGroupList(currentGroupList);
  }
  return (
    <div>
      <Row>
        <Col span={11}>
          <div className={styles.container}>
            <div className="ant-modal-title">
              Choose Groups ( total: {currentGroupList.length} )
            </div>
            <Search placeholder="input search text" onChange={onSearch} style={{marginTop: '10px'}} />
            <Checkbox.Group onChange={onCheckboxSelect} style={{marginTop: '10px'}}>
              {
                currentGroupList.map((g) => (
                  <Col span={24}>
                    <Checkbox style={{marginTop: '5px'}} key={g.name} value={g.name}>{g.name}</Checkbox>
                  </Col>
                ))
              }
              {
                currentGroupList.length === 0 && <div>No eligible groups</div>
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
              selectedGroup.map((g) => (
              <div>{g}</div>
              ))
            }
          </div>
        </Col>
      </Row>
    </div>
  )
}


export default connect(({ groups }: ConnectState) => ({ groups }))(Form.create<FormComponentProps & ConnectProps & ISearchGroupProps>()(SelectGroup));
