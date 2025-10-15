import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative z-10 bg-[#00120c] text-white py-10 px-6 border-t border-[#333]">
        <div className="text-center md:text-center">
          <h2 className="text-2xl font-bold text-[#23ff91] mb-2">Manzanita Tribe Warriors</h2>
          <p className="text-gray-400 text-sm mb-2">
            Claim your warriors, join the tribe.
            {/* Explore the forest, claim your warriors, join the tribe. */}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            [ Created by a solo developer, designer &amp; gamer ]
          </p>
        </div>
      {/* <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-[#23ff91] mb-2">Manzanita Tribe Warriors</h2>
          <p className="text-gray-400 text-sm max-w-[300px]">
            Explore the forest, claim your warriors, join the tribe.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-center md:text-left">
          <div>
            <h4 className="font-semibold mb-2 text-[#23ff91]">Quick Links</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="hover:text-[#8dffbf] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/mint" className="hover:text-[#8dffbf] transition-colors">
                  Mint
                </Link>
              </li>
              <li>
                <Link href="/game" className="hover:text-[#8dffbf] transition-colors">
                  Game
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#8dffbf] transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#23ff91]">Community</h4>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://discord.gg/3uXnWZEfgR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#8dffbf] transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/mztwarriors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#8dffbf] transition-colors"
                >
                  X (Twitter)
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@mztwarriors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#8dffbf] transition-colors"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/mztwarriors/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#8dffbf] transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div> */}

      {/* Bottom copyright */}
      <div className="border-t border-[#333] text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Manzanita Tribe Warriors. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
