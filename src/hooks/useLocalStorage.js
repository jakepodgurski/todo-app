import { useState, useEffect } from 'react';

/**
 * A custom hook to synchronize state with localStorage.
 * @param {string} key The key to use for localStorage.
 * @param {any} initialValue The initial value to use if nothing is in localStorage.
 * @returns {[any, (value: any) => void]} A stateful value and a function to update it.
 */
function useLocalStorage(key, initialValue) {
  // State to store our value
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // useEffect to update localStorage whenever the value changes, with a debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(error);
      }
    }, 500); // Wait for 500ms of inactivity before saving

    // This cleanup function will clear the timer if the value or key changes again
    // before the timeout has completed.
    return () => clearTimeout(timer);

  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;