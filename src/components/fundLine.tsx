import React, { useState, useEffect } from 'react';
import { Radio, Select } from 'antd';
import LineChart from './lineChart';
import { timeRelativeList, indexList } from 'src/utils/enum';
import { getBenefitData } from 'src/service';

export default function (props) {
  const { fundCode } = props;
  const [chartData, setChartData] = useState([] as any);
  const [range, setRange] = useState('q');
  const [indexCode, setIndexCode] = useState('000300');

  const fetchData = async () => {
    const data = await getBenefitData(fundCode, indexCode, range);
    setChartData(data);
  }

  useEffect(() => {
    fetchData();
  }, [range, indexCode]);

  const handleRangeChange = (e) => {
    setRange(e.target.value);
  }

  const handleIndexChange = (value: string) => {
    setIndexCode(value);
  }

  return (<div className="fund-line-chart">
    <Select style={{ width: 120 }} value={indexCode} onChange={handleIndexChange}>
      {indexList.map((index) => (
        <Select.Option key={index.code} value={index.code}>{index.name}</Select.Option>
      ))}
    </Select>

    <Radio.Group value={range} onChange={handleRangeChange} style={{ marginBottom: 16, marginLeft: 12 }}>
      {timeRelativeList.map(
        (time) => (
        <Radio.Button
          key={time.value}
          value={time.value}
        >
          {time.label}
        </Radio.Button>
      ))}
    </Radio.Group>
    {chartData.length ? <LineChart data={chartData} /> : '暂无数据'}
  </div>)
}
