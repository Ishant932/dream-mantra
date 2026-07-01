import { useCallback, useEffect, useState } from 'react';
import { paymentsApi } from '../api';

/** Load vouchers visible to the signed-in user (admin-controlled). Guests get []. */
export function useUserVouchers(token) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(() => {
    if (!token) {
      setVouchers([]);
      return Promise.resolve([]);
    }
    setLoading(true);
    return paymentsApi
      .promotions(token)
      .then((res) => {
        const list = Array.isArray(res.vouchers) ? res.vouchers : [];
        setVouchers(list);
        return list;
      })
      .catch(() => {
        setVouchers([]);
        return [];
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const onFocus = () => reload();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [reload]);

  return { vouchers, loading, reload };
}
