'use client'

type CarouselSliderProps = {
    items: number;
    setCurrentIndex: (index: number) => void;
    currentIndex: number
}

export function CarouselSlider({ items, setCurrentIndex, currentIndex }: CarouselSliderProps) {

  function drawElements() {
    return Array.from({ length: items }).map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentIndex(i)}
        className={` h-1.5 flex-1 rounded-lg cursor-pointer hover:brightness-90 duration-300 transition ${currentIndex === i ? "bg-[var(--blue-100)]" : "bg-[var(--foreground)]"}`}
        id={`carousel-index-${i} `}
      ></button>
    ));
  }

  return (
    <div className="flex gap-2 absolute bottom-2 w-full -translate-y-1/2  text-white px-2 rounded">
      {drawElements()}
    </div>
  );
}