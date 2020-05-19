import React, { ReactNode, ReactChild } from 'react';

import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect';

interface IAuthorizedHOC {
  children: ReactChild;
  needPermission?: string | string[]
}


const AuthorizedHOC: React.FC<IAuthorizedHOC & ConnectState> = ({children, needPermission, user}) => {

  const { currentUser } = user;
  if (!currentUser) {
    return null;
  }
  const { currentAuthority } = currentUser;
  if (needPermission) {
    if (Array.isArray(needPermission)) {
      let c: React.ReactNode = null;
      needPermission.some(p => {
        if (currentAuthority?.includes(p)) {
          c = (<>
            { children }
          </>)
        }
      })
      return c;
    } else {
      if (currentAuthority?.includes(needPermission)) {
         (<>
          { children }
        </>)
      }
    }
  }
  if (!needPermission) {
    return (
      <>
      { children }
      </>
    );
  }

  return null;
}

export default connect(({ user }: ConnectState) => ({
  user: user,
}))(AuthorizedHOC); 