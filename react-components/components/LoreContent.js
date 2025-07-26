import React from 'react';

// Main App component for the Manzanita Tribe Warriors Lore section
export default function LoreContent() {
  return (
    <div className="lore-container">
      {/* Embedded CSS for styling */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap');

          .lore-container {
            position:relative;
            z-index:222;
            min-height: 100vh;
            background: linear-gradient(to bottom right, #14532d, #0d301b); /* from-green-800 to-green-950 */
            color: #fff;
            font-family: 'Inter', sans-serif;
            padding: 1rem; /* p-4 */
            display: flex;
            align-items: center;
            justify-content: center;
            // background-image: url("/img/forest-bg-pattern2.png");
            background: none; 
          }

          .lore-content-wrapper {
            max-width: 64rem; /* max-w-4xl */
            margin-left: auto;
            margin-right: auto;
            background-color: rgba(20, 83, 45, 0.8); /* bg-green-900 bg-opacity-80 */
            border-radius: 1rem; /* rounded-2xl */
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
            padding: 1.5rem 2.5rem; /* p-6 sm:p-10 (default to p-6, add media query for sm:p-10) */
            border: 1px solid #166534; /* border border-green-700 */
            background-image: url("/img/forest-bg-pattern2.png");
          }

          .section-title {
            font-size: 2.25rem; /* text-4xl */
            font-weight: 800; /* font-extrabold */
            text-align: center;
            color: #fcd34d; /* text-yellow-300 */
            margin-bottom: 2rem; /* mb-8 */
            line-height: 1.25; /* leading-tight */
          }

          .welcome-message {
            font-size: 1.125rem; /* text-lg */
            text-align: center;
            margin-bottom: 3rem; /* mb-12 */
            font-style: italic;
            color: #bbf7d0; /* text-green-200 */
          }

          .section-heading {
            font-size: 1.875rem; /* text-3xl */
            font-weight: 700; /* font-bold */
            color: #fde047; /* text-yellow-200 */
            margin-bottom: 1.5rem; /* mb-6 */
            border-bottom: 2px solid #eab308; /* border-b-2 border-yellow-500 */
            padding-bottom: 0.5rem; /* pb-2 */
          }

          .section-paragraph {
            font-size: 1rem; /* text-base */
            margin-bottom: 1rem; /* mb-4 */
            line-height: 1.625; /* leading-relaxed */
          }

          .section-paragraph:last-of-type {
            margin-bottom: 0;
          }

          .highlight-text {
            color: #fef08a; /* text-yellow-100 */
          }

          .call-to-action {
            font-size: 1.125rem; /* text-lg */
            text-align: center;
            font-style: italic;
            color: #fcd34d; /* text-yellow-300 */
            margin-top: 3rem; /* mt-12 */
          }

          /* Responsive adjustments for small screens (sm: breakpoint) */
          @media (min-width: 640px) {
            .lore-container {
              padding: 2rem; /* sm:p-8 */
            }
            .lore-content-wrapper {
              padding: 2.5rem; /* sm:p-10 */
            }
            .section-title {
              font-size: 3rem; /* sm:text-5xl */
            }
            .welcome-message {
              font-size: 1.25rem; /* sm:text-xl */
            }
            .section-heading {
              font-size: 2.25rem; /* sm:text-4xl */
            }
            .section-paragraph {
              font-size: 1.125rem; /* sm:text-lg */
            }
            .call-to-action {
              font-size: 1.25rem; /* sm:text-xl */
            }
          }
        `}
      </style>

      <div className="lore-content-wrapper">
        {/* Section Title */}
        <h1 className="section-title">
          Manzanita Tribe Warriors
        </h1>

        {/* Welcome Message */}
        <p className="welcome-message">
          Welcome, adventurer, to the heart of the Manzanita Forest. Here, the ancient trees whisper tales of bravery, danger, and untold riches.
        </p>

        {/* The Manzanita Tribe Section */}
        <section className="mb-12">
          <h2 className="section-heading">
            The Manzanita Tribe
          </h2>
          <p className="section-paragraph">
            Set in a lush, mysterious forest realm, <strong className="highlight-text">Manzanita Tribe Warriors</strong> follows the journey of brave Manzanitas — Spanish for “little apples” — who protect and provide for their tribal village. These resilient beings, small in stature but mighty in spirit, have long lived in harmony with the forest, drawing strength from its ancient essence and defending its delicate balance.
          </p>
          <p className="section-paragraph">
            Their village, nestled deep within the verdant canopy, is a sanctuary of peace and community. Here, young Manzanitas learn the ways of the forest—honing their skills in combat and survival, absorbing the wisdom of their elders, and embracing the sacred duty of a Manzanita Tribe Warrior.
          </p>
        </section>

        {/* The Untamed Depths and Dangers Section (Combined) */}
        <section className="mb-12">
          <h2 className="section-heading" style={{marginTop: "1em"}}>
            The Untamed Depths of the Forest: Dangers and Rewards
          </h2>
          <p className="section-paragraph">
            But only the boldest dare venture into the untamed depths of the Manzanita Forest. Beyond the familiar paths and sun-dappled clearings lies a realm shrouded in shadow and mystery. Here, the air hangs heavy with ancient secrets, and every rustle of leaves could signify either a hidden treasure or a lurking threat.
          </p>
          <p className="section-paragraph">
            In these perilous lands, fearsome creatures lurk, their eyes glowing in the gloom, guarding territories untouched by the Manzanita Tribe. Hidden dungeons await, labyrinthine passages filled with traps, puzzles, and the echoes of forgotten civilizations... and ancient loot whispers only to those brave enough to seek it — artifacts of immense power, shimmering with forgotten magic, waiting to be claimed by true heroes.
          </p>
        </section>

        {/* Call to Action */}
        <p className="call-to-action">
          Are you ready to answer to your tribal calling? To face the darkness, overcome the challenges, and emerge victorious as a legend in the Manzanita Forest? <br/><br/>[ Project in Development... ]
        </p>
      </div>
    </div>
  );
};

