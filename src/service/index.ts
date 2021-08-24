import fetchJsonp from 'fetch-jsonp';
import axios from 'axios';

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

export const getFundInfo = async (code: number): Promise<any> => {
  return new Promise((resolve) => {
    Promise.all([getValueInfo(code), getFundDetail(code)])
    .then(async ([value, detail]) => {
      const stocks = detail.JJCC.Datas.InverstPosition.fundStocks;
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
export const getValueInfo = async (code: number): Promise<any> => {
  const path = `https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=13&appType=ttjj&product=EFund&plat=Android&deviceid=6ed83de02a321t185jqqoja&Version=1&Fcodes=${code}`;
  return axios.get(path)
    .then(({ data }) => {
      console.log(data?.Datas[0]);
      return data?.Datas[0];
    })
}

// 详情信息
export const getFundDetail = async (code: number) => {
  const path = `https://j5.dfcfw.com/sc/tfs/qt/v2.0.1/${code}.json`;
  return axios.get(path)
    .then(({ data }) => {
      return data;
    })
}


