interface SoundEntity {
  element: HTMLAudioElement;
  promise: Promise<SoundEntity>;
  success?: boolean;
  loading?: boolean;
}
export interface SoundPlayer {
  audio: HTMLAudioElement;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}
class SoundManager {
  private map: Record<string, SoundEntity> = {};
  private _keepAlives: HTMLAudioElement[] = [];
  /**新增：存储所有 SoundPlayer 对象 */
  private _activePlayers: SoundPlayer[] = [];
  loadResources(urls: string[]) {
    const waitList = urls.filter((url) => !this.map[url] || !this.map[url].success);
    return Promise.all(waitList.map(this.loadSound));
  }
  play(url: string, times = 1, muted = true, volume = 0.5, startAt = 0) {
    return this.loadSound(url).then((entity) => {
      const audio = entity.element;
      audio.pause();
      if (times > 1) {
        audio.loop = true;
      }

      // 控制是否静音
      audio.volume = muted ? 0 : volume;
      audio.currentTime = startAt;

      audio.play();
      this._keepAlives.push(audio);

      const stop = () => {
        const index = this._keepAlives.indexOf(audio);
        if (index >= 0) {
          this._keepAlives.splice(index, 1);
        }
        audio.pause();
      };

      audio.onended = () => {
        times--;
        if (times <= 0) {
          stop();
        }
      };

      const player: SoundPlayer = {
        audio,
        stop,
        pause: () => {
          audio.pause();
        },
        resume() {
          audio.play();
        },
      };

      // 存储 SoundPlayer 对象
      this._activePlayers.push(player);
      return player;
    });
  }
  private loadSound = (url: string) => {
    const loadingPromise = this.map[url];
    if (loadingPromise && loadingPromise.loading) {
      return loadingPromise.promise;
    }
    const audio = new Audio(url);
    const audioContext = new AudioContext();
    if (audioContext) {
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      // 设置音量
      gainNode.gain.value = 0.5;
    }
    audio.volume = 0.5;
    const promise = new Promise<SoundEntity>((resolve) => {
      audio.oncanplay = () => {
        entity.loading = false;
        entity.success = true;
        resolve(entity);
      };
      audio.onerror = () => {
        entity.loading = false;
        resolve(entity);
      };
      if (audio.readyState === 4) {
        resolve(entity);
      }
    });
    const entity: SoundEntity = {
      element: audio,
      promise,
      success: false,
      loading: true,
    };
    this.map[url] = entity;
    return promise;
  };
  /**新增：停止所有音频 */
  stopAll() {
    this._activePlayers.forEach((player) => player.stop());
    this._activePlayers = [];
  }
  /**新增：暂停所有音频 */
  pauseAll() {
    this._activePlayers.forEach((player) => player.pause());
  }
}

export const soundManager = new SoundManager();
