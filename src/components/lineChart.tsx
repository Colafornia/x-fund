import React from 'react';
import {
  Chart,
  Axis,
  Tooltip,
  Line,
} from "bizcharts";

export default function (props) {
  const { y = 'value', data, textMap, commonProp, legendProp } = props;
  // const commonChartProp = commonProp?.chart || {
  //   forceFit: true,
  //   height: 450,
  //   padding: [
  //     20, 80, 100, 80
  //   ],
  // };


  return (<div className="fund-line-chart">
    <Chart scale={{
      date: {
        type: 'timeCat',
        range: [0, 1],
      },
      value: {
        type: "linear",
        formatter: val => {
          return val + "%";
        },
        tickCount: 6,
        nice: true,
        lineDash: 2,
      }
    }} padding={[30, 20, 60, 40]} autoFit height={320} width={700} data={data}>
      <Line
        shape="smooth"
        position="date*value"
        color={['name', [
          '#1890ff', '#91d5ff', '#faad14', '#a0d911', '#fa8c16', '#13c2c2', '#722ed1', '#eb2f96', '#bfbfbf', '#fadb14'
        ]]}
        size="2"
      />
      <Axis name={y} grid={{
        line: {
          style: {
            lineDash: [2, 2],
          }
        }
      }} />
      <Tooltip
        showCrosshairs={true}
        shared={true}
        crosshairs={{
          type: "x",
        }} />
    </Chart>
  </div>)
}
