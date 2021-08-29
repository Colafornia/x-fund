import React from 'react';
import NumberDisplay from 'src/components/numberDisplay';
import { timeRelative } from 'src/utils/enum';

// 持仓行业
export const industryColumns = () => {
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
};

// 持仓股票数据
export const stockColumns = (record) => {
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
};

// 阶段涨幅
export const zfColumns = [
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

// 行情
export const hqColumns = [
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