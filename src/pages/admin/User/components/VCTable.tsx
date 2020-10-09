import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Table, Input } from 'antd';
import { getVcList, getUserVc } from '@/services/users';
import { formatMessage } from 'umi-plugin-react/locale';
import { format } from 'prettier';

const { Search } = Input;

const VCTable = (props: any, ref: any) => {
  const [pageParams, setPageParams] = useState({ pageNo: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [allVcList, setAllVcList] = useState([]);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState('');
  const [selectVcList, setSelectVcList] = useState<string[] | number[]>([]);
  useImperativeHandle(ref, () => ({ 
    selectVcList: selectVcList || []
  }));

  useEffect(() => {
    getData();
  }, [pageParams]);

  const getData = async () => {
    const { currentHandleUserId } = props;
    setLoading(true);
    const requestArr = [
      getVcList({ ...pageParams, search: name }),
      getUserVc(currentHandleUserId, { pageNo: 1, pageSize: 9999 })
    ];
    const res = await Promise.all(requestArr);
    const { vcList } = res[0];
    const { list } = res[1];
    if (res[0].success) {
      setAllVcList(vcList.list);
      setTotal(vcList.total);
    }
    if (res[1].success) {
      setSelectVcList(list.map((i: { vcName: string; }) => i.vcName));
    }
    setLoading(false);
  }

  const columns = [
    {
      title: formatMessage({id: 'user.vc.VCName'}),
      dataIndex: 'vcName',
    },
    {
      title: formatMessage({id: 'user.vc.UserCount'}),
      dataIndex: 'userNum'
    },
    {
      title: formatMessage({id: 'user.vc.DeviceType'}),
      dataIndex: 'quota',
      render: (i: string) => getDeviceTypeContent(i)
    },
    {
      title: formatMessage({id: 'user.vc.DeviceCount'}),
      dataIndex: 'quota',
      render: (i: string) => getDeviceTypeContent(i, true)
    },
    {
      title: formatMessage({id: 'user.vc.MaxAvailable'}),
      dataIndex: 'metadata',
      render: (i: string) => getDeviceTypeContent(i, true, true)
    }
  ]

  const getDeviceTypeContent = (v: string, isNum?: boolean, isMetadata?: boolean) => {
    const val = JSON.parse(v);
    const keys = Object.keys(val);
    let content = null;
    if (keys.length) {
      isNum ? content = keys.map(i => <p>{isMetadata ? val[i].user_quota : val[i]}</p>)  : content = keys.map(i => <p>{i}</p>)
    }
    return content;
  }

  const onRowSelection: (selectedRowKeys: string[] | number[]) => void = (selectedRowKeys) => {
    setSelectVcList(selectedRowKeys);
  }

  const onSearch = (v: string) => {
    setName(v);
    setPageParams({ ...pageParams, pageNo: 1 });
  }

  const pageParamsChange = (page: any, size: any) => {
    setPageParams({ pageNo: page, pageSize: size });
  };

  return (
    <div>
      <Search
        placeholder={formatMessage({id: 'user.vc.search.vc'})}
        onSearch={onSearch}
        style={{ width: 200 }}
      />
      <Table
        style={{marginTop: '20px'}}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
          selectedRowKeys: selectVcList
        }}
        rowKey="vcName"
        dataSource={allVcList}
        columns={columns}
        loading={loading}
        pagination={{
          total: total,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
          current: pageParams.pageNo,
          pageSize: pageParams.pageSize
        }}
      />
    </div>
  )
}

export default forwardRef(VCTable);
