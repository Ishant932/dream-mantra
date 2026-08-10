import { useCallback, useEffect, useRef, useState } from 'react';
import { userApi } from '../api';

const DISMISS_MS = 3500;

export function useFlashNotice(token, onNotifRefresh) {
  const [notice, setNoticeState] = useState('');
  const timerRef = useRef(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNoticeState('');
  }, []);

  const flash = useCallback((message, { persist = false } = {}) => {
    if (!message) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setNoticeState(message);
    if (token && !persist) {
      userApi.logActivity(token, { title: 'Activity', body: message }).catch(() => {});
      onNotifRefresh?.();
    }
    if (!persist) {
      timerRef.current = setTimeout(() => setNoticeState(''), DISMISS_MS);
    }
  }, [token, onNotifRefresh]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { notice, flash, clear, setNotice: flash };
}
