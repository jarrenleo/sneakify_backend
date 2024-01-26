import { StockxClient } from "stockx-scraper";

export default class StockXPrice {
  fees = 12;
  currencyCode = {
    SG: "SGD",
    MY: "USD",
    JP: "JPY",
    GB: "GBP",
    NL: "EUR",
    AU: "AUD",
    CA: "CAD",
    US: "USD",
  };
  locales = {
    SG: "en-SG",
    MY: "en-MY",
    JP: "ja-JP",
    GB: "en-GB",
    NL: "nl-NL",
    AU: "en-AU",
    CA: "en-CA",
    US: "en-US",
  };

  getSizeInfo(sizesInfo, size) {
    let l = 0;
    let r = sizesInfo.length - 1;

    while (l <= r) {
      const m = Math.floor((l + r) / 2);

      if (sizesInfo[m].sizeUS === size) return sizesInfo[m];

      +sizesInfo[m].sizeUS > +size ? (r = m - 1) : (l = m + 1);
    }

    return null;
  }

  formatPrice(price, country) {
    const locale = this.locales[country];
    const currencyCode = this.currencyCode[country];

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  async getPrices(sku, size, country) {
    const client = new StockxClient({
      currencyCode: this.currencyCode[country],
      countryCode: country,
    });
    const result = await client.search({
      query: sku,
    });

    const data = result[0];
    await data.fetch();

    let lowestAsk = "-",
      highestBid = "-",
      payout = "-";

    if (sku === data.sku) {
      const sizeInfo = this.getSizeInfo(data.sizes, size);

      if (sizeInfo) {
        lowestAsk = this.formatPrice(sizeInfo.lowestAsk, country);
        highestBid = this.formatPrice(sizeInfo.highestBid, country);
        payout = this.formatPrice(
          sizeInfo.lowestAsk * ((100 - this.fees) / 100),
          country
        );
      }
    }

    return {
      marketplace: "StockX",
      size,
      lowestAsk,
      highestBid,
      fees: `${this.fees}%`,
      payout,
    };
  }
}
