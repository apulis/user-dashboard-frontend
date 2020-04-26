import React, { useEffect } from 'react';
import { Card, Col, Row } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect';


const Index: React.FC<ConnectState & ConnectProps> = ({ users, groups, roles, dispatch }) => {
  const userTotal = users.total;
  const groupTotal = groups.total;
  useEffect(() => {
    if (!userTotal) {
      dispatch({
        type: 'users/getUsersTotalCount'
      });
    }
    if (!groupTotal) {
      dispatch({
        type: 'groups/getGroupTotalCount'
      });
    }
    
  }, [])
  return (
    <>
      <Row gutter={[32, 16]}>
        <Col span={8}>
          <Card size="small"
            title="USERS" 
            extra={<Link to="/admin/user/add">CREATE USERS</Link>} style={{ width: 300 }}
          >
            <h2>{userTotal || ''}</h2>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small"
            title="GROUPS" 
            extra={<Link to="/admin/group/add">CREATE GROUPS</Link>} style={{ width: 300 }}
          >
            <h2>{groupTotal || ''}</h2>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small"
            title="CUSTOME ROLE" 
            extra={<Link to="/admin/role/add">CREATE CUSTOME ROLES</Link>} style={{ width: 300 }}
          >
            <h2>{2}</h2>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default connect(({ users, groups, roles }: ConnectState) => ({ users, groups, roles }))(Index);