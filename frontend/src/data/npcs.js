// 10 gallery visitors — each with a distinct personality and dialogue.
// tint: subtle material tint so each visitor's outfit reads differently.

export const NPCS = [
  {
    id: "aurelia",
    name: "Aurelia",
    role: "Head Curator",
    tint: "#ffffff",
    scale: 1.0,
    speed: 0.9,
    position: [-8, 0, -5],
    dialogue: {
      greeting:
        "Ah, a new visitor. Welcome to the Malav Private Collection. I curated every wall you see — ask me anything.",
      options: [
        {
          q: "What's the story behind this gallery?",
          a: "Parv wanted his portfolio to feel like a place, not a page. Every exhibit here is a real milestone — projects, skills, credentials — hung like art. Because honestly, good engineering is art.",
        },
        {
          q: "Which piece should I see first?",
          a: "Start with SMASH.CLUB on the main wall — the centrepiece. A full tournament platform with a live ELO ladder. Then drift left for the engineering studies.",
        },
        {
          q: "Any rules I should know?",
          a: "Only one: take your time. Walk, sit on the sofa, look up at the light. The collection rewards slow viewing.",
        },
      ],
    },
  },
  {
    id: "whitfield",
    name: "Mr. Whitfield",
    role: "Art Collector",
    tint: "#d8cfc0",
    scale: 1.03,
    speed: 0.7,
    position: [9, 0, -4],
    dialogue: {
      greeting:
        "Hmm? Oh, hello. I was just appraising the centrepiece. Magnificent composition... and the engineering beneath it, even better.",
      options: [
        {
          q: "Would you invest in this developer?",
          a: "Between us? A third-year student shipping production platforms with real-time backends... I've seen senior engineers with thinner portfolios. Yes. I'd invest early.",
        },
        {
          q: "What makes a piece valuable?",
          a: "Scarcity and proof. Anyone can claim skill — this gallery shows receipts. A live demo link is worth a thousand adjectives.",
        },
        {
          q: "Do you collect software?",
          a: "I collect outcomes, dear visitor. Working products, shipped systems, happy users. The frames here hold exactly that.",
        },
      ],
    },
  },
  {
    id: "zara",
    name: "Zara",
    role: "Design Student",
    tint: "#e8d4d4",
    scale: 0.96,
    speed: 1.2,
    position: [-6, 0, 5],
    dialogue: {
      greeting:
        "Oh hey! Isn't this place gorgeous? I've been sketching the lighting for an hour. White and gold — so classy.",
      options: [
        {
          q: "What do you think of the design?",
          a: "The reflective floor sells it for me. And notice how every artwork gets its own warm spotlight? That's museum-grade lighting design. I'm stealing the palette for my next project, don't tell anyone.",
        },
        {
          q: "Are you also a developer?",
          a: "Designer first, coder second. But galleries like this make me want to learn React Three Fiber properly. Imagine building YOUR portfolio as a walkable space!",
        },
        {
          q: "Favourite exhibit?",
          a: "The SMASH.CLUB screenshot — that dark UI with the neon accents? Chef's kiss. Cinematic product design from a student. Unfair, honestly.",
        },
      ],
    },
  },
  {
    id: "iyer",
    name: "Prof. Iyer",
    role: "CS Professor",
    tint: "#cfd4dc",
    scale: 1.0,
    speed: 0.8,
    position: [10, 0, 4],
    dialogue: {
      greeting:
        "Good day. I teach distributed systems. I came for the ELO ranking exhibit — solid applied mathematics, that one.",
      options: [
        {
          q: "Is the ELO engine impressive?",
          a: "It's the correct tool used correctly — expected-score probability, balanced K-factors, tiered progression. Many students copy formulas; building a live ladder that stays fair under load is the real exam.",
        },
        {
          q: "What should Parv learn next?",
          a: "He has MERN, Supabase, GCP. I'd push him toward system design at scale — queues, caching, observability. The foundations wall suggests he's ready.",
        },
        {
          q: "Would he pass your course?",
          a: "Ha! Looking at this gallery? He'd be the one teaching the tutorial sessions.",
        },
      ],
    },
  },
  {
    id: "leon",
    name: "Leon",
    role: "Art Critic",
    tint: "#d4d4d4",
    scale: 1.05,
    speed: 0.85,
    position: [-10, 0, 2],
    dialogue: {
      greeting:
        "Another visitor... Very well. I review galleries for a living. This one? Surprisingly... not terrible. High praise, from me.",
      options: [
        {
          q: "Your honest review of this gallery?",
          a: "Four and a half stars. The gold cornices flirt with excess but never commit the sin. The exhibits have substance — rare. I deducted half a star because the gift shop is missing.",
        },
        {
          q: "What's your critique of the work?",
          a: "A badminton platform with tournament brackets, news feeds and a ranking engine — ambitious scope, executed. My critique? The artist should sign more walls. Confidence becomes him.",
        },
        {
          q: "Seen better portfolios?",
          a: "I've seen hundreds of flat, scrolling portfolios. Walkable ones with working products inside? I can count those on one hand. Now I can count one more finger.",
        },
      ],
    },
  },
  {
    id: "maya",
    name: "Maya",
    role: "Travel Blogger",
    tint: "#e0d8c8",
    scale: 0.97,
    speed: 1.1,
    position: [4, 0, 6],
    dialogue: {
      greeting:
        "Hi hi! I blog about unusual places and WOW does this count. A museum inside a portfolio website? My followers will lose it.",
      options: [
        {
          q: "How does this compare to real galleries?",
          a: "I've toured the Louvre, MoMA, the Uffizi... this has something they don't: you can sit on the art (the sofa, I mean) and nobody yells at you!",
        },
        {
          q: "What will you write about it?",
          a: "Headline: 'I Walked Through A Resume And Honestly? Better Than Venice.' Slight exaggeration. Only slight.",
        },
        {
          q: "Any travel tips for the gallery?",
          a: "Sprint with Shift across the reflective floor — feels amazing. And the view sitting on the sofa looking at the main wall? Golden hour, every hour.",
        },
      ],
    },
  },
  {
    id: "dev",
    name: "Dev",
    role: "Startup Founder",
    tint: "#c8d8d0",
    scale: 1.02,
    speed: 1.3,
    position: [7, 0, -7],
    dialogue: {
      greeting:
        "Hey! Quick question — you know if this Parv guy is taking offers? Asking for... me. I'm asking for me.",
      options: [
        {
          q: "Why do you want to hire him?",
          a: "Full-stack, real-time systems, ships actual products as a student, AND has taste? Do you know how rare taste is? I've funded teams with less than this one gallery.",
        },
        {
          q: "What would you build with him?",
          a: "Honestly? I'd just point him at a problem and get out of the way. Tournament systems, ranking engines — that's marketplace-grade infrastructure thinking.",
        },
        {
          q: "What's your startup?",
          a: "Stealth mode, can't say. But if a certain someone emails parvmalav666@gmail.com... I mean, if YOU email... look, the placard is right there by the exit.",
        },
      ],
    },
  },
  {
    id: "joe",
    name: "Grandpa Joe",
    role: "Retired Engineer",
    tint: "#d8d0c4",
    scale: 0.99,
    speed: 0.6,
    position: [-3, 0, -7],
    dialogue: {
      greeting:
        "Forty years I wrote FORTRAN, kid. Now portfolios are buildings you walk around in. Marvelous. Utterly marvelous.",
      options: [
        {
          q: "How was engineering in your day?",
          a: "We carried punch cards uphill both ways! One typo, resubmit the whole deck tomorrow. These kids deploy to the planet in seconds and still complain about build times. Ha!",
        },
        {
          q: "What do you think of modern web dev?",
          a: "React, Mongo, cloud functions... the names change, the discipline doesn't. This Parv fellow has the discipline. You can tell by the placards — tidy placards, tidy mind.",
        },
        {
          q: "Any advice for young developers?",
          a: "Three things: read the error message, take the walk before debugging, and never trust a system you haven't watched fail. Worked for four decades.",
        },
      ],
    },
  },
  {
    id: "nina",
    name: "Nina",
    role: "Photographer",
    tint: "#d0d0dc",
    scale: 0.95,
    speed: 1.0,
    position: [2, 0, -6],
    dialogue: {
      greeting:
        "Shhh... hold on... okay, got the shot. The light panels reflecting off this floor are incredible. What can I do for you?",
      options: [
        {
          q: "What are you photographing?",
          a: "The geometry. Gold lines, white planes, warm pools of spotlight. And that campus photo of VIT Chennai on the left wall? Whoever shot that aerial knew exactly what they were doing.",
        },
        {
          q: "Best angle in the gallery?",
          a: "Sit on the sofa, face the main wall, tilt up slightly so the ceiling panel halos the SMASH.CLUB frame. You're welcome.",
        },
        {
          q: "Do you shoot portfolios?",
          a: "I shoot moments. But if portfolios start looking like THIS, I might switch genres entirely.",
        },
      ],
    },
  },
  {
    id: "kabir",
    name: "Kabir",
    role: "Badminton Player",
    tint: "#ccd8c8",
    scale: 1.04,
    speed: 1.4,
    position: [-5, 0, 0.0 - 3],
    dialogue: {
      greeting:
        "Yo! State-level doubles player here. I literally USE Smash.Club — my club runs every tournament on it. Surreal seeing it framed like the Mona Lisa.",
      options: [
        {
          q: "How is SMASH.CLUB to actually use?",
          a: "Smooth, man. Brackets generate instantly — single elim, double elim, round robin, whatever the coach wants. And the live scores sync before I've even towelled off.",
        },
        {
          q: "What about the ranking badges?",
          a: "Bro, the badges are a PROBLEM. I grinded two months from Gold to Platinum. My whole club is addicted to that ELO ladder. Diamond or bust.",
        },
        {
          q: "Message for the developer?",
          a: "Parv, if you're hearing this — add a doubles chemistry stat and I will personally sponsor you a lifetime supply of shuttlecocks.",
        },
      ],
    },
  },
];
