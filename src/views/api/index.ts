import { get, post } from '@/api/api-service';
import type {
  BetRateVO, BetReq, BetResult, ChatHistoryResp, GetMatchInfoResp,
  GetRacingCarConfigResp, GetRacingHistoryResp, GetStatisticsResp,
  MyBetsRequest, PageResult, RacingBetHistoryVO, RacingHistoryRequest,
  StartMatchResp,
} from './protocol';
import {
  RACING_BET_URL, RACING_CAR_INFO_URL, RACING_CONFIG_URL,
  RACING_COUNTDOWN_URL, RACING_HISTORY_URL, RACING_MY_BETS_URL,
  RACING_RECORD_URL, RACING_START_URL,
} from './protocol';

const BET_TYPE_IDS: Record<string, number> = {
  Champion: 6, 'Odd/Even': 7, 'Big/Small': 8, 'Top 3': 9, 'Guess Three': 10,
};

export async function fetchRacingConfig(): Promise<GetRacingCarConfigResp> {
  const config = await get<Omit<GetRacingCarConfigResp, 'betRates'> & { betRates: BetRateVO[] }>(RACING_CONFIG_URL);
  return {
    ...config,
    betRates: config.betRates.map((item) => ({ ...item, betTypeId: BET_TYPE_IDS[item.betType] })),
  };
}

export const fetchMatchInfo = () => get<GetMatchInfoResp[]>(RACING_RECORD_URL);
export const fetchStartGame = (racingId: number) => get<StartMatchResp, { racingId: number }>(RACING_START_URL, { racingId });
export const fetchStartCarGame = (racingId: number) => get<StartMatchResp, { racingId: number }>(RACING_COUNTDOWN_URL, { racingId });
export const fetchBetting = (params: BetReq) => post<BetResult, BetReq>(RACING_BET_URL, params);

export function fetchHistoryRacing(carNumbers: number[] = [], pageNum = 1, pageSize = 20) {
  const body: RacingHistoryRequest = { pageNum, pageSize };
  if (carNumbers.length) body.carNumbers = carNumbers;
  return post<GetRacingHistoryResp, RacingHistoryRequest>(RACING_HISTORY_URL, body);
}

export const fetchStatistics = () => get<GetStatisticsResp[]>(RACING_CAR_INFO_URL);
export const fetchMyBets = (params: MyBetsRequest = {}) =>
  get<PageResult<RacingBetHistoryVO>, MyBetsRequest>(RACING_MY_BETS_URL, { pageNum: 1, pageSize: 10, ...params });

// Optional legacy chat endpoints retained because the current game screen still contains chat UI.
export const fetchChatHistory = (racingId: number) => get<ChatHistoryResp[], { racingId: number }>('/chat/v1/getChatHistory', { racingId });
export const sendChatMsg = (racingId: number, userId: number, message: string) =>
  post<void, { racingId: number; userId: number; message: string }>('/chat/v1/send', { racingId, userId, message });
