import React, { useEffect } from 'react';
import { Card, Col, Row } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect';


const Index: React.FC<ConnectState & ConnectProps> = ({ users, groups, roles, dispatch }) => {
  const userTotal = users.total;
  const groupTotal = groups.total;
  const roleTotal = roles.total;
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
    if (!roleTotal) {
      dispatch({
        type: 'roles/getRolesTotalCount'
      });
    }
    
  }, [])
  return (
    <>
      <Row gutter={[32, 16]}>
        <Col lg={8} md={10} sm={12}>
          <Card size="small"
            title="Users" 
            extra={<Link to="/admin/user/add">Create User</Link>} style={{ width: 270 }}
          >
            <h2>{userTotal || 0}</h2>
          </Card>
        </Col>
        <Col lg={8} md={10} sm={12}>
          <Card size="small"
            title="Groups" 
            extra={<Link to="/admin/group/add">Create Group</Link>} style={{ width: 270 }}
          >
            <h2>{groupTotal || 0}</h2>
          </Card>
        </Col>
        <Col lg={8} md={10} sm={12}>
          <Card size="small"
            title="Custom Role" 
            extra={<Link to="/admin/role/add">Create Custom Role</Link>} style={{ width: 270 }}
          >
            <h2>{roleTotal || 0}</h2>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default connect(({ users, groups, roles }: ConnectState) => ({ users, groups, roles }))(Index);