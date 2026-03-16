import { onBeforeUnmount, onMounted, ref } from 'vue';
import { sha256 } from './utils'
type Update = () => void

type Type = 'version' | 'html'

interface Options {
  interval?: number
  type?: Type
  enabled?: Boolean
  immediate?: Boolean
}

export const useCheckUpdate = (notifyUpdateFn: Update, options?: Options ) => {
  const { interval = 1000 * 60 * 5, type = 'version', enabled = true, immediate = true } = options || {}
  const latestVersion = ref('');
  const newVersion = ref('')
  // 是否在检测中防抖
  const isChecking = ref(false);
  // 是否已通知
  const hasNotified = ref(false);
  const timer = ref<NodeJS.Timeout | string | number | undefined>();
  const leftTime = ref(0)

  const onUpdate = () => {
    location.reload();
  }
  
  const onCancel = () => {
    sessionStorage.setItem('skipVersion', newVersion.value);
  }

  const getHashByType = async (type: Type) => {
    let version = ''
    if (type === 'html') {
      const res = await fetch('/', { cache: 'no-cache' });
      const data = await res.text();
      const hash = await sha256(data)
      version = hash
    } else {
      const res = await fetch('/version.json?_=' + Date.now(), { cache: 'no-cache' });
      const { hash } = await res.json();
      version = hash
    }
    return version
  }

  const checkVersion = async () => {
    if (isChecking.value || hasNotified.value) return;
    // 5s防抖
    if (new Date().getTime() - leftTime.value < 1000 * 5) return

    isChecking.value = true;
    leftTime.value = new Date().getTime()

    try {
      const version = await getHashByType(type)

      if (!latestVersion.value) {
        latestVersion.value = version;
        return;
      }

      if (latestVersion.value !== version) {
        if (sessionStorage.getItem('skipVersion') === version) {
          return;
        }

        hasNotified.value = true;

        if (timer.value) {
          clearInterval(timer.value);
          timer.value = undefined;
        }

        newVersion.value = version
        notifyUpdateFn()
      }
    } catch (error) {
    } finally {
      isChecking.value = false;
    }
  };

  // 页面重返前台时
  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      checkVersion();
      startInterVal();
    }
  };
  
  // 网络重连时
  const onOnline = () => {
    checkVersion();
    startInterVal();
  };

  const cleanInterval = () => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = undefined;
    }
  };

  const startInterVal = () => {
    cleanInterval();
    timer.value = setInterval(() => {
      checkVersion();
    }, interval);
  };

  onMounted(() => {
    if (!enabled) return

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    startInterVal();

    if (immediate) {
      setTimeout(checkVersion, 0);
    }
  });

  onBeforeUnmount(() => {
    if (!enabled) return

    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('online', onOnline);
    cleanInterval();
  });

  return { onUpdate, onCancel }
}