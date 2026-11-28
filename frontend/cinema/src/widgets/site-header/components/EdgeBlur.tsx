export const EdgeBlur = () => (
  <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-40 h-30 bg-linear-to-b from-ink/70 to-transparent">
    <div className="absolute inset-0 backdrop-blur-[3px] [mask-image:linear-gradient(to_bottom,black_45%,transparent_75%)]" />
    <div className="absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black,transparent_35%)]" />
  </div>
);
