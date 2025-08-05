const loadGsap = async () => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const contents = document.querySelectorAll(".slide .content");
  contents.forEach((content) => {
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
