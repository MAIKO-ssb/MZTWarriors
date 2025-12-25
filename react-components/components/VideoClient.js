'use client'; // Ensures client-only if using mixed routers

export default function VideoPlayer({ src, poster, className }) {
  return (
    <video
      className={className}
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}