import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Descriptions } from 'antd';
import { ConnectState, ConnectProps } from '@/models/connect';

const Info: React.FC<ConnectProps & ConnectState> = ({ user, dispatch, config }) => {
  const currentUser = user.currentUser!;
  const authMethods = config.authMethods;
  const { id } = currentUser;
  useEffect(() => {
    if (authMethods.length === 0) {
      dispatch({
        type: 'config/fetchAuthMethods',
      })
    }
  }, [])
  const bindMicrosoft = () => {
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        loginType: 'microsoft',
        userId: id,
      }
    })
  }
  const bindWechat = () => {
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        loginType: 'wechat',
        userId: id,
      }
    })
  }
  return (
    <>
      <Descriptions title="Account Info" layout="vertical" bordered>
      <Descriptions.Item label="User Id">{currentUser.id}</Descriptions.Item>
        <Descriptions.Item label="Username">{currentUser.userName}</Descriptions.Item>
        <Descriptions.Item label="Nickname">{currentUser.nickName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Current Role">{currentUser.currentRole.join(',')}</Descriptions.Item>
        <Descriptions.Item label="Phone">{currentUser.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email">{currentUser.email || '-'}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="Login Methods" layout="vertical" bordered style={{marginTop: '35px'}}>
        {
          authMethods.includes('wechat') && <Descriptions.Item label="Wechat">
          {
            currentUser.wechatId ? <div>Bound</div> : <><span>Not Bound</span><a onClick={bindWechat} style={{marginLeft: '15px'}}>To Bind</a></>
          }
        </Descriptions.Item>
        }
        {
          authMethods.includes('microsoft') && <Descriptions.Item label="Microsoft account">
          {
            currentUser.microsoftId ? <div>Bound</div> : <><span>Not Bound</span><a onClick={bindMicrosoft} style={{marginLeft: '15px'}}>To Bind</a></>
          }
        </Descriptions.Item>
        }
      </Descriptions>
    </>
  )
}

export default connect(({ user, config }: ConnectState) => ({
  user, config
}))(Info);