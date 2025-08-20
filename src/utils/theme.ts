export const KEY = "color-scheme";

type Theme = {
  colorScheme: "dark" | "light";
  source: "ls" | "system";
};

export type ThemeChangeCallback = (
  preference: Theme["colorScheme"],
  source: Theme["source"],
) => void;

const subscribers = new Set<ThemeChangeCallback>();

const subscribe = (cb: ThemeChangeCallback) => {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
};

const notify = (...args: Parameters<ThemeChangeCallback>) =>
  subscribers.forEach((cb) => cb(...args));

const clean = (v: unknown): Theme["colorScheme"] | null =>
  v === "dark" || v === "light" ? v : null;

const createThemeLsProxy = () => {
  const retrieve = () => clean(window.localStorage.getItem(KEY));

  const save = (preference: Theme["colorScheme"]) => {
    window.localStorage.setItem(KEY, preference);
    notify(preference, "ls");
  };

  return {
    retrieve,
    save,
  };
};

export const init = () => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const systemPreference = mq.matches ? "dark" : "light";
  const value: Theme = {
    colorScheme: systemPreference,
    source: "system",
  };
  const ls = createThemeLsProxy();
  const lsPreference = ls.retrieve();
  if (lsPreference) {
    value.colorScheme = lsPreference;
    value.source = "ls";
  }

  mq.addEventListener("change", (e) => {
    if (ls.retrieve()) return;
    const preference = e.matches ? "dark" : "light";
    notify(preference, "system");
  });

  const toggle = () => {
    const newPreference = value.colorScheme === "dark" ? "light" : "dark";
    ls.save(newPreference);
    value.colorScheme = newPreference;
    value.source = "ls";
  };

  return {
    initialValue: value,
    subscribe,
    toggle,
  };
};
