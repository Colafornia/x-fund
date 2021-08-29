import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Card, Row, Col, Radio } from 'antd';
import RadarChart from './radarChart';
import LineChart from './lineChart';
import { getComparedBenefit} from 'src/service'
import { comparTimeRelativeList } from 'src/utils/enum'

const sortMap = (mapObj) => {
  let list = [] as any[];
  for (let [key, value] of mapObj.entries()) {
    list.push({
      key,
      ...value,
    })
  }
  return list.filter((item) => item.freq > 1).sort((a, b) => b.freq - a.freq);
}

const calculateSimilarity = (funds): any[] => {
  const stockFreqMap = new Map();
  const industryFreqMap = new Map();
  funds.forEach((fund) => {
    if (fund.stocks?.length) {
      fund.stocks.forEach((stockObj) => {
        const stock = {
          fundName: fund.name,
          ...stockObj,
        };
        // 股票集中度
        if (!stockFreqMap.has(stock.GPJC)) {
          stockFreqMap.set(stock.GPJC, {
            freq: 1,
            list: [stock],
          })
        } else {
          stockFreqMap.set(stock.GPJC, {
            freq: stockFreqMap.get(stock.GPJC).freq + 1,
            list: [stock].concat(stockFreqMap.get(stock.GPJC).list),
          });
        }
        // 行业集中度
        if (stock.INDEXNAME && stock.INDEXNAME !== '--' && !industryFreqMap.has(stock.INDEXNAME)) {
          industryFreqMap.set(stock.INDEXNAME, {
            freq: 1,
            list: [stock],
          })
        } else if (stock.INDEXNAME && stock.INDEXNAME !== '--') {
          industryFreqMap.set(stock.INDEXNAME, {
            freq: industryFreqMap.get(stock.INDEXNAME).freq + 1,
            list: [stock].concat(industryFreqMap.get(stock.INDEXNAME).list),
          })
        }
      })
    }
  })
  return [sortMap(stockFreqMap), sortMap(industryFreqMap)];
};

const stockColumns = (type = 'stock') => [
  {
    title: type === 'stock' ? '股票名称' : '行业名称',
    key: 'name',
    dataIndex: 'key'
  }, {
    title: '重复次数',
    key: 'freq',
    dataIndex: 'freq'
  }, {
    title: '详情',
    key: 'detail',
    render: (item) => item.list.map((stock) => (
    <div key={stock.fundName + stock.GPDM}>{stock.fundName} : {stock.GPJC}({stock.GPDM}) 持仓比例： {stock.JZBL + '%'}</div>
    )),
  }
];

function Similarity({ funds = [] as any[] }) {
  const [loading, setLoading] = useState(false);
  const [stockSimilarity, setStockSimilarity] = useState([] as any[]);
  const [industrySimilarity, setIndustrySimilarity] = useState([] as any[]);
  const [industryRadarData, setIndustryRadarData] = useState([] as any[]);
  const [range, setRange] = useState('year')
  const [chartData, setChartData] = useState([] as any[]);

  const fetchData = async () => {
    const data = await getComparedBenefit(funds.map(fund => fund.FCODE), range);
    setChartData(data);
  }

  useEffect(() => {
    fetchData();
  }, [range]);

  useEffect(() => {
    setLoading(true);
    try {
      const list = funds.map((fund: any) => ({
        code: fund.FCODE,
        name: fund.SHORTNAME,
        stocks: fund?.JJCC?.Datas?.InverstPosition?.fundStocks || [],
      }));
      fetchData();
      const [stockRes, industryRes ] = calculateSimilarity(list);
      setStockSimilarity(stockRes);
      setIndustrySimilarity(industryRes);
      setIndustryRadarData(industryRes.map((item) => (
        {
          name: item.key,
          value: item.freq,
          list: item.list,
        }
      )));
    } catch(e) {};
    setLoading(false);
  }, []);

  const handleRangeChange = (e) => {
    setRange(e.target.value);
  }

  const radarTooltipFormatter = (title, value, items) => {
    const listDom = items.list.map((stock) => <div style={{marginBottom: 8}} key={stock.fundName+stock.GPDM}>
      {stock.fundName} : {stock.GPJC}({stock.GPDM}) 持仓比例： {stock.JZBL + '%'}
    </div>)
    return (<div style={{padding: '8px 8px 0 8px'}}>
      <div style={{marginBottom: 10, fontSize: 13, fontWeight: 500}}>
        {title}
        <span> {value}次</span>
      </div>
    {listDom}
    </div>);
  }

  return (
    <div className="fund-similarity">
      <Card title="集中度分析">
        分析基金：{ funds.map(fund => fund.SHORTNAME).join(' | ')}
      </Card>
      <Card title="可视化结果" style={{marginTop: 16}}>
        <Row>
          <Col span={6}>
            <RadarChart data={industryRadarData} formatter={radarTooltipFormatter} />
          </Col>
          <Col span={8} offset={2}>
          <Radio.Group value={range} onChange={handleRangeChange} style={{ marginBottom: 16 }}>
            {comparTimeRelativeList.map(
              (time) => (
              <Radio.Button
                key={time.value}
                value={time.value}
              >
                {time.label}
              </Radio.Button>
            ))}
          </Radio.Group>
            <LineChart data={chartData} />
          </Col>
        </Row>
      </Card>
      <Card title="重复持仓" style={{marginTop: 16}}>
        <Table
          pagination={false}
          loading={loading}
          className="fund-list-nested"
          columns={stockColumns('stock')}
          dataSource={stockSimilarity}
          locale={{
            emptyText: '无重复持仓'
          }}
        />
      </Card>
      <Card title="行业集中度分析" style={{marginTop: 16}}>
        <Table
          pagination={false}
          loading={loading}
          className="fund-list-nested"
          columns={stockColumns('industry')}
          dataSource={industrySimilarity}
          locale={{
            emptyText: '无重复行业'
          }}
        />
      </Card>
    </div>
  )
}

export default connect((state) => state)(Similarity as any);


