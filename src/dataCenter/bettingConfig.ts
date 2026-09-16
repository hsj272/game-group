import type { GetRacingCarConfigResp, betRatesItem } from '@/views/api/protocol';

class BettingConfig {
  betRatesConfig: betRatesItem[] = [];
  betAmountConfig: number[] = [];

  betRatesConfigMap: Record<number, betRatesItem | undefined> = {};
  networkMap: Record<number, number | undefined> = {};

  update(config: GetRacingCarConfigResp) {
    this.betRatesConfig = config.betRates;
    this.betAmountConfig = config.betAmountConfig;

    this.betRatesConfig.forEach((item) => {
      this.betRatesConfigMap[item.betTypeId] = item;
    });
    this.betAmountConfig.forEach((item) => {
      this.networkMap[item] = item;
    });
  }
}
export const bettingConfig = new BettingConfig();
