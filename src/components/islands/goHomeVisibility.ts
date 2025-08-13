/*

    1. Direct landing:
    1.a Chrome -> referrer = current url
    1.b Safari -> referrer = ""
    1.c Firefox -> referrer = <empty string>

 */

const getClassToShow = () => {
  const show = "show";
  const hide = "hide";
  if (!document.referrer) return show;
  if (document.referrer === location.href) return show;

  const prevUrl = new URL(document.referrer);
  const currentUrl = new URL(location.href);

  if (prevUrl.origin !== currentUrl.origin) return show;

  return hide;
};

const mount = () => {
  const a = document.querySelector("a.go-home");
  const cls = getClassToShow();
  a?.classList.add(cls);
};

export default mount;
