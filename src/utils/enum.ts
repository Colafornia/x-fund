export const timeRelative = {
  'Z': '近一周',
  'Y': '近1月',
  '3Y': '近3月',
  '6Y': '近6月',
  '1N': '近1年',
  // '2N': '近2年',
  '3N': '近3年',
  '5N': '近五年',
  'JN': '今年来',
  'LN': '成立来',
}

export const timeRelativeList = [
  {
    label: '近1月',
    value: 'm',
  }, {
    label: '近3月',
    value: 'q',
  }, {
    label: '近6月',
    value: 'hy',
  }, {
    label: '近1年',
    value: 'y',
  }, {
    label: '近3年',
    value: 'try',
  }, {
    label: '近5年',
    value: 'fiy',
  }, {
    label: '今年',
    value: 'sy',
  }, {
    label: '成立以来',
    value: 'se',
  }
];

export const comparTimeRelativeList = [
  {
    label: '近1周',
    value: 'week',
  }, {
    label: '近1月',
    value: 'month',
  }, {
    label: '近3月',
    value: 'threemonth',
  }, {
    label: '近6月',
    value: 'sixmonth',
  }, {
    label: '近1年',
    value: 'year',
  }, {
    label: '近3年',
    value: 'threeyear',
  }
];

// 指数列表
export const indexList = [
  {
    code: '000300',
    name: '沪深300',
  }, {
    code: '000905',
    name: '中证500',
  }, {
    code: '000001',
    name: '上证指数',
  }, {
    code: '399001',
    name: '深证成指',
  }, {
    code: '399006',
    name: '创业板指',
  }
];

// 行情数据枚举值
export const hqKeys = [{
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
