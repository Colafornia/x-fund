import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import useLocalStorage from 'src/hooks/useLocalStorage';
import { Select, Table, Popconfirm, Layout, Tag, List, Row, Col, Card, Tooltip, message } from 'antd';
import { ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import NumberDisplay from './numberDisplay';
import { searchFund, getFundInfo } from 'src/service';
import { addChineseUnit, copyTextToClipboard } from 'src/utils/common';
import { timeRelative } from 'src/utils/enum';
import { debounce, flatten } from 'lodash';

const { Option } = Select;
const { Content } = Layout;

const formatRMB = addChineseUnit();

const getTags = (record) => {
  return flatten(record.JJBQ?.Datas.map((data) => {
    if (Number(data.FEATYPE) < 3) {
      return data.TAGLIST.map((tag) => tag.FEATAG !== '--' ? tag.FEATAG : tag.FEANAME);
    }
    return '';
  }).filter(v => Boolean(v)));
}

const listRendered = (record) => {
  const zfColumns = [
    {
      title: '时间区间',
      key: 'title',
      render: (item) => timeRelative[item.title],
    },
    {
      title: '收益率',
      key: 'syl',
      render: (item) => <NumberDisplay value={item.syl+ '%'} />,
    },
    {
      title: '同类排行',
      key: 'rank',
      render: (item) => `${item.rank || '-'}/${item.sc || '-'}`,
    },
  ];
  const hqColumns = [
    {
      title: '名称',
      key: 'title',
      dataIndex: 'title',
    },
    {
      title: '数据',
      key: 'value',
      dataIndex: 'value',
    },
    {
      title: '排名',
      key: 'rank',
      dataIndex: 'rank',
    }
  ];
  return [
    {
      label: '标签',
      hide: !getTags(record).length,
      rendered: () => getTags(record).map(
        (tag) => <Tag color="processing">{ tag }</Tag>
      ),
    },
    {
      label: '基金类型',
      rendered: () => record.JJXQ.Datas.FTYPE,
    },
    {
      label: '业绩比较基准',
      rendered: () => record.JJXQ.Datas.BENCH,
    },
    {
      label: '基金规模（元）',
      rendered: () => formatRMB(record.JJXQ.Datas.ENDNAV, 2),
    },
    {
      label: '特点',
      rendered: () => record.JJXQ.Datas.COMMENTS,
    },
    {
      label: '阶段涨幅',
      hide: !record.JDZF.Datas.length,
      rendered: () => {
        const list = record.JDZF.Datas.filter(item => Boolean(timeRelative[item.title]));
        return (<Table
          pagination={false}
          className="fund-detail-jd"
          columns={zfColumns}
          dataSource={list}
        />)
      },
    },
    {
      label: '行情数据',
      rendered: () => {
        const keys = [{
          title: '近1年夏普比率',
          key: 'SHARP1',
          rank1: 'SHARP_1NRANK',
          rank2: 'SHARP_1NFSC'
        }, {
          title: '近3年夏普比率',
          key: 'SHARP3',
          rank1: 'SHARP_3NRANK',
          rank2: 'SHARP_3NFSC'
        }, {
          title: '近5年夏普比率',
          key: 'SHARP5',
          rank1: 'SHARP_5NRANK',
          rank2: 'SHARP_5NFSC'
        }, {
          title: '近1年最大回撤（%）',
          key: 'MAXRETRA1',
          rank1: 'MAXRETRA_1NRANK',
          rank2: 'MAXRETRA_1NFSC'
        }, {
          title: '近3年最大回撤（%）',
          key: 'MAXRETRA3',
          rank1: 'MAXRETRA_3NRANK',
          rank2: 'MAXRETRA_3NFSC'
        }, {
          title: '近5年最大回撤（%）',
          key: 'MAXRETRA5',
          rank1: 'MAXRETRA_5NRANK',
          rank2: 'MAXRETRA_5NFSC'
        }, {
          title: '近1年波动率（%）',
          key: 'STDDEV1',
          rank1: 'STDDEV_1NRANK',
          rank2: 'STDDEV_1NFSC'
        },{
          title: '近3年波动率（%）',
          key: 'STDDEV3',
          rank1: 'STDDEV_3NRANK',
          rank2: 'STDDEV_3NFSC'
        },{
          title: '近5年波动率（%）',
          key: 'STDDEV5',
          rank1: 'STDDEV_5NRANK',
          rank2: 'STDDEV_5NFSC'
        },]
        const dataSource = record.TSSJ.Datas;
        const list = keys.map((item) => {
          return {
            title: item.title,
            value: dataSource[item.key] || '-',
            rank: `${dataSource[item.rank1] || '-'}/${dataSource[item.rank2] || '-'}`,
          }
        });
        console.log(dataSource, list)
        return (<Table
          pagination={false}
          className="fund-detail-jd"
          columns={hqColumns}
          dataSource={list}
        />)
      },
    },
  ];
};

const stockColumns = (record) => {
  const stockValues = record.stockValue || [];
  return [
    {
      title: '股票代码',
      key: 'code',
      dataIndex: 'GPDM',
    },
    {
      title: '股票名称',
      key: 'name',
      dataIndex: 'GPJC',
    },
    {
      title: '涨跌幅',
      key: 'value',
      render: (item) => {
        const value = stockValues.find((stock) => stock.f12 === item.GPDM)?.f3;
        return <NumberDisplay value={value ? value + '%' : '-'} />
      },
    },
    {
      title: '持仓占比',
      key: 'percent',
      render: (item) => `${item.JZBL}%`,
    },
    {
      title: '行业',
      key: 'industry',
      dataIndex: 'INDEXNAME',
    },
    {
      title: '较上期持仓变化',
      key: 'change',
      render: (item) => `${item.PCTNVCHGTYPE} ${item.PCTNVCHG}%`,
    },
  ]
}

const industryColumns = () => {
  return [
    {
      title: '行业名称',
      key: 'name',
      dataIndex: 'HYMC',
    },
    {
      title: '占比',
      key: 'percent',
      render: (item) => `${item.ZJZBL}%`,
    },
    {
      title: '数据日期',
      key: 'date',
      dataIndex: 'FSRQ',
    },
  ]
}

export default function FundList() {
  const firstUpdate = useRef(true);
  const { codes = [] } = useParams();
  const [ storage, setStorage ] = useLocalStorage('_storageCodes', [] as any[]);
  const [loading, setLoading] = useState(false);
  const [searchList, setSearchList] = useState([] as any[]);
  const [fundList, setFundList] = useState([] as any[]);
  const [expandableList, setExpandableList] = useState([] as any[]);

  const initFundList = async (codes) => {
    setLoading(true);
    const result = await Promise.all(codes.map(code => getFundInfo(code)));
    setFundList(result);
    setLoading(false);
  };

  useEffect(() => {
    if (codes && codes.length && codes.split(',')?.length) {
      initFundList(codes.split(','));
    } else if (storage.length) {
      initFundList(storage);
    }
  }, []);

  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setStorage(fundList.map(item => item.key));
  }, [fundList.length]);


  const handleSearch = debounce(async (key) => {
    const list = await searchFund(key);
    setSearchList(list);
  }, 300)

  const handleChange = async (code) => {
    const info = await getFundInfo(code);
    setFundList([info].concat(fundList));
  }

  const handleDelete = (code: string) => {
    const list = [...fundList];
    setFundList(list.filter(item => item.FCODE !== code));
  }

  const refresh = () => {
    initFundList(fundList.map((fund) => fund.key));
  }

  const expand = (record) => {
    if (expandableList.includes(record.key)) {
      setExpandableList(expandableList.filter(key => key !== record.key));
    } else {
      setExpandableList([record.key].concat(expandableList));
    }
  }

  const copyUrl = async () => {
    const url = `${window.location.host}/${fundList.map((fund) => fund.key).join(',')}`;
    const isSuccess = await copyTextToClipboard(url);
    if (isSuccess) {
      message.success('已复制到剪贴板');
    } else {
      message.error('由于浏览器兼容性，复制失败，请手动复制 ' + url);
    }
  }

  const expandedRowRender = (record) => {
    let industryData = (Object.values(record.JJCC.Datas.SectorAllocation)?.[0] || []) as any[];
    industryData = industryData.filter(item => Number(item.ZJZBL) > 0);

    return (
      <Row gutter={16}>
        <Col span={8} className="table-nested-col">
          <Card>
            <List
            itemLayout="horizontal"
            dataSource={listRendered(record)}
            renderItem={item => (
              <List.Item>
                {item.hide ? null : <List.Item.Meta
                  title={item.label}
                  description={item.rendered()}
                />}
              </List.Item>
            )}
          />
          </Card>
        </Col>
        <Col span={16} className="table-nested-col">
          <Card title="基金持仓">
            <Table
              pagination={false}
              className="fund-stock-list"
              columns={stockColumns(record)}
              dataSource={record.JJCC.Datas.InverstPosition.fundStocks}
              />
            </Card>
            <Card title="持仓行业占比" style={{marginTop: 16}}>
              <Table
                pagination={false}
                className="fund-industry-list"
                columns={industryColumns()}
                dataSource={industryData}
                />
            </Card>
        </Col>
      </Row>
    )
  }

  const columns = [
    { title: '基金代码', dataIndex: 'FCODE', key: 'code' },
    { title: '基金名称', dataIndex: 'SHORTNAME', key: 'name' },
    { title: '净值', key: 'value', render: (record) => (<>
      <div>{record.NAV}</div>
      <div><NumberDisplay value={record.NAVCHGRT+ '%'} /></div>
      <div>日期：{record.PDATE}</div>
    </>) },
    { title: '估值', key: 'gz', render: (record) => (<>
      <div>{record.GSZ}</div>
      <div><NumberDisplay value={record.GSZZL+ '%'} /></div>
      <div>更新时间：{record.GZTIME}</div>
    </>) },
    { title: 'Operation', key: 'operation', render: (_, record: { FCODE: string, key: string }) => (
      <>
      <a onClick={() => expand(record)} style={{marginRight: 8}}>
        {expandableList.includes(record.key) ? '收起' : '查看更多'}
      </a>
      <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.FCODE)}>
        <a>删除</a>
      </Popconfirm>
      </>
    ) },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content>
      <Card title="X-FUND" bordered={false}>
        <div className="fund-list">
          <Row>
            <Col span={8}>
                <Select
                showSearch
                style={{ width: 200, marginBottom: 16, }}
                placeholder='输入基金名称或代码搜索'
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={handleSearch}
                onChange={handleChange}
                notFoundContent={null}
              >
                {searchList.map((fund) => <Option key={fund.code} value={fund.code}>{fund.name}</Option>)}
              </Select>
            </Col>
            <Col offset={8} span={7} style={{textAlign: 'right'}}>
              <Tooltip title='刷新数据'>
                <ReloadOutlined style={{marginRight: 8}} onClick={() => refresh()} />
              </Tooltip>
              <Tooltip title='如果你想跨设备/浏览器来查询已选的基金，请点击复制网址到粘贴板进行访问'>
                <CopyOutlined onClick={() => copyUrl()} />
              </Tooltip>
            </Col>
          </Row>
          <Table
            pagination={false}
            loading={loading}
            className="fund-list-nested"
            expandIconColumnIndex={-1}
            expandedRowKeys={expandableList}
            columns={columns}
            expandable={{ expandedRowRender }}
            dataSource={fundList}
          />
       </div>
      </Card>
    </Content>
    </Layout>
  );
}
