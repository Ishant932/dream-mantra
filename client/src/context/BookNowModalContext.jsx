import { createContext, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const BookNowModalContext = createContext({ openBookNow: () => {}, closeBookNow: () => {} });

export function useBookNowModal() {
  return useContext(BookNowModalContext);
}

export function BookNowModalProvider({ children }) {
  const navigate = useNavigate();
  const openBookNow = useCallback(() => navigate('/book-now'), [navigate]);
  const closeBookNow = useCallback(() => {}, []);

  return (
    <BookNowModalContext.Provider value={{ openBookNow, closeBookNow }}>
      {children}
    </BookNowModalContext.Provider>
  );
}
