import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Descriptions, message } from 'antd';
import { ConnectState, ConnectProps } from '@/models/connect';
import { unbindMicrosoft, unbindWechat } from '@/services/unbind'

const Info: React.FC<ConnectProps & ConnectState> = ({ user, dispatch, config }) => {
  const currentUser = user.currentUser!;
  const authMethods = config.authMethods;
  const { id } = currentUser;
  // TODO 解绑之后，unbind之后fetchCurrent，并不有马上更新currentUser，而是必须得两次unbind之后currentUser的对应id才会置空。
  useEffect(() => {
    if (authMethods.length === 0) {
      dispatch({
        type: 'config/fetchAuthMethods',
      })
    }
  }, [])
  useEffect(() => {
    if (localStorage.bindType) {
      if (currentUser.wechatId) {
        message.success(`Success bind wechat account!`);
      } else if (currentUser.microsoftId) {
        message.success(`Success bind microsoft account!`);
      }
      delete localStorage.bindType;
    }
  }, [currentUser])

  const bindMicrosoft = () => {
    localStorage.bindType = 'wechat';
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        loginType: 'microsoft',
        userId: id,
      }
    })
  }
  const bindWechat = () => {
    localStorage.bindType = 'wechat';
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        loginType: 'wechat',
        userId: id,
      }
    })
  }


  const unBindMicrosoft = async () => {
    const data = await unbindMicrosoft(id)
    if (data.success) {
      message.success(`Success unBind microsoft account!`);
      dispatch({
        type: 'user/fetchCurrent',
      })
    } else {
      message.error(`Error unBind microsoft account!`);
    }
  }

  const unBindWechat = async () => {
    const data = await unbindWechat(id)
    if (data.success) {
      message.success(`Success unBind wechat account!`);
      dispatch({
        type: 'user/fetchCurrent',
      })
    } else {
      message.error(`Error unBind wechat account!`);
    }
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
      <Descriptions title="Login Methods" layout="vertical" bordered style={{ marginTop: '35px' }}>
        {
          authMethods.includes('wechat') && <Descriptions.Item label="Wechat account">
            {
              currentUser.wechatId ? <><span>Bound status</span><a onClick={unBindWechat} style={{ marginLeft: '15px' }}>unBind</a></> : <><span>Not Bound status</span><a onClick={bindWechat} style={{ marginLeft: '15px' }}>To Bind</a></>
            }
          </Descriptions.Item>
        }
        {
          authMethods.includes('microsoft') && <Descriptions.Item label="Microsoft account">
            {
              currentUser.microsoftId ? <><span>Bound status</span><a onClick={unBindMicrosoft} style={{ marginLeft: '15px' }}>unBind</a></> : <><span>Not Bound status</span><a onClick={bindMicrosoft} style={{ marginLeft: '15px' }}>To Bind</a></>
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