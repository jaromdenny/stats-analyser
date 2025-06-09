import ReactECharts from 'echarts-for-react';
import { CandleData } from '@/types/crypto';

interface PriceChartProps {
  data: CandleData[];
}

function calculateMA(dayCount: number, data: number[][]) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < dayCount - 1) {
      result.push([data[i][0], '-']); // Include date with empty value
      continue;
    }
    let sum = 0;
    for (let j = 0; j < dayCount; j++) {
      sum += data[i - j][1];
    }
    result.push([data[i][0], +(sum / dayCount).toFixed(2)]); // Include date with MA value
  }
  return result;
}

export function PriceChart({ data }: PriceChartProps) {
  const chartData = data.map(d => [
    new Date(d.openTime).getTime(),
    parseFloat(d.open),
    parseFloat(d.close),
    parseFloat(d.low),
    parseFloat(d.high)
  ]);

  const ma5 = calculateMA(5, chartData);
  const ma10 = calculateMA(10, chartData);
  const ma20 = calculateMA(20, chartData);
  const ma30 = calculateMA(30, chartData);

  const option = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        const data = params[0].data;
        let result = `
          <div>Date: ${new Date(data[0]).toLocaleString()}</div>
          <div>Open: ${data[1]}</div>
          <div>Close: ${data[2]}</div>
          <div>Low: ${data[3]}</div>
          <div>High: ${data[4]}</div>
        `;
        
        // Add MA values to tooltip
        params.forEach((param: any) => {
          if (param.seriesName !== 'Price') {
            result += `<div>${param.seriesName}: ${param.value[1]}</div>`;
          }
        });
        
        return result;
      }
    },
    axisPointer: {
      link: { xAxisIndex: 'all' },
      label: {
        backgroundColor: '#777'
      }
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: false
        },
        restore: {},
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        bottom: 10
      }
    ],
    xAxis: {
      type: 'time',
      scale: true,
      boundaryGap: true,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax',
      axisLabel: {
        formatter: (value: number) => {
          const date = new Date(value);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true
      }
    },
    series: [
      {
        name: 'Price',
        type: 'candlestick',
        data: chartData,
        itemStyle: {
          color: '#ef5350',
          color0: '#26a69a',
          borderColor: '#ef5350',
          borderColor0: '#26a69a'
        },
        barWidth: '80%'
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA30',
        type: 'line',
        data: ma30,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.5
        }
      }
    ]
  };

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
} 