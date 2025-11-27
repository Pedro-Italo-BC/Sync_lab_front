'use client'
import { useEffect, useRef, useState } from "react"
import { CarouselSlider } from "./CarouselSlider/CarouselSlider"
import img1 from '../../../assets/1.png'
import img2 from '../../../assets/2.png'

type CarouselProps = {
  size?: "full" | "normal"
}

const images = [
  img1.src,
  img2.src,
]

export function Carousel({ size = "full" }: CarouselProps) {
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, 6000)
  }

  const next = () => {
    setIndex((i) => (i + 1) % images.length)
    startAutoSlide()
  }

  const prev = () => {
    setIndex((i) => (i - 1 + images.length) % images.length)
    startAutoSlide()
  }

  useEffect(() => {
    startAutoSlide()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div
      className={`relative h-80 rounded-lg overflow-hidden ${
        size === "full" ? "w-full" : "w-3xl"
      } bg-[var(--blue-50)] mb-10`}
    >
      <img
        src={images[index]}
        alt={`Slide ${index + 1}`}
        className="object-cover w-full h-full transition-all duration-700"
      />

      {/* Botões de navegação */}
      <button
        onClick={prev}
        className="hover:brightness-90 duration-300 transition bg-[var(--blue-100)] rounded-lg absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer text-white px-2 py-1 "
      >
        ❮
      </button>
      <button
        onClick={next}
        className="hover:brightness-90 duration-300 transition bg-[var(--blue-100)] rounded-lg absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-white px-2 py-1 "
      >
        ❯
      </button>

      {/* Indicadores */}
      <CarouselSlider
        setCurrentIndex={(i) => {
          setIndex(i)
          startAutoSlide()
        }}
        items={images.length}
        currentIndex={index}
      />
    </div>
  )
}
