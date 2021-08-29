import fetchJsonp from 'fetch-jsonp';
import axios from 'axios';
import moment from 'moment';

// 基金对象信息
export interface FundInfo {
  code: string
  name: string
}

// 股票实时净值
export const getStockValue = async (codes: string[]) => {
  const path = 'https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=f2,f3,f12,f14,f9&ut=267f9ad526dbe6b0262ab19316f5a25b&secids=';
  let query = [] as string[];
  codes.forEach((code) => {
    if (Number(code) > 0 && code.length === 6) {
      query.push(String(code).startsWith('6') ? `1.${code}` : `0.${code}`);
    }
  });
  return axios.get(path + query.join(','))
    .then((resp) => {
      return resp.data?.data?.diff || [];
    })
}

// 基金搜索
export const searchFund = async (key: string): Promise<FundInfo[]> => {
  return new Promise((resolve) => {
    const path = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=10&t=700&IsNeedBaseInfo=0&IsNeedZTInfo=0&key=${key}&_=${Date.now()}`

   fetchJsonp(path)
      .then(function(response) {
        return response.json()
      })
      .then((resp: any) => {
        const result = resp.Datas?.map(item => {
          return {
            code: item.CODE,
            name: item.NAME
          }
        }) || [];
        resolve(result);
      })
  })
}

export const getFundInfo = async (code: string): Promise<any> => {
  return new Promise((resolve) => {
    Promise.all([getValueInfo(code), getFundDetail(code)])
    .then(async ([value, detail]) => {
      const stocks = detail?.JJCC?.Datas?.InverstPosition.fundStocks || [];
      const stockValue = await getStockValue(stocks.map(stock => stock.GPDM));
      resolve({
        ...value,
        ...detail,
        key: value.FCODE,
        stockValue,
      });
    })
  })
}

// 基金基本信息 净值估值
export const getValueInfo = async (code: string): Promise<any> => {
  const path = `https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=13&appType=ttjj&product=EFund&plat=Android&deviceid=6ed83de02a321t185jqqoja&Version=1&Fcodes=${code}`;
  return axios.get(path)
    .then(({ data }) => {
      return data?.Datas[0];
    })
}

// 详情信息
export const getFundDetail = async (code: string) => {
  const path = `https://j5.dfcfw.com/sc/tfs/qt/v2.0.1/${code}.json`;
  return axios.get(path)
    .then(({ data }) => {
      return data;
    })
}

// 单支基金收益率数据 基金-同类平均-指数
export const getBenefitData = async (code: string, indexCode: string = '000300', type: string = 'q')  => {
  const path = `https://api.fund.eastmoney.com/pinzhong/LJSYLZS?fundCode=${code}&indexcode=${indexCode}&type=${type}&_=${Date.now()}`;
  return fetchJsonp(path)
      .then(function(response) {
        return response.json()
      })
      .then((resp: any) => {
        const data = resp?.Data?.length ? resp.Data : [];
        return data.reduce((accum, fund) => {
          const name = fund.name;
          return accum.concat(fund.data.map((item) => ({
            name,
            date: moment(item[0]).format('YYYY-MM-DD'),
            value: item[1],
          })));
        }, []);
      })
}

export const getComparedBenefit = async (codes: string[], type: string = 'threeyear') => {
  const path = `https://api.fund.eastmoney.com/FundCompare/LJSYL?bzdm=${codes.join(',')}&c=${type}&_=${Date.now()}`;
  return fetchJsonp(path)
      .then(function(response) {
        return response.json()
      })
      .then((resp: any) => {
        const data = resp?.Data?.length ? resp.Data : [];
        const obj = JSON.parse(data)
        const graph = obj?.graph || [];
        const dataProvider = obj?.dataProvider || [];
        const fundMap = {};
        graph.forEach(fund => {
          fundMap[fund.valueField] = fund.name;
        });
        return dataProvider.reduce((accum, item) => {
          const curData = codes.map((code) => ({
            name: fundMap[code],
            date: item.date,
            value: item[code],
          }));
          return accum.concat(curData);
        }, []);
      })
}


