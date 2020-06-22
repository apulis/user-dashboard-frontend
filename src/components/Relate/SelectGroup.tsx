import React, { useState, useEffect } from 'react'
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import { Checkbox, Input, Row, Col } from 'antd';
import { debounce } from 'lodash';

import { FormComponentProps } from '@ant-design/compatible/lib/form';

import { IGroup } from '@/pages/admin/Groups/List/index';

import { ConnectProps, ConnectState } from '@/models/connect';

import styles from './index.less';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

interface ISearchGroupProps {
  groupList: IGroup[];
  onChange?: (selectedGroupId: number[]) => void;
  defaultSelected?: number[];
}

const { Search } = Input;

const SelectGroup: React.FC<ISearchGroupProps & FormComponentProps & ConnectProps> = ({ groupList, onChange, defaultSelected=[] }) => {
  const [selectedGroup, setSelectedGroup] = useState<IGroup[]>([]);

  const [currentGroupList, setCurrentGroupList] = useState<IGroup[]>(groupList); 

  const onCheckboxSelect = (checkedValue: CheckboxValueType[]) => {
    const selectGroup: IGroup[] = [];
    checkedValue.forEach(c => {
      groupList.forEach(g => {
        if (g.id === c) {
          selectGroup.push(g);
        }
      })
    })
    setSelectedGroup(selectGroup);
    onChange && onChange(checkedValue as number[]);
  }

  useEffect(() => {
    const selected: IGroup[] = [];
    defaultSelected.forEach(d => {
      currentGroupList.forEach(c => {
        if (c.id === d) {
          selected.push(c);
        }
      })
    })
    setSelectedGroup(selected)
  }, [defaultSelected])

  const onSearch = debounce((value: string) => {
    const s = value;
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
  }, 800);
  return (
    <div>
      <Row>
        <Col span={11}>
          <div className={styles.container}>
            <div className="ant-modal-title">
              Select Groups ( total: {currentGroupList.length} )
            </div>
            <Search placeholder="search groups" onChange={(e) => onSearch(e.target.value)} style={{marginTop: '10px'}} />
            <Checkbox.Group className={styles.checkbox} defaultValue={defaultSelected} onChange={onCheckboxSelect} style={{marginTop: '10px'}}>
              {
                currentGroupList.map((g) => (
                  <Col span={24}>
                    <Checkbox disabled={defaultSelected.includes(g.id)} style={{marginTop: '5px'}} key={g.id} value={g.id}>{g.name}</Checkbox>
                  </Col>
                ))
              }
              {
                currentGroupList.length === 0 && <div>No availble groups</div>
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
              <div>{g.name}</div>
              ))
            }
          </div>
        </Col>
      </Row>
    </div>
  )
}


export default connect(({ groups }: ConnectState) => ({ groups }))(Form.create<FormComponentProps & ConnectProps & ISearchGroupProps>()(SelectGroup));
