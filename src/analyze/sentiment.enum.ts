export enum SentimentLabel {
  NEGATIVE = 'LABEL_0',
  NEUTRAL = 'LABEL_1',
  POSITIVE = 'LABEL_2',
  UNKNOWN = 'UNKNOWN',
}

export const SentimentMap = {
  [SentimentLabel.NEGATIVE]: 'отрицательная',
  [SentimentLabel.NEUTRAL]: 'нейтральная',
  [SentimentLabel.POSITIVE]: 'положительная',
  [SentimentLabel.UNKNOWN]: 'неизвестная',
};
