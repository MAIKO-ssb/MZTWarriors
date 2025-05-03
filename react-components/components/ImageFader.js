import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function ImageFader({ images = [], delay = 3000 }) {
  const [index, setIndex] = useState(0)
  const [fadeOutIndex, setFadeOutIndex] = useState(null)

  useEffect(() => {
    const fadeOut = setTimeout(() => setFadeOutIndex(index), delay - 500) // Set which image will fade out
    const nextImage = setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length) // Move to next image
    }, delay) // Transition after the given delay

    return () => {
      clearTimeout(fadeOut)
      clearTimeout(nextImage)
    }
  }, [index, delay, images.length])

  return (
    <div
      style={{
        width: '100vw',
        maxWidth: '520px',
        aspectRatio: '1 / 1',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '1em',
        border: '2px solid #fff',
      }}
    >
      {images.map((src, i) => (
        <div
          key={i}
          style={{
            opacity: i === index || i === fadeOutIndex ? (i === index ? 1 : 0) : 0,
            transition: 'opacity 1s ease-in-out',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Image
            src={src}
            alt={`MZT Preview ${i + 1}`}
            width={520} // Explicit width
            height={520} // Explicit height
            style={{
              objectFit: 'cover',
            }}
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  )
}
