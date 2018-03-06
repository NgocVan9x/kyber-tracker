import _ from 'lodash';
import BaseRequest from '../foundation/BaseRequest';

class AppRequest extends BaseRequest {

  getTrades (page=0, limit=10, type='cursor') {
    const url = `/api/trades`;
    return this.get(url, {
      p_type: type,
      p_limit: limit,
      p_offset: page * limit
    });
  }

  getTradeDetails (id, params={}) {
    const url = `/api/trades/${id}`;
    return this.get(url, {});
  }

  getStats24h () {
    const url = `/api/stats24h`;
    return this.get(url, {});
  }

  getTopTokens (params={}) {
    const url = `/api/tokens/top`;
    return this.get(url, params);
  }

}

const instance = new AppRequest();
export default instance;