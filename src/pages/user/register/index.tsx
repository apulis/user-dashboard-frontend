import { Alert, Icon, message } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { Link, router } from 'umi';
import { connect } from 'dva';
import { StateType } from '@/models/login';
import LoginComponents from './components/Login';
import styles from './style.less';
import { SignUpParamsType, signUp } from '@/services/register';
import { ConnectState } from '@/models/connect';
import IconMicrosoft from '@/components/Icon/IconMicrosoft';
import { CurrentUser } from '@/models/user';
import { textPattern, userNamePattern } from '@/utils/validates';

const { Tab, UserName, Password, NickName, Submit } = LoginComponents;

interface RegisterProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: StateType;
  submitting?: boolean;
  currentUser?: CurrentUser
}
interface LoginState {
  type: string;
  autoLogin: boolean;
}

class Login extends Component<RegisterProps & LoginState & ConnectState> {
  loginForm: FormComponentProps['form'] | undefined | null = undefined;

  state: LoginState = {
    type: 'account',
    autoLogin: true,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
    if (this.props.config.authMethods.length === 0) {
      this.props.dispatch({
        type: 'config/fetchAuthMethods',
      })
    }
    window.addEventListener('unload', this.clearAuthInfo)
  }
  componentWillUnmount() {
    window.removeEventListener('unload', this.clearAuthInfo);
  }

  clearAuthInfo() {
    const currentUser = this.props.currentUser;
    if (currentUser && !currentUser.userName) {
      this.props.dispatch({
        type: 'user/logout',
      })
    }
  }

  changeAutoLogin = (e: CheckboxChangeEvent) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  handleSubmit = async (err: unknown, values: SignUpParamsType) => {
    if (!err) {
      const { userName, password, nickName } = values;
      const submitData: SignUpParamsType = { userName, password, nickName };
      if (this.props.currentUser?.microsoftId && !this.props.currentUser?.userName) {
        submitData.microsoftId = this.props.currentUser?.microsoftId;
      } else if (this.props.currentUser?.wechatId && !this.props.currentUser?.userName) {
        submitData.wechatId = this.props.currentUser.wechatId;
      }
      const res = await signUp(submitData);
      if (res.success === true) {
        // 防止绑定后第二次再去绑定
        this.props.dispatch({
          type: 'user/logout',
        })
        delete localStorage.token;
        this.props.dispatch({
          type: 'user/fetchCurrent',
        })
        message.success('Success Create Account');
        router.push('/user/login');
      } else if (res.duplicate) {
        message.error(`userName ${userName} is in use, please try another`);
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

  render() {
    const authMethods = this.props.config.authMethods;
    const { userLogin = {}, submitting, currentUser } = this.props;
    let defaultUserName = ''
    if (currentUser && currentUser.microsoftId && (!currentUser.userName)) {
      defaultUserName = currentUser.microsoftId.split('@', 1)[0]
    }
    const { status, type: loginType } = userLogin;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={(err, values) => this.handleSubmit(err, values)}
          onCreate={(form?: FormComponentProps['form']) => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab={formatMessage({ id: 'user-register-tab-account-register' })}>
            {status === 'error' &&
              loginType === 'account' &&
              !submitting &&
              this.renderMessage(
                formatMessage({ id: 'user-login.login.message-invalid-credentials' }),
              )}
            <UserName
              name="userName"
              placeholder={`${formatMessage({ id: 'user-login.login.userName' })}`}
              defaultValue={defaultUserName}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-login.userName.required' }),
                },
                {
                  min: 4,
                  message: 'Need at lease 4 letters'
                },
                {
                  max: 22,
                  message: 'Cannot be longer than 22 characters'
                },
                userNamePattern
              ]}
            />
            <NickName
              name="nickName"
              placeholder={`${formatMessage({ id: 'user-register.register.nickName' })}`}
              // 用户未注册，才展示缺省nickName
              defaultValue={(!currentUser?.userName && currentUser) ? currentUser.nickName : ''}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-register.nickName.required' }),
                },
                {
                  min: 6,
                  message: 'Need at least 6 characters'
                },
                {
                  max: 20,
                  message: 'Cannot be longer than 20 characters'
                },
                textPattern
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
                  message: 'Need at lease 6 letters'
                },
                {
                  max: 20,
                  message: 'Cannot be longer than 20 characters'
                }
              ]}
              onPressEnter={e => {
                e.preventDefault();
                if (this.loginForm) {
                  this.loginForm.validateFields(this.handleSubmit);
                }
              }}
            />
            <Password
              name="password2"
              placeholder={`${formatMessage({ id: 'user-login.login.password2' })}`}
              rules={[
                {
                  validator: async (rule, value, callback) => {
                    const password2Error = await this.loginForm?.getFieldError('password2');
                    if (password2Error) {
                      callback(password2Error);
                      return;
                    }
                    const values = await this.loginForm?.getFieldsValue();
                    if (!values) return;
                    if (values.password !== values.password2) {
                      callback('Password inconsistent');
                    }
                    
                  }
                },
              ]}
              onPressEnter={e => {
                e.preventDefault();
                if (this.loginForm) {
                  this.loginForm.validateFields(this.handleSubmit);
                }
              }}
            />
          </Tab>
          {
            (currentUser && !currentUser.userName) ? <Alert message="You have joined, Now need to register for Apulis AI Platform" type="success" /> : <></>
          }
          <Submit loading={submitting}>
            <FormattedMessage id="user-register.register.register" />
          </Submit>
          <div className={styles.other}>
            <FormattedMessage id="user-register.register.sign-up-with" />
            {
              authMethods.includes('wechat') && 
                <Icon onClick={() => this.toLogin('wechat')} type="wechat" className={styles.icon} theme="outlined" />
            }
            {
              authMethods.includes('microsoft') && <IconMicrosoft style={{marginLeft: '15px'}} onClick={() => this.toLogin('microsoft')} />
            }
            <Link className={styles.register} to="/user/login">
              <FormattedMessage id="user-register.register.signin" />
            </Link>
          </div>
        </LoginComponents>
      </div>
    );
  }
}

export default connect(({ login, loading, user, config }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
  currentUser: user.currentUser,
  config
}))(Login);
