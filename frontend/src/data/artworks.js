// Gallery exhibit data — Parv Malav's portfolio rendered as museum pieces.
// Positions are in world units inside the gallery hall (28 x 20 m, eye level 1.6m).

export const ARTWORKS = [
  {
    id: "smash-club",
    title: "SMASH.CLUB",
    year: "2024",
    medium: "Full-Stack Platform — MERN · Supabase · Vercel",
    type: "Featured Project",
    short: "Production-grade badminton management platform.",
    description:
      "A production-grade full-stack platform built for badminton clubs, academies and individual players. Engineered tournament modules supporting Single Elimination, Double Elimination and Round Robin formats, with a cinematic dark UI, fluid animations and a real-time Supabase backend for instant data synchronisation.",
    details: [
      "Tournament engine: Single & Double Elimination, Round Robin",
      "Advanced ELO ranking engine with Bronze → Diamond player badges",
      "Live BWF international news stream",
      "Pro Gear section linking equipment to Amazon & Flipkart",
    ],
    links: [
      { label: "Live Demo", url: "https://badminton-club-app-taupe.vercel.app" },
      { label: "GitHub", url: "https://github.com/P-2005" },
    ],
    image:
      "https://customer-assets.emergentagent.com/job_gallery-immerse-3/artifacts/n0w8n1sk_image_2026-06-12_233331835.png",
    position: [0, 2.2, -9.8],
    rotationY: 0,
    size: [4.4, 2.6],
  },
  {
    id: "elo-engine",
    title: "The Ranking Engine",
    year: "2024",
    medium: "Systems Design — ELO Algorithm",
    type: "Engineering Study",
    short: "Tiered ELO ranking engine, Bronze to Diamond.",
    description:
      "An advanced ELO ranking engine designed for competitive play. Every match shifts a living ladder of players across tiered badges — Bronze, Silver, Gold, Platinum and Diamond — with mathematically balanced gains and losses that keep competition fair and addictive.",
    details: [
      "Probabilistic expected-score model",
      "Tiered badge progression system",
      "Real-time rank recalculation on match completion",
    ],
    links: [],
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    position: [-8.5, 2.2, -9.8],
    rotationY: 0,
    size: [3, 2.1],
  },
  {
    id: "languages",
    title: "Foundations",
    year: "2024 — Present",
    medium: "Languages — C/C++ · Java · Python · PL/SQL",
    type: "Skillset",
    short: "The raw materials of every build.",
    description:
      "Every structure needs strong foundations. C and C++ for control and performance, Java for robust object-oriented systems, Python for speed of thought, and PL/SQL for shaping data itself — paired with deep grounding in OOP, data structures, networking and operating systems.",
    details: [
      "C / C++ · Java · Python · PL/SQL",
      "OOP · Data Structures · Computer Networking · Operating Systems",
    ],
    links: [],
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    position: [8.5, 2.2, -9.8],
    rotationY: 0,
    size: [3, 2.1],
  },
  {
    id: "web-cloud",
    title: "Cloud & Web",
    year: "2024 — Present",
    medium: "React · Node · Express · GCP · Vercel",
    type: "Skillset",
    short: "Scalable web applications and cloud-based systems.",
    description:
      "A full-stack practice focused on scalable web applications and cloud-based systems: React.js and Node.js with Express for the application layer, MongoDB and Supabase for data, REST APIs as connective tissue, and Google Cloud Platform with Vercel for deployment — all versioned through Git and GitHub.",
    details: [
      "React.js · Node.js · Express.js · REST APIs",
      "MongoDB · Supabase · Relational Databases",
      "Google Cloud Platform · Vercel · Git · GitHub",
    ],
    links: [],
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    position: [-13.8, 2.2, -4.5],
    rotationY: Math.PI / 2,
    size: [3, 2.1],
  },
  {
    id: "education",
    title: "VIT Chennai",
    year: "2024 — 2028",
    medium: "B.Tech — Cyber Physical Systems & CS",
    type: "Education",
    short: "Bachelor of Technology, currently in third year.",
    description:
      "B.Tech in Cyber Physical Systems & Computer Science at VIT Chennai — a degree at the intersection of software, hardware and the systems that bind them. Currently in third year, expected graduation May 2028.",
    details: [
      "Vellore Institute of Technology, Chennai",
      "Cyber Physical Systems & Computer Science",
      "Expected graduation: May 2028",
    ],
    links: [],
    image:
      "https://customer-assets.emergentagent.com/job_gallery-immerse-3/artifacts/aqrhee9r_campus-banner.jpg",
    position: [-13.8, 2.2, 3.5],
    rotationY: Math.PI / 2,
    size: [3, 2.1],
  },
  {
    id: "certifications",
    title: "Credentials",
    year: "2024 — 2025",
    medium: "Google Cloud · NISM · Udemy · IT Campus",
    type: "Recognition",
    short: "Certified foundations across cloud, finance and systems.",
    description:
      "A growing wall of recognition: Google Cloud certification from Google, NISM National Financial Literacy (qualified for the college round), Computer Hardware, Operating Systems & Networking from Udemy, and C/C++ Programming from IT Campus.",
    details: [
      "Google Cloud Course — Google",
      "NISM National Financial Literacy — College Round Qualifier",
      "Hardware, OS & Networking — Udemy",
      "C/C++ Programming — IT Campus",
    ],
    links: [],
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    position: [13.8, 2.2, -4.5],
    rotationY: -Math.PI / 2,
    size: [3, 2.1],
  },
  {
    id: "about",
    title: "The Developer",
    year: "Est. 2005",
    medium: "Software Developer & Cloud Engineer",
    type: "Portrait",
    short: "Parv Malav — Kota, Rajasthan, India.",
    description:
      "Parv Malav is a full-stack developer focused on scalable web applications and cloud-based systems. Experienced with the MERN stack, Supabase and real-time architectures through production-grade projects involving tournament systems, ranking engines and responsive UI engineering.",
    details: [
      "Based in Kota, Rajasthan, India",
      "MERN · Supabase · Real-time architectures",
      "Tournament systems · Ranking engines · Responsive UI",
    ],
    links: [
      { label: "GitHub", url: "https://github.com/P-2005" },
      { label: "LinkedIn", url: "https://linkedin.com/in/parv-malav-69927940b" },
    ],
    image:
      "https://customer-assets.emergentagent.com/job_gallery-immerse-3/artifacts/8hc5p7we_1779691160484.jpg",
    position: [13.8, 2.2, 3.5],
    rotationY: -Math.PI / 2,
    size: [2.2, 2.8],
  },
  {
    id: "contact",
    title: "Get In Touch",
    year: "Always Open",
    medium: "Email · GitHub · LinkedIn",
    type: "Contact",
    short: "The exit is also an entrance.",
    description:
      "Every gallery visit ends at the gift shop — this one ends with a conversation. Reach out for collaborations, opportunities or just to talk systems design.",
    details: [
      "parvmalav666@gmail.com",
      "+91 9119327821",
      "github.com/P-2005 · linkedin.com/in/parv-malav-69927940b",
    ],
    links: [
      { label: "Email Me", url: "mailto:parvmalav666@gmail.com" },
      { label: "GitHub", url: "https://github.com/P-2005" },
      { label: "LinkedIn", url: "https://linkedin.com/in/parv-malav-69927940b" },
    ],
    image:
      "https://images.unsplash.com/photo-1516387938699-a93567ec168e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    position: [0, 2.2, 9.8],
    rotationY: Math.PI,
    size: [3.4, 2.2],
  },
];
