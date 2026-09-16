import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';

dayjs.extend(duration);
dayjs.extend(utc);

export function useCountdown(
  startTime: string,
  onTick: (timeLeft: string) => void,
  onComplete: () => void,
) {
  let interval: ReturnType<typeof setInterval> | null = null;

  const startCountdown = () => {
    const start = dayjs.utc(startTime);
    if (!start.isValid()) {
      throw new Error('Invalid startTime or endTime format.');
    }
    const now = dayjs.utc();
    // 确保倒计时有效
    if (start.isBefore(now)) {
      onComplete();
      return;
    }

    interval = setInterval(() => {
      const now = dayjs.utc();
      const timeLeft = start.diff(now);

      if (timeLeft <= 0) {
        clearInterval(interval as ReturnType<typeof setInterval>);
        onComplete();
        return;
      }

      const duration = dayjs.duration(timeLeft);
      const formattedTime = `${duration.hours().toString().padStart(2, '0')}:${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`;

      onTick(formattedTime);
    }, 1000);
  };

  const stopCountdown = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  return {
    startCountdown,
    stopCountdown,
  };
}
