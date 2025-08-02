import React from 'react';

// Main App component for the Manzanita Tribe Warriors Lore section
export default function LoreContent() {
  return (
    <div className="lore-container">
      {/* Embedded CSS for styling */}
      

      <div className="lore-content-wrapper">
        {/* Section Title */}
        <h1 className="section-title">
          Manzanita Tribe Warriors
        </h1>

        {/* Welcome Message */}
        <p className="welcome-message">
          Welcome, adventurer, to the heart of the Manzanita Forest.<br/> Here, the ancient trees murmur warnings of forgotten paths... lurking threats...<br/> ...and treasures claimed by time.
        </p>

        {/* The Manzanita Tribe Section */}
        <section className="mb-12">
          <h2 className="section-heading">
            The Manzanita Tribe
          </h2>
          <p className="section-paragraph">
            Set in a lush, mysterious forest realm, <strong className="highlight-text">Manzanita Tribe Warriors</strong> follows the journey of brave Manzanitas — Spanish for “little apples” — who protect and provide for their tribal village. These resilient beings, small in stature but mighty in spirit, have long lived in harmony with the Manzanita forest, empowered by sacred ties to the land, they defend the forest's rhythm with fierce devotion.
          </p>
          <p className="section-paragraph">
            Their village lies deep in the heart of the forest — a sanctuary of peace, joy, and community. Here, young Manzanitas learn the ways of the forest: honing their combat and survival skills, absorbing the wisdom of their elders, and embracing the sacred duty of becoming a Manzanita Tribe Warrior.
          </p>
        </section>

        {/* The Untamed Depths and Dangers Section (Combined) */}
        <section className="mb-12">
          <h2 className="section-heading" style={{marginTop: "1em"}}>
            The Untamed Depths of the Manzanita Forest
          </h2>
          <p className="section-paragraph">
            Only the boldest dare venture into the untamed depths of the Manzanita Forest. Beyond the familiar trails and sunlit clearings lies a dark lush forest covered in shadows and mystery. The air hangs thick with ancient secrets, and every rustle of leaves could signal treasure—or trouble.
          </p>
          <p className="section-paragraph">
            Fierce creatures roam these wild forest depths, their eyes glowing in the darkest shadows, guarding places yet to be discovered by the Manzanita Tribe. Hidden throughout the forest lie ancient dungeons — twisting labyrinths carved by time, filled with traps, puzzles, and the echoes of tribes long gone.
          </p>
          <p className="section-paragraph">
            Deep within, powerful treasures lie waiting. Whispers of ancient magic stir beneath the roots, calling to those brave enough to listen—heroes ready to uncover what the forest has guarded for generations.
          </p>
        </section>

        {/* Call to Action */}
        <p className="call-to-action">
          Are you ready to answer to your tribal calling? To face the darkness, overcome the challenges, and emerge victorious as a legend in the Manzanita Forest? <br/><br/>[ Project Currently in Development... ]
        </p>
      </div>
    </div>
  );
};

