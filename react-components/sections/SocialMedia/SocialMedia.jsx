// react-components/sections/SocialMedia/SocialMedia.jsx

const SocialMedia = () => {
  return (
    <section className="relative z-10 py-8 px-4 bg-[#202a20] text-white text-center">
      <div className="max-w-[900px] mx-auto ">
        <h3 className="text-xl md:text-2xl mb-4 text-[#23ff91] font-semibold">
          Connect With Us!
        </h3>
        <div className="flex justify-center gap-6 flex-wrap">
          {/* YouTube */}
          {/* <a
            href="https://www.youtube.com/@mztwarriors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transform transition-transform duration-200 ease-in-out hover:-translate-y-1 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
              width="50"
              height="50"
              fill="#FF0000"
              className="transition-all hover:brightness-0 hover:invert"
            >
              <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
            </svg>
          </a> */}
          {/* Instagram */}
          {/* <a
              href="https://www.instagram.com/mztwarriors/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transform transition-transform duration-200 ease-in-out hover:-translate-y-1 cursor-pointer"
            >
              <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              width="50"
              height="50"
              fill="#E1306C"
              className="transition-all hover:brightness-0 hover:invert"
            >
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
            </svg>
          </a> */}
          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@mztwarriors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transform transition-transform duration-200 ease-in-out hover:-translate-y-1 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              width="50"
              height="50"
              fill="#000000"
              className="transition-all hover:brightness-0 hover:invert"
            >
              <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
            </svg>
          </a>
          {/* Twitter (X) */}
          <a
            href="https://x.com/mztwarriors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transform transition-transform duration-200 ease-in-out hover:-translate-y-1 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              width="48"
              height="48"
              fill="#000000"
              className="transition-all hover:brightness-0 hover:invert"
            >
              <path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z"/>
            </svg>
          </a>
          {/* Discord */}
          <a
            href="https://discord.gg/3uXnWZEfgR"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transform transition-transform duration-200 ease-in-out hover:-translate-y-1 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
              width="50"
              height="50"
              fill="#5865F2"
              className="transition-all hover:brightness-0 hover:invert"
            >
              <path d="M524.5 69.8a1.5 1.5 0 0 0-.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0-1.9.9 337.5 337.5 0 0 0-14.9 30.6 447.8 447.8 0 0 0-134.4 0 309.5 309.5 0 0 0-15.1-30.6 1.9 1.9 0 0 0-1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0-.8.7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0-1-2.6 321.2 321.2 0 0 1-45.9-21.9 1.9 1.9 0 0 1-.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9.2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1-.2 3.1 301.4 301.4 0 0 1-45.9 21.8 1.9 1.9 0 0 0-1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1.7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2s23.6-59.2 52.8-59.2c29.7 0 53.3 26.8 52.8 59.2-.1 32.6-23.5 59.2-52.8 59.2zm195.4 0c-29 0-52.8-26.6-52.8-59.2s23.6-59.2 52.8-59.2c29.7 0 53.3 26.8 52.8 59.2-.1 32.6-23.5 59.2-52.8 59.2z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;
