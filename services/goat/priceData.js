import {
  fetchResults,
  fetchLowestAsks,
  fetchHighestBids,
} from "./utilities/fetchData.js";
import { currencies } from "../../utilities/settings.js";
import { formatPrice } from "../../utilities/helpers.js";

export default class GoatPrice {
  fees = 12.4;

  searchLowestAsk(lowestAsks, size) {
    let l = 0;
    let r = lowestAsks.length - 1;
    let m;

    function isMatchingSize(sizeInfo) {
      return sizeInfo.sizeOption.value === size;
    }

    function isNewAndInStock(sizeInfo) {
      return (
        sizeInfo.shoeCondition === "new_no_defects" &&
        sizeInfo.boxCondition === "good_condition" &&
        sizeInfo.stockStatus === "single_in_stock"
      );
    }

    while (l <= r) {
      m = Math.floor((l + r) / 2);

      if (isMatchingSize(lowestAsks[m])) {
        if (isNewAndInStock(lowestAsks[m]))
          return lowestAsks[m].lowestPriceCents.amount / 100;

        let i = m - 1;

        while (isMatchingSize(lowestAsks[i])) {
          if (isNewAndInStock(lowestAsks[i]))
            return lowestAsks[i].lowestPriceCents.amount / 100;
          --i;
        }

        i = m + 1;

        while (isMatchingSize(lowestAsks[i])) {
          if (isNewAndInStock(lowestAsks[i]))
            return lowestAsks[i].lowestPriceCents.amount / 100;
          ++i;
        }

        return null;
      }

      lowestAsks[m].sizeOption.value > size ? (r = m - 1) : (l = m + 1);
    }

    return null;
  }

  searchHighestBid(highestBids, size) {
    let l = 0;
    let r = highestBids.length - 1;
    let m;

    while (l <= r) {
      m = Math.floor((l + r) / 2);

      if (highestBids[m].size === size)
        return highestBids[m].offerAmountCents.amount / 100;

      highestBids[m].size > size ? (r = m - 1) : (l = m + 1);
    }

    return null;
  }

  async getPrices(sku, size, country) {
    try {
      let lowestAsk, highestBid, payout;

      const searchResult = await fetchResults(sku);
      const matchedTerm = searchResult[0]?.matched_terms
        .join("-")
        .toUpperCase();

      if (sku === matchedTerm) {
        const productTemplateId = searchResult[0].data.id;
        const currency = currencies[country];

        const [lowestAsks, highestBids] = await Promise.allSettled([
          fetchLowestAsks(productTemplateId, country, currency),
          fetchHighestBids(productTemplateId, country, currency),
        ]);

        if (lowestAsks.status === "fulfilled" && lowestAsks.value.length) {
          const lowestAskValue = this.searchLowestAsk(lowestAsks.value, +size);
          if (lowestAskValue) lowestAsk = lowestAskValue;
        }

        if (highestBids.status === "fulfilled" && highestBids.value.length) {
          const highestBidValue = this.searchHighestBid(
            highestBids.value,
            +size
          );
          if (highestBidValue) highestBid = highestBidValue;
        }

        if (lowestAsk) payout = lowestAsk * ((100 - this.fees) / 100);
      }

      return {
        marketplace: "Goat",
        size,
        lowestAsk: formatPrice(lowestAsk, country),
        highestBid: formatPrice(highestBid, country),
        fees: `${this.fees}%`,
        payout: formatPrice(payout, country),
      };
    } catch (error) {
      // Log to vercel
      throw Error(error.message);
    }
  }
}
