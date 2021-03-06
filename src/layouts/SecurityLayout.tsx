import React from 'react';
import { connect } from 'dva';
import { PageLoading } from '@ant-design/pro-layout';
import { Redirect } from 'umi';
import { stringify } from 'querystring';
import { ConnectState, ConnectProps } from '@/models/connect';
import { CurrentUser } from '@/models/user';
import { RouteComponentProps} from 'react-router-dom';
import H from 'history';
import { message } from 'antd';
import { ConfigStateType } from '@/models/config';

interface Location extends H.Location{
  query: {[key: string]: string};
}
export interface PageProps extends RouteComponentProps {
  location: Location;
}

interface SecurityLayoutProps extends ConnectProps {
  loading?: boolean;
  currentUser?: CurrentUser;
  config?: ConfigStateType;
}

interface SecurityLayoutState {
  isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps & SecurityLayoutState & PageProps> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentWillMount() {
    let token = '';
    let error = '';
    const { location, history } = this.props;
    if (location && location.query && location.query.token) {
      token = location.query.token;
    }
    if (token) {
      localStorage.token = token;
      let redirectPath = location?.pathname;
      const routerBase = window.routerBase;
      if (routerBase.includes(redirectPath) || redirectPath?.includes(routerBase)) {
        history && history.push('/');
      } else {
        history && history.push(location!.pathname);
      }
    }
    if (location && location.query && location.query.error) {
      error = location.query.error;
    }
    if (error) {
      message.error(error);
      let redirectPath = location?.pathname;
      const routerBase = window.routerBase;
      if (routerBase.includes(redirectPath) || redirectPath?.includes(routerBase)) {
        history && history.push('/');
      } else {
        history && history.push(location!.pathname);
      }
    }

  }

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
      dispatch({
        type: 'config/fetchAdminUsers'
      })
    }
    
  }

  render() {
    const { isReady } = this.state;
    const { children, loading, currentUser } = this.props;
    const notLogin = !currentUser || Object.keys(currentUser).length === 0;
    const notRegister = currentUser && (!currentUser.userName && currentUser.openId);
    const queryString = stringify({
      redirect: window.location.href.replace(/\/user\/login$/, ''),
    });
    if ((notLogin && loading) || !isReady) {
      return <PageLoading />;
    }
    if (notLogin) {
      return <Redirect to={`/user/login?${queryString}`}></Redirect>;
    }
    if (notRegister) {
      return <Redirect to={`/user/register?${queryString}`}></Redirect>;
    }
    return children;
  }
}

export default connect(({ user, loading, config }: ConnectState) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
  config,
}))(SecurityLayout);
