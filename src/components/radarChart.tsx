import React from 'react';
import {
  Chart,
  Coordinate,
  Line,
  Tooltip,
} from "bizcharts";

export default function (props) {
  const { data, formatter } = props;

  return (<div className="fund-radar-chart">
    <Chart
    height={320}
    data={data}
    autoFit
    scale={{
      value:{
        nice: true,
      }
    }}
   >
    <Tooltip useHtml>
      {(title, items: any) => formatter(title, items[0]?.value, items[0]?.data || {})}
    </Tooltip>
    <Coordinate type="polar" radius={0.8} />
    <Line
      position="name*value"
      size="2"
    />
   </Chart>
  </div>)
}
