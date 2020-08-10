import React, { useEffect, useState, FC, useImperativeHandle, forwardRef } from 'react';
import { Table, message, Input } from 'antd';
import { getVcList } from '@/services/users';

const { Search } = Input;

const VCTable = (props: any, ref: any) => {
  const [pageParams, setPageParams] = useState({ page: 1, size: 10 });
  const [loading, setLoading] = useState(false);
  const [vcList, setVcList] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectRowKeys] = useState<string[] | number[]>([]);
  useImperativeHandle(ref, () => ({ 
    selectedRowKeys: selectedRowKeys
  }));

  useEffect(() => {
    getData();
  }, [pageParams]);

  const getData = () => {
    setLoading(true);
    getVcList(pageParams).then(res => {
      console.log('----res', res)
      const { result, totalNum } = res;
      if (result.length) setVcList(result);
      setTotal(totalNum);
      setLoading(false);
    }).catch(error => {
      setLoading(false);
      message.error('loading VCList error');
    })
  }

  const columns = [
    {
      title: 'VCName',
      dataIndex: 'vcName',
    },
    {
      title: 'UserNumber',
      dataIndex: 'UserNumber',
      render: (i: string) => 111
    },
    {
      title: 'DeviceType',
      dataIndex: 'quota',
      render: (i: string) => getDeviceTypeContent(i)
    },
    {
      title: 'DeviceNumber',
      dataIndex: 'quota',
      render: (i: string) => getDeviceTypeContent(i, true)
    },
    {
      title: 'MaxAvailable',
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
    setSelectRowKeys(selectedRowKeys);
    console.log('----', selectedRowKeys)
  }

  const onSearch = (v: string) => {
    console.log('----', v)
  }

  const pageParamsChange = (page: any, size: any) => {
    setPageParams({ page: page, size: size });
  };

  return (
    <div>
      <Search
        placeholder="search VCName"
        onSearch={onSearch}
        style={{ width: 200 }}
      />
      <Table
        style={{marginTop: '20px'}}
        rowSelection={{
          type: "checkbox",
          onChange: onRowSelection,
          selectedRowKeys: selectedRowKeys
        }}
        rowKey="vcName"
        dataSource={vcList}
        columns={columns}
        loading={loading}
        pagination={{
          total: total,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
          current: pageParams.page,
          pageSize: pageParams.size
        }}
      />
    </div>
  )
}

export default forwardRef(VCTable);
