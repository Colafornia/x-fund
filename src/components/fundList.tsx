import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, useHistory } from "react-router-dom";
import { connect } from 'react-redux'
import useLocalStorage from 'src/hooks/useLocalStorage';
import { Select, Table, Popconfirm, Tag, List, Row, Col, Card, Tooltip, Button, message } from 'antd';
import { ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import NumberDisplay from './numberDisplay';
import FundLine from './fundLine';
import { searchFund, getFundInfo } from 'src/service';
import { sendLog, addChineseUnit, copyTextToClipboard } from 'src/utils/common';
import { timeRelative, hqKeys } from 'src/utils/enum';
// @ts-ignore
import { industryColumns, stockColumns, zfColumns, hqColumns } from 'src/utils/rendered.tsx';
import { debounce, flatten } from 'lodash';

const { Option } = Select;


const formatRMB = addChineseUnit();

const getTags = (record) => {
  return flatten(record.JJBQ?.Datas?.map((data) => {
    if (Number(data.FEATYPE) < 3) {
      return data.TAGLIST.map((tag) => tag.FEATAG !== '--' ? tag.FEATAG : tag.FEANAME);
    }
    return '';
  }).filter(v => Boolean(v)));
}

const listRendered = (record) => {
  return [
    {
      label: '标签',
      hide: !getTags(record).length,
      rendered: () => getTags(record).map(
        (tag) => <Tag key={tag} color="processing">{ tag }</Tag>
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
        const dataSource = record.TSSJ.Datas;
        const list = hqKeys.map((item) => {
          return {
            key: item.title,
            title: item.title,
            value: dataSource[item.key] || '-',
            rank: `${dataSource[item.rank1] || '-'}/${dataSource[item.rank2] || '-'}`,
          }
        });
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


function FundList({ dispatch }) {
  const firstUpdate = useRef(true);
  const { codes = [] } = useParams();
  const history = useHistory();
  const [ storage, setStorage ] = useLocalStorage('_storageCodes', [] as any[]);
  const [loading, setLoading] = useState(false);
  const [searchList, setSearchList] = useState([] as any[]);
  const [fundList, setFundList] = useState([] as any[]);
  const [expandableList, setExpandableList] = useState([] as any[]);
  const [selectedRows, setSelectedRows] = useState([] as any[]);

  const initFundList = async (codes) => {
    setLoading(true);
    const result = await Promise.all(codes.map(code => getFundInfo(code)));
    setFundList(result);
    setLoading(false);
  };

  useEffect(() => {
    if (codes && codes.length && codes.split(',')?.length) {
      initFundList(codes.split(','));
      sendLog(`init fund width params: ${codes}`);
    } else if (storage.length) {
      initFundList(storage);
      sendLog(`init fund width storage: ${storage}`);
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
    if (!fundList.some((fund) => fund.FCODE === code)) {
      const info = await getFundInfo(code);
      setFundList([info].concat(fundList));
    } else {
      message.warning(`基金 ${code} 已在列表中`);
    }
  }

  const handleDelete = (code: string) => {
    const list = [...fundList];
    setFundList(list.filter(item => item.FCODE !== code));
  }

  const refresh = () => {
    initFundList(fundList.map((fund) => fund.key));
    sendLog(`refresh fund list: ${fundList.map(item => item.key).join(',')}`);
  }

  const expand = (record) => {
    if (expandableList.includes(record.key)) {
      setExpandableList(expandableList.filter(key => key !== record.key));
    } else {
      setExpandableList([record.key].concat(expandableList));
    }
  }

  const copyUrl = async () => {
    const url = `https://${window.location.host}/x-fund/#/${fundList.map((fund) => fund.key).join(',')}`;
    const isSuccess = await copyTextToClipboard(url);
    if (isSuccess) {
      message.success('已复制到剪贴板');
    } else {
      message.error('由于浏览器兼容性，复制失败，请手动复制 ' + url);
    }
  }

  const expandedRowRender = (record) => {
    const allocation = record?.JJCC?.Datas?.SectorAllocation || {};
    let industryData = (Object.values(allocation)?.[0] || []) as any[];
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
          <Card title="累积收益率走势">
            <FundLine fundCode={record.FCODE} />
          </Card>
          <Card title="基金持仓">
            <Table
              pagination={false}
              className="fund-stock-list"
              columns={stockColumns(record)}
              dataSource={record.JJCC?.Datas?.InverstPosition.fundStocks || []}
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

  const goSimilarity = () => {
    sendLog(`similarity: ${selectedRows.map(item => item.key).join(',')}`);
    history.push('/similarity');
  }

  const rowSelection = {
    onChange: (_, selectedRows) => {
      setSelectedRows(selectedRows);
      dispatch({
        type: 'UPDATE',
        funds: selectedRows,
      });
    },
  };

  return (
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
          <Tooltip title='选中2~10支基金可进行对比分析'>
            <Button
              disabled={selectedRows.length < 2 || selectedRows.length > 10}
              onClick={() => goSimilarity()}
              style={{ marginLeft: 8 }}>
                分析持仓相似度
            </Button>
          </Tooltip>
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
        rowSelection={rowSelection}
        expandedRowKeys={expandableList}
        columns={columns}
        expandable={{ expandedRowRender }}
        dataSource={fundList}
      />
    </div>
  );
}

export default connect()(FundList);
