const applyBlinkAnimation = (gsap: GSAP, content: Element) => {
  const slide = content.parentElement;
  const blur = content.computedStyleMap().get("--blur")?.toString() || "0px";
  const contrast =
    content.computedStyleMap().get("--contrast")?.toString() || "1";

  gsap.fromTo(
    content,
    {
      filter: `blur(${blur}) contrast(${contrast})`,
      autoAlpha: 0,
    },
    {
      filter: "blur(0px) contrast(1)",
      autoAlpha: 1,
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: slide,
        start: "top bottom",
        end: "center center",
        scrub: true,
      },
    },
  );

  gsap.fromTo(
    content,
    {
      filter: "blur(0px) contrast(1)",
      autoAlpha: 1,
    },
    {
      filter: `blur(${blur}) contrast(${contrast})`,
      autoAlpha: 0,
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: slide,
        start: "center center",
        end: "bottom top",
        scrub: true,
      },
    },
  );
};

const applyBackwardsScrollAnimation = (gsap: GSAP, content: Element) => {
  const slide = content.parentElement;

  gsap.fromTo(
    content,
    {
      translateY: "-100%",
      autoAlpha: 0,
      // "content-visibility": "hidden",
    },
    {
      translateY: 0,
      autoAlpha: 1,
      // "content-visibility": "visible",
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: slide,
        start: "top bottom",
        end: "center center",
        scrub: true,
      },
    },
  );

  gsap.fromTo(
    content,
    {
      translateY: 0,
      autoAlpha: 1,
      // "content-visibility": "visible",
    },
    {
      translateY: "100%",
      autoAlpha: 0,
      // "content-visibility": "hidden",
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: slide,
        start: "center center",
        end: "bottom top",
        scrub: true,
      },
    },
  );
};

const loadGsap = async () => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const gallery = document.querySelector(".gallery");
  const animation = gallery?.classList
    .toString()
    .match(/(\w+)-scroll-transition/)
    ?.at(1);

  console.log(animation);
  const contents = document.querySelectorAll(".slide .content");
  contents.forEach((content) => {
    if (animation === "blink") applyBlinkAnimation(gsap, content);
    else if (animation == "backwards")
      applyBackwardsScrollAnimation(gsap, content);
  });
};

const mount = () => {
  const isGsapNeeded = !CSS.supports("animation-timeline", "scroll()");
  if (!isGsapNeeded) return;
  loadGsap();

  return () => {
    ScrollTrigger?.getAll().forEach((st) => st.kill());
    gsap?.globalTimeline.clear();
  };
};

export default mount;
