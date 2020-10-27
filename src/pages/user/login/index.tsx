import { Alert, Checkbox, Icon, message } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component, RefObject } from 'react';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { Link } from 'umi';
import { connect } from 'dva';
import router from 'umi/router';
import { StateType } from '@/models/login';
import LoginComponents from './components/Login';
import styles from './style.less';
import { LoginParamsType, logInWithAccount } from '@/services/login';
import { ConnectState } from '@/models/connect';
import IconMicrosoft from '@/components/Icon/IconMicrosoft'
import { textPattern, userNamePattern } from '@/utils/validates';

const { Tab, UserName, Password, Submit } = LoginComponents;


interface LoginProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: StateType;
  submitting?: boolean;
}
interface LoginState {
  type: string;
  autoLogin: boolean;
}

class Login extends Component<LoginProps & LoginState & ConnectState> {
  loginForm: FormComponentProps['form'] | undefined | null = undefined;

  state: LoginState = {
    type: 'account',
    autoLogin: true,
  };

  changeAutoLogin = (e: CheckboxChangeEvent) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  componentDidMount() {
    if (this.props.config.authMethods.length === 0) {
      this.props.dispatch({
        type: 'config/fetchAuthMethods',
      })
    }
  }

  handleSubmit = async (err: unknown, values: LoginParamsType) => {
    if (!err) {
      const { dispatch } = this.props
      try {
        await dispatch({
          type: 'login/login',
          payload: {...values}
        })
      } catch (err) {
        console.log('err', err)
      }
      
    }
  };

  onTabChange = (type: string) => {
    this.setState({ type });
  };

  renderMessage = (content: string) => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  toLogin = (loginType: string) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/oauthLogin',
      payload: {
        loginType, 
      }
    })
  }

  componentDidUpdate(currentProps: LoginProps, prevProps: LoginProps) {
    if (currentProps.userLogin?.status !== prevProps.userLogin?.status) {
      this.loginForm?.resetFields(['password']);
    }
  }

  render() {
    const authMethods = this.props.config.authMethods;
    console.log('authMethods', authMethods)
    const { userLogin = {}, submitting } = this.props;
    const { status, type: loginType } = userLogin;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          onCreate={(form?: FormComponentProps['form']) => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab={formatMessage({ id: 'user-login.login.tab-login-credentials' })}>
            {status === 'error' &&
              loginType === 'account' &&
              !submitting &&
              this.renderMessage(
                formatMessage({ id: 'user-login.login.message-invalid-credentials' }),
              )}
            <UserName
              name="userName"
              placeholder={`${formatMessage({ id: 'user-login.login.userName' })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-login.userName.required' }),
                },
                {
                  min: 4,
                  message: formatMessage({id: 'users.add.form.userName.min'})
                },
                {
                  max: 20,
                  message: formatMessage({id: 'users.add.form.userName.max'})
                },
                userNamePattern
              ]}
            />
            <Password
              name="password"
              placeholder={`${formatMessage({ id: 'user-login.login.password' })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-login.password.required' }),
                },
                {
                  min: 6,
                  message: formatMessage({id: 'users.add.form.password.min'})
                },
                {
                  max: 20,
                  message: formatMessage({id: 'users.add.form.password.max'})
                }
              ]}
              onPressEnter={e => {
                e.preventDefault();
                if (this.loginForm) {
                  this.loginForm.validateFields(this.handleSubmit);
                }
              }}
            />
          </Tab>
          {/* <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              <FormattedMessage id="user-login.login.remember-me" />
            </Checkbox>
          </div> */}
          <Submit loading={submitting}>
            <FormattedMessage id="user-login.login.login" />
          </Submit>
          <div className={styles.other}>
            <FormattedMessage id="user-login.login.sign-in-with" />
            {
              authMethods.includes('wechat') && 
                <Icon onClick={() => this.toLogin('wechat')} type="wechat" className={styles.icon} theme="outlined" />
            }
            {
              authMethods.includes('microsoft') && <IconMicrosoft style={{marginLeft: '15px'}} onClick={() => this.toLogin('microsoft')} />
            }
            {
              authMethods.includes('saml') && <Icon type="coffee" style={{marginLeft: '15px'}} onClick={() => this.toLogin('saml')} />
            }
            <Link className={styles.register} to="/user/register">
              <FormattedMessage id="user-login.login.signup" />
            </Link>
          </div>
        </LoginComponents>
      </div>
    );
  }
}

export default connect(({ login, loading, config }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
  config
}))(Login);
