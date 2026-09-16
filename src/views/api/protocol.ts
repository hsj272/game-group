export interface Result<T = unknown> {
  code: number;
  msg: string;
  data?: T;
  timestamp: number;
}

export interface PageResult<T> {
  pageNum: number;
  pageSize: number;
  total: number;
  totalPage: number;
  data: T[];
}

export type RacingStatus = 1 | 2 | 3;
export type PaymentType = 1 | 2;
export type BetTypeKey = 'Champion' | 'Odd/Even' | 'Big/Small' | 'Top 3' | 'Guess Three';

export interface BetRateVO {
  betType: BetTypeKey;
  betRate: number;
}

// Compatibility fields keep the existing betting UI simple.
export interface betRatesItem extends BetRateVO {
  betTypeId: number;
}

export interface RacingConfigVO {
  betRates: BetRateVO[];
  betAmountConfig: number[];
  racingTime: number;
  restTime: number;
  serverTime: number;
}

export interface GetRacingCarConfigResp extends Omit<RacingConfigVO, 'betRates'> {
  betRates: betRatesItem[];
}

export interface JoinRacingDTO {
  racingId: number;
  betType: BetTypeKey;
  betAmount: number;
  carNumbers: number[];
  paymentType?: PaymentType;
}

export type BetReq = JoinRacingDTO;
export interface BetResult { betId: number; }

export interface RacingCarRankingVO {
  rankings: number[];
  distancesRatio: number[][];
}

export interface RacingVO {
  racingId: number;
  nextRacingId: number;
  blockNumber?: string;
  lastBlockNumber?: string;
  hash?: string;
  startTime?: string;
  endTime?: string;
  remainingMillis?: number;
  status: RacingStatus;
  racingCarRanking?: RacingCarRankingVO | null;
}

export type StartMatchResp = RacingVO;
export interface StartRacingReq { racingId: number; }

export interface RacingRecordVO {
  racingId: number;
  startTime: string;
  endTime: string;
  status: RacingStatus;
}
export type GetMatchInfoResp = RacingRecordVO;

export interface RacingHistoryRequest {
  pageNum?: number;
  pageSize?: number;
  carNumbers?: number[];
}

export interface RacingHistoryVO {
  id: number;
  ranking: number[];
  startTime: string;
  endTime: string;
}
export type GetRacingHistoryRespItem = RacingHistoryVO;
export type GetRacingHistoryResp = PageResult<RacingHistoryVO>;

export interface RacingCarInfo {
  id: number;
  firstPlaceCount: number;
  secondPlaceCount: number;
  thirdPlaceCount: number;
}
export type GetStatisticsResp = RacingCarInfo;

export interface RacingBetHistoryVO {
  id: number;
  racingId: number;
  betType: BetTypeKey;
  betAmount: number | string;
  winAmount: number | string;
  betRate: number;
  carNumbers: number[];
  paymentType: PaymentType;
  settled: 0 | 1;
  createTime: string;
}

export interface MyBetsRequest { pageNum?: number; pageSize?: number; }

export type WsMessageType = 3 | 4 | 5 | 6 | 99 | 100;
export interface WsMessage<T = unknown> { type: WsMessageType; data: T; }
export interface WinnerRewardPayload { userId: number; racingId: number; reward: number; }
export interface RacingResultPayload { racingId: number; ranking: string; }

export const RACING_CONFIG_URL = '/racing/v1/config';
export const RACING_BET_URL = '/racing/v1/bet';
export const RACING_START_URL = '/racing/v1/start';
export const RACING_COUNTDOWN_URL = '/racing/v1/countdown';
export const RACING_RECORD_URL = '/racing/v1/record';
export const RACING_HISTORY_URL = '/racing/v1/history';
export const RACING_CAR_INFO_URL = '/racing/v1/car-info';
export const RACING_MY_BETS_URL = '/racing/v1/my-bets';

// Chat is not part of the racing v1 document; these types remain for the existing optional UI.
export interface ChatHistoryResp { userId: number; message: string; sendTime: string; avatar: string; }
