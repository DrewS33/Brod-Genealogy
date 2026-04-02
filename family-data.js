// ============================================================
//  FAMILY DATA — 25 Members across 5 Generations
//  Generations: Gen1 (oldest/top) → Gen5 (youngest/bottom)
//  Status: "alive" | "deceased" | "unknown"
//  Parents listed by their IDs
//
//  PORTRAITS: add a `photo` field to any member pointing to an
//  image file relative to this page, e.g.:
//    photo: "images/james.jpg"
//  Supported formats: JPG, PNG, WebP, GIF.
//  Recommended size: at least 80×80px, square crop works best.
//  Leave the field absent (or null) to show the plain status dot.
// ============================================================

const FAMILY_DATA = {

  // ----------------------------------------------------------
  // GENERATION 1 — Great-Great-Grandparents (currently alive at top)
  //   In this layout: living people first, then older ancestors below
  //   So Gen 1 = The youngest/living generation shown at top
  // ----------------------------------------------------------

  members: [

    // === GENERATION 1 — Living Adults (Top of tree) ===
    {
      id: "p01",
      name: "James & Clara\nHartwell",
      firstName: "James",
      lastName: "Hartwell",
      generation: 1,
      status: "alive",
      born: "1955",
      died: null,
      birthplace: "Nashville, TN",
      role: "Patriarch & Matriarch",
      emoji: "👴",
      bio: "James and Clara Hartwell have been the cornerstone of this family for over 50 years. James worked as a civil engineer, helping design bridges across the Southeast. Clara was a beloved elementary school teacher who shaped hundreds of young minds. They met at a church social in 1977 and married the following spring. Together they raised four children in their farmhouse in Tennessee.",
      parents: ["p09", "p10"],
      spouse: "Clara Hartwell (née Meadows)",
      children: ["p03", "p04", "p05", "p06"],
      spouseId: "p02"
    },
    {
      id: "p02",
      name: "Clara\nHartwell",
      firstName: "Clara",
      lastName: "Hartwell",
      generation: 1,
      status: "alive",
      born: "1958",
      died: null,
      birthplace: "Memphis, TN",
      role: "Matriarch",
      emoji: "👵",
      bio: "Clara Meadows-Hartwell grew up in a musical household in Memphis, Tennessee. She learned piano at age five and went on to study education at the University of Tennessee. After a fulfilling career as an elementary school teacher, she retired in 2018 and now spends her days gardening, playing piano, and spoiling her grandchildren. She is the heart of every family gathering.",
      parents: ["p11", "p12"],
      spouse: "James Hartwell",
      children: ["p03", "p04", "p05", "p06"],
      spouseId: "p01"
    },

    // === GENERATION 2 — Their Children ===
    {
      id: "p03",
      name: "Robert\nHartwell",
      firstName: "Robert",
      lastName: "Hartwell",
      generation: 2,
      status: "alive",
      born: "1979",
      died: null,
      birthplace: "Nashville, TN",
      role: "Son",
      emoji: "👨",
      bio: "Robert Hartwell is the eldest child of James and Clara. He followed in his father's footsteps and became a structural engineer based in Atlanta. A passionate runner, he has completed three marathons. He married Lisa Chen in 2005 and they have two daughters together. Robert is known in the family for his terrible puns and excellent barbecue.",
      parents: ["p01", "p02"],
      spouse: "Lisa Hartwell (née Chen)",
      children: ["p13", "p14"],
      spouseId: "p07"
    },
    {
      id: "p04",
      name: "Susan\nHartwell-Moore",
      firstName: "Susan",
      lastName: "Moore",
      generation: 2,
      status: "alive",
      born: "1981",
      died: null,
      birthplace: "Nashville, TN",
      role: "Daughter",
      emoji: "👩",
      bio: "Susan is the second child of James and Clara. She studied nursing and spent 15 years working in pediatric care before moving into hospital administration. She married David Moore in 2007 and they live in Charlotte, NC with their three children. Susan is the family organizer — she manages the reunion schedule, the family group chat, and everyone's birthdays.",
      parents: ["p01", "p02"],
      spouse: "David Moore",
      children: ["p15", "p16", "p17"],
      spouseId: "p08"
    },
    {
      id: "p05",
      name: "Thomas\nHartwell",
      firstName: "Thomas",
      lastName: "Hartwell",
      generation: 2,
      status: "alive",
      born: "1984",
      died: null,
      birthplace: "Nashville, TN",
      role: "Son",
      emoji: "🧑",
      bio: "Thomas, the third Hartwell child, took a different path and became a chef. He trained in New Orleans and eventually opened his own restaurant, 'Hartwell's Kitchen,' in Nashville. He has been featured in two regional food magazines. He married Priya Subramaniam in 2012. Thomas is the family's go-to for Thanksgiving dinner and always shows up with something spectacular.",
      parents: ["p01", "p02"],
      spouse: "Priya Hartwell (née Subramaniam)",
      children: ["p18", "p19"],
      spouseId: null
    },
    {
      id: "p06",
      name: "Emily\nHartwell-Reyes",
      firstName: "Emily",
      lastName: "Reyes",
      generation: 2,
      status: "alive",
      born: "1987",
      died: null,
      birthplace: "Nashville, TN",
      role: "Daughter",
      emoji: "👩",
      bio: "Emily is the youngest of the Hartwell siblings and the most adventurous. She spent two years teaching English in South Korea before returning to the US. She now works as a graphic designer in Austin, TX. She married Marco Reyes in 2015. Emily designed the family's Christmas card for the last eight years and is the unofficial family photographer.",
      parents: ["p01", "p02"],
      spouse: "Marco Reyes",
      children: ["p20"],
      spouseId: null
    },

    // === GENERATION 2 — Spouses ===
    {
      id: "p07",
      name: "Lisa\nHartwell",
      firstName: "Lisa",
      lastName: "Hartwell",
      generation: 2,
      status: "alive",
      born: "1980",
      died: null,
      birthplace: "San Francisco, CA",
      role: "Daughter-in-Law",
      emoji: "👩",
      bio: "Lisa Chen-Hartwell grew up in San Francisco and earned her MBA from Emory University, which is where she met Robert. She works as a senior marketing director for a technology company in Atlanta. Lisa introduced the family to dim sum and has an impressive collection of vintage board games. She is competitive at everything, especially card games.",
      parents: [],
      spouse: "Robert Hartwell",
      children: ["p13", "p14"],
      spouseId: "p03"
    },
    {
      id: "p08",
      name: "David\nMoore",
      firstName: "David",
      lastName: "Moore",
      generation: 2,
      status: "alive",
      born: "1978",
      died: null,
      birthplace: "Raleigh, NC",
      role: "Son-in-Law",
      emoji: "👨",
      bio: "David Moore is a high school history teacher and football coach in Charlotte, NC. He met Susan at a friend's wedding in 2005 and proposed on a hiking trip to the Blue Ridge Parkway. David is endlessly enthusiastic about history and will happily tell you about any historical event with little prompting. He coaches his son's little league team on weekends.",
      parents: [],
      spouse: "Susan Hartwell-Moore",
      children: ["p15", "p16", "p17"],
      spouseId: "p04"
    },

    // === GENERATION 3 — Grandchildren ===
    {
      id: "p13",
      name: "Olivia\nHartwell",
      firstName: "Olivia",
      lastName: "Hartwell",
      generation: 3,
      status: "alive",
      born: "2006",
      died: null,
      birthplace: "Atlanta, GA",
      role: "Grandchild",
      emoji: "👧",
      bio: "Olivia is Robert and Lisa's eldest daughter. At 18, she is already an accomplished violinist who has performed with her school's youth symphony. She loves astronomy and wants to study astrophysics. She is the quiet, thoughtful one in her generation — always with a book and a good question.",
      parents: ["p03", "p07"],
      spouse: null,
      children: [],
      spouseId: null
    },
    {
      id: "p14",
      name: "Mia\nHartwell",
      firstName: "Mia",
      lastName: "Hartwell",
      generation: 3,
      status: "alive",
      born: "2009",
      died: null,
      birthplace: "Atlanta, GA",
      role: "Grandchild",
      emoji: "👧",
      bio: "Mia is the younger daughter of Robert and Lisa. She's spirited, funny, and obsessed with marine biology after a family trip to an aquarium in 2018. She has a growing collection of sea creature figurines and a pet fish named Copernicus. She plays soccer and has a gift for making friends wherever she goes.",
      parents: ["p03", "p07"],
      spouse: null,
      children: [],
      spouseId: null
    },
    {
      id: "p15",
      name: "Aiden\nMoore",
      firstName: "Aiden",
      lastName: "Moore",
      generation: 3,
      status: "alive",
      born: "2008",
      died: null,
      birthplace: "Charlotte, NC",
      role: "Grandchild",
      emoji: "👦",
      bio: "Aiden is Susan and David's eldest. He inherited his father's love of history and his mother's organizational skills. At 16, he volunteers at a local historical society cataloguing old photographs. He also plays trumpet in the school band and has a growing interest in filmmaking.",
      parents: ["p04", "p08"],
      spouse: null,
      children: [],
      spouseId: null
    },
    {
      id: "p16",
      name: "Grace\nMoore",
      firstName: "Grace",
      lastName: "Moore",
      generation: 3,
      status: "alive",
      born: "2010",
      died: null,
      birthplace: "Charlotte, NC",
      role: "Grandchild",
      emoji: "👧",
      bio: "Grace is the middle child of Susan and David. She is an avid reader, gymnast, and aspiring veterinarian. She rescued a three-legged dog named Biscuit and cares for him devotedly. Grace has a talent for empathy and is the peacemaker among her siblings.",
      parents: ["p04", "p08"],
      spouse: null,
      children: [],
      spouseId: null
    },
    {
      id: "p17",
      name: "Noah\nMoore",
      firstName: "Noah",
      lastName: "Moore",
      generation: 3,
      status: "alive",
      born: "2013",
      died: null,
      birthplace: "Charlotte, NC",
      role: "Grandchild",
      emoji: "👦",
      bio: "Noah is the youngest of the Moore children. He's energetic, creative, and deeply into LEGOs. He has built elaborate cities across his bedroom floor and plans to be an architect someday — or a Lego designer, he says, which are the same thing. He idolizes his Uncle Thomas and wants to learn to cook.",
      parents: ["p04", "p08"],
      spouse: null,
      children: [],
      spouseId: null
    },
    {
      id: "p18",
      name: "Lily\nHartwell",
      firstName: "Lily",
      lastName: "Hartwell",
      generation: 3,
      status: "alive",
      born: "2013",
      died: null,
      birthplace: "Nashville, TN",
      role: "Grandchild",
      emoji: "👧",
      bio: "Lily is Thomas and Priya's eldest. She has grown up in her father's restaurant and can already make a proper roux at age eleven. She loves cooking shows, dogs, and drawing. Her dream is to one day have her own bakery specializing in international pastries.",
      parents: ["p05"],
      spouse: null,
      children: [],
      spouseId: null
    },
    {
      id: "p19",
      name: "Sam\nHartwell",
      firstName: "Sam",
      lastName: "Hartwell",
      generation: 3,
      status: "alive",
      born: "2016",
      died: null,
      birthplace: "Nashville, TN",
      role: "Grandchild",
      emoji: "👦",
      bio: "Sam is Thomas and Priya's youngest. He's a curious seven-year-old who loves dinosaurs and superheroes in equal measure. He once asked his grandfather if dinosaurs could be superheroes, and the question launched a three-hour family debate. Sam has his mother's warm smile and his father's love of food.",
      parents: ["p05"],
      spouse: null,
      children: [],
      spouseId: null
    },
    {
      id: "p20",
      name: "Zoe\nReyes",
      firstName: "Zoe",
      lastName: "Reyes",
      generation: 3,
      status: "alive",
      born: "2017",
      died: null,
      birthplace: "Austin, TX",
      role: "Grandchild",
      emoji: "👧",
      bio: "Zoe is Emily and Marco's daughter and the youngest grandchild. She's already showing signs of her mother's artistic eye — she painted her first self-portrait at age five and it was surprisingly recognizable. She loves music and dancing, and attends a bilingual Spanish-English preschool.",
      parents: ["p06"],
      spouse: null,
      children: [],
      spouseId: null
    },

    // === GENERATION 4 — James & Clara's Parents (Grandparents) ===
    {
      id: "p09",
      name: "Harold\nHartwell",
      firstName: "Harold",
      lastName: "Hartwell",
      generation: 4,
      status: "deceased",
      born: "1928",
      died: "2001",
      birthplace: "Knoxville, TN",
      role: "Grandfather",
      emoji: "👴",
      bio: "Harold Hartwell was a World War II veteran who served in the Pacific theater. After returning home, he worked as a carpenter and built the family's farmhouse in Tennessee with his own hands — a home that still stands today. He was a quiet, steady man of deep faith and few words, but when he spoke, everyone listened. He passed away peacefully surrounded by family in 2001.",
      parents: ["p21", "p22"],
      spouse: "Margaret Hartwell (née Ellis)",
      children: ["p01"],
      spouseId: "p10"
    },
    {
      id: "p10",
      name: "Margaret\nHartwell",
      firstName: "Margaret",
      lastName: "Hartwell",
      generation: 4,
      status: "deceased",
      born: "1931",
      died: "2009",
      birthplace: "Chattanooga, TN",
      role: "Grandmother",
      emoji: "👵",
      bio: "Margaret Ellis-Hartwell was known for her extraordinary cooking and her even more extraordinary patience. She raised five children on a modest budget with grace and creativity. She was an active member of her church choir for over 40 years. Her peach preserves won the county fair three years running. She passed in 2009, leaving behind a recipe box that is now a family treasure.",
      parents: [],
      spouse: "Harold Hartwell",
      children: ["p01"],
      spouseId: "p09"
    },
    {
      id: "p11",
      name: "Walter\nMeadows",
      firstName: "Walter",
      lastName: "Meadows",
      generation: 4,
      status: "deceased",
      born: "1930",
      died: "1998",
      birthplace: "Memphis, TN",
      role: "Grandfather",
      emoji: "👴",
      bio: "Walter Meadows was a jazz musician and later a music teacher at a high school in Memphis. He played trumpet professionally in his 20s and toured with a regional jazz band across the South. He was instrumental in fostering Clara's love of music. He passed away from heart disease in 1998, but his old recordings still play at family gatherings.",
      parents: ["p23", "p24"],
      spouse: "Dorothy Meadows (née Lawson)",
      children: ["p02"],
      spouseId: "p12"
    },
    {
      id: "p12",
      name: "Dorothy\nMeadows",
      firstName: "Dorothy",
      lastName: "Meadows",
      generation: 4,
      status: "deceased",
      born: "1933",
      died: "2015",
      birthplace: "Jackson, TN",
      role: "Grandmother",
      emoji: "👵",
      bio: "Dorothy Lawson-Meadows was a librarian for 35 years and an avid reader who claimed to have read over 3,000 books. She believed deeply in education and made sure every grandchild had a library card and a love of stories. She was witty, stylish, and sharp until the very end. She passed away in 2015 at the age of 82, with a novel on her nightstand.",
      parents: [],
      spouse: "Walter Meadows",
      children: ["p02"],
      spouseId: "p11"
    },

    // === GENERATION 5 — Great-Grandparents (Bottom of tree) ===
    {
      id: "p21",
      name: "Earl\nHartwell",
      firstName: "Earl",
      lastName: "Hartwell",
      generation: 5,
      status: "deceased",
      born: "1901",
      died: "1969",
      birthplace: "Asheville, NC",
      role: "Great-Grandfather",
      emoji: "🧓",
      bio: "Earl Hartwell was a tobacco farmer and later a factory worker during the Great Depression era. He moved the family from North Carolina to Tennessee in 1935 in search of better work. He was known as a hardworking, stoic man who taught his children the value of labor and integrity. He passed away in 1969 from pneumonia.",
      parents: [],
      spouse: "Ruby Hartwell (née Greer)",
      children: ["p09"],
      spouseId: "p22"
    },
    {
      id: "p22",
      name: "Ruby\nHartwell",
      firstName: "Ruby",
      lastName: "Hartwell",
      generation: 5,
      status: "deceased",
      born: "1904",
      died: "1975",
      birthplace: "Asheville, NC",
      role: "Great-Grandmother",
      emoji: "🧓",
      bio: "Ruby Greer-Hartwell was known for her warmth, her storytelling, and her ability to stretch a small pantry into a feast. She kept a detailed journal from 1922 until her death, and fragments of it have been preserved by the family. She was beloved by all who knew her and is still spoken of with reverence at family reunions.",
      parents: [],
      spouse: "Earl Hartwell",
      children: ["p09"],
      spouseId: "p21"
    },
    {
      id: "p23",
      name: "Clarence\nMeadows",
      firstName: "Clarence",
      lastName: "Meadows",
      generation: 5,
      status: "deceased",
      born: "1898",
      died: "1961",
      birthplace: "Memphis, TN",
      role: "Great-Grandfather",
      emoji: "🧓",
      bio: "Clarence Meadows worked as a postal worker for 30 years and was a respected figure in his Memphis neighborhood. He had a passion for woodworking and made furniture that can still be found in several family homes. He passed in 1961, but his handmade rocking chair still sits on the Hartwell farmhouse porch.",
      parents: [],
      spouse: "Ida Meadows (née Porter)",
      children: ["p11"],
      spouseId: "p24"
    },
    {
      id: "p24",
      name: "Ida\nMeadows",
      firstName: "Ida",
      lastName: "Meadows",
      generation: 5,
      status: "deceased",
      born: "1902",
      died: "1978",
      birthplace: "Nashville, TN",
      role: "Great-Grandmother",
      emoji: "🧓",
      bio: "Ida Porter-Meadows raised four children while also working as a seamstress from her home. Her skill with fabric was legendary — she made wedding dresses for three of her grandchildren. She was deeply religious and community-minded, organizing food drives during hard times. She passed away peacefully in 1978 at age 76.",
      parents: [],
      spouse: "Clarence Meadows",
      children: ["p11"],
      spouseId: "p23"
    }

  ]
};

// Build a quick lookup map by ID
const MEMBER_MAP = {};
FAMILY_DATA.members.forEach(m => { MEMBER_MAP[m.id] = m; });

// Group members by generation
const BY_GENERATION = {};
FAMILY_DATA.members.forEach(m => {
  if (!BY_GENERATION[m.generation]) BY_GENERATION[m.generation] = [];
  BY_GENERATION[m.generation].push(m);
});
