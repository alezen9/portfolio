export const createInterval = (cb: VoidFunction, ms: number) => {
  let interval = setInterval(cb, ms);

  const reset = () => {
    clearInterval(interval);
    interval = setInterval(cb, ms);
  };

  const clear = () => clearInterval(interval);

  return { reset, clear };
};
