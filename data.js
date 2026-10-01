/*
 * ─────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT — edit this file only.
 *  Everything on the site (your details, projects, skills) is
 *  read from here. Text in [brackets] is a placeholder.
 *
 *  Images: export from Canva and put them in assets/ using the
 *  file names below. Until a file exists, the site shows a
 *  labelled empty slot instead.
 * ─────────────────────────────────────────────────────────────
 */
window.PORTFOLIO = {
  profile: {
    name: "River Geoff",
    role: "Graphic Designer",
    tagline: "Design that doesn't shout. It flows, connects, and leaves something behind.",
    photo: "assets/profile.jpg",
    status: "Open to freelance & full-time roles",
    location: "[City, Country]",
    email: "[hello@yourname.com]",
    phone: "[+00 000 000 0000]",
    links: [
      { label: "Behance", url: "#" },
      { label: "Instagram", url: "#" },
      { label: "LinkedIn", url: "#" },
    ],
  },

  about: [
    "[Write two or three sentences about who you are and how you work. What do you care about when you design?]",
    "[Add a second paragraph about what you're focused on right now: the kind of clients, brands or projects you want more of.]",
  ],

  stats: [
    { value: "[00]", label: "Projects shipped" },
    { value: "[0]", label: "Years designing" },
    { value: "[00]", label: "Clients & orgs" },
  ],

  details: [
    { label: "Full name", value: "[Your full name]" },
    { label: "Based in", value: "[City, Country]" },
    { label: "Education", value: "[Degree — School, Year]" },
    { label: "Languages", value: "[English, Filipino]" },
    { label: "Tools", value: "[Canva, Photoshop, Illustrator, Figma, CapCut]" },
    { label: "Availability", value: "[Freelance / Full-time / Part-time]" },
  ],

  experience: [
    { years: "[2026]", title: "[Role]", org: "[Company or client]" },
    { years: "[2025]", title: "[Role]", org: "[Company or client]" },
    { years: "[2023]", title: "[Role]", org: "[Organization]" },
    { years: "[2022]", title: "[Role]", org: "[Organization]" },
  ],

  skills: {
    work: [
      "Social Media Design", "Carousel & Story Design", "Editorial Layout",
      "Branding & Visual Identity", "Motion & Video Editing",
      "Interactive Story UI", "Mock-ups", "Digital Illustration",
    ],
    soft: [
      "Goal-Oriented", "Receptive to Feedback", "Creative Thinker",
      "Collaborative", "Time Management", "Adaptable", "Curious",
    ],
  },

  // Categories drive the filter tabs. Each project's `category` must match one.
  categories: ["Social", "Editorial", "Stories", "Motion", "Interactive", "Brand Identity"],

  projects: [
    {
      id: "wellness-carousels",
      title: "Social Carousel Series",
      client: "The Wellness",
      year: "2026",
      category: "Social",
      image: "assets/work/page-2.jpg",
      summary: "[Short description: the goal of the series, the audience, and what you designed.]",
      tags: ["Carousels", "Art direction", "Typography"],
      featured: true,
    },
    {
      id: "wellness-editorial",
      title: "Editorial Feed Posts",
      client: "The Wellness",
      year: "2026",
      category: "Editorial",
      image: "assets/work/page-3.jpg",
      summary: "[Short description: warm, editorial-style posts pairing portraits with statements and stats.]",
      tags: ["Feed posts", "Editorial", "Photo direction"],
      featured: true,
    },
    {
      id: "wellness-stories",
      title: "Vertical Story Frames",
      client: "The Wellness",
      year: "2026",
      category: "Stories",
      image: "assets/work/page-4.jpg",
      summary: "[Short description: 9:16 story and reel frames built for the same campaign.]",
      tags: ["Stories", "Reels", "9:16"],
    },
    {
      id: "motion-explainers",
      title: "Motion Explainer Frames",
      client: "[Client]",
      year: "2026",
      category: "Motion",
      image: "assets/work/page-5.jpg",
      summary: "[Short description: storyboard and key frames for short-form explainer videos.]",
      tags: ["Motion", "Storyboard", "Video"],
    },
    {
      id: "interactive-stories",
      title: "Interactive Story & Survey UI",
      client: "[Client]",
      year: "2026",
      category: "Interactive",
      image: "assets/work/page-6.jpg",
      summary: "[Short description: poll, quiz and form screens designed to drive engagement.]",
      tags: ["UI", "Polls", "Engagement"],
    },
    {
      id: "sonder-matcha",
      title: "Sonder Matcha Slow Bar",
      client: "Personal project",
      year: "2026",
      category: "Brand Identity",
      image: "assets/work/sonder.jpg",
      summary: "A slow-bar concept grounded in \"Moments Between Moments\" — minimal, soft and balanced, with natural tones and clean type.",
      tags: ["Logo", "Identity", "Packaging"],
    },
    {
      id: "tres-marias",
      title: "Tres Marias Café",
      client: "Personal project",
      year: "2026",
      category: "Brand Identity",
      image: "assets/work/tres-marias.jpg",
      summary: "A community café identity expressed only in black and white: clarity, contrast and timelessness.",
      tags: ["Logo", "Identity", "Monochrome"],
    },
  ],
};
