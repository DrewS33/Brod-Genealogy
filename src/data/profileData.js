// ============================================================
//  PROFILE DATA — stories and media uploads per person
//  This extends sampleData.js with collaborative content
//  that can be edited in-memory and later persisted to a backend.
// ============================================================

// ── STORIES ─────────────────────────────────────────────────
// Each story belongs to a person via personId.
// Tags are freeform strings for filtering.
export const STORIES = [
  {
    id: 'S001',
    personId: 'P001',
    title: 'The Crossing from Liverpool',
    content: `William always told the same story about the SS Providence. Thirty-two days at sea, he said, and not one of them easy. He had packed his father's tool kit, a single change of clothes, and a worn Bible. On the twenty-eighth day a storm came up that broke two of the masts and sent half the passengers below decks in terror.

William said he stayed on deck, lashing himself to a rail and watching the waves. When his children asked why, he would say, simply, "I wanted to see what God was doing." He arrived in Boston Harbor on a bright March morning in 1847 with four shillings and the firm conviction that America would either make him or finish what the storm had started.`,
    author: 'Robert Brod',
    authorNote: 'As told to his son Robert, transcribed 1893',
    date: '1893-01-01',
    tags: ['immigration', 'sea voyage', 'family legend', 'William'],
  },
  {
    id: 'S002',
    personId: 'P001',
    title: 'The Night the Ledger Burned',
    content: `In the winter of 1858 a fire broke out in the warehouse district near Commercial Wharf, destroying three buildings including the storage annex of Brod & Sons. William lost nearly a year of inventory records. His wife Mary Ann later wrote that he did not sleep for two days afterward — not from grief, she said, but because he was reconstructing every transaction from memory.

He filled six notebooks in those two sleepless days. The reconstructed ledger, still in the family's possession, is written in a different hand than his normal meticulous script — larger, more urgent, but still perfectly accurate according to the insurance claims he filed afterward.`,
    author: 'Mary Ann Brod',
    authorNote: 'From Mary Ann\'s letter to her sister, dated February 1858',
    date: '1858-02-01',
    tags: ['business', 'fire', 'resilience', 'Boston', 'Brod & Sons'],
  },
  {
    id: 'S003',
    personId: 'P008',
    title: 'The Depression Years at the Bank',
    content: `George kept a private journal during the worst years of the Depression, 1931 through 1934. He never published it or showed it to anyone while he lived. His daughter Eleanor found it after his death in 1944, tucked inside a copy of Adam Smith's Wealth of Nations in his study.

The entries are careful and measured — a banker's prose — but the weight shows through. On October 4, 1931, he wrote: "Refused two loan extensions today that I know will end men's businesses. I do not know if I am being prudent or merely cruel. The line between the two has never felt thinner."

He ultimately guided First National through the crisis without a single bank failure. His board later said he had held the institution together by force of will. Reading his journal, you understand the cost.`,
    author: 'Eleanor Brod-Morrison',
    authorNote: 'Written by George\'s daughter after reading his private journals',
    date: '1945-03-15',
    tags: ['Great Depression', 'banking', 'leadership', 'private journal'],
  },
  {
    id: 'S004',
    personId: 'P008',
    title: 'The Piano at Commonwealth Avenue',
    content: `Every Sunday morning without exception, from the time Agnes was well enough to play until the week before she died, there was music in the house on Commonwealth Avenue. Agnes was the pianist — Clara Müller's daughter-in-law had inherited Clara's gift for the instrument — and she would play for an hour before breakfast while George read the Globe.

The children were not required to attend but almost always did. Charles later said that those Sunday mornings were the clearest memories he had of his childhood: the smell of coffee, the sound of Schubert, his father reading in the high-backed chair by the window, the morning light coming through the lace curtains.`,
    author: 'Charles Brod',
    authorNote: 'From Charles Brod\'s unpublished memoir draft, c. 1960',
    date: '1960-01-01',
    tags: ['family life', 'music', 'Sunday', 'childhood memory', 'Commonwealth Avenue'],
  },
  {
    id: 'S005',
    personId: 'P017',
    title: 'Growing Up Between Two Worlds',
    content: `My grandmother Agnes used to say that our family was "a committee of nations." She meant it as a joke, but she wasn't wrong. By the time I was born there was English and German and Polish and Chinese in the family tree, threaded together through a century of Boston life.

What I remember most from childhood is the food. Christmas at the Brod house meant my great-aunt would make German Stollen alongside Kowalski pierogi alongside whatever Agnes had sourced from Chinatown. Nobody ever thought this was unusual. It was just how we ate.`,
    author: 'The Archive',
    authorNote: 'Contributed to the family archive, 2019',
    date: '2019-05-10',
    tags: ['childhood', 'family culture', 'food', 'multicultural', 'memory'],
  },
  {
    id: 'S006',
    personId: 'P005',
    title: 'Clara\'s Recipe Book',
    content: `Clara Müller kept her recipes in a cloth-bound notebook she had brought from Cincinnati. The notebook is written in a mixture of German and English — German for the German dishes she had learned from her mother Rosalinde, English for the American recipes she picked up after settling in Boston.

The opening page bears an inscription in her handwriting: "Für meine Kinder und Kindeskinder" — for my children and grandchildren. The notebook passed from Clara to her daughter-in-law Agnes, and eventually to the family archive, where it remains one of the most treasured objects in the collection.`,
    author: 'Family Archive',
    authorNote: 'Catalog entry, Family Archive Collection',
    date: '2010-06-01',
    tags: ['recipe book', 'German heritage', 'artifact', 'Clara', 'family heirloom'],
  },
]

// ── UPLOADS ─────────────────────────────────────────────────
// type: 'picture' | 'video' | 'document'
// Tags are freeform for flexible filtering.
export const UPLOADS = [
  {
    id: 'U001',
    personId: 'P001',
    type: 'document',
    title: 'Immigration Record — SS Providence, 1847',
    description: 'Passenger manifest entry for William Brod, age 24, occupation Merchant, sailing from Liverpool. Handwritten in ink, partially faded.',
    url: null,
    thumbnailUrl: null,
    tags: ['immigration', 'primary source', 'ship record', '1847'],
    uploadedBy: 'Archive Admin',
    uploadDate: '2018-04-15',
  },
  {
    id: 'U002',
    personId: 'P001',
    type: 'document',
    title: 'Brod & Sons Business License, 1850',
    description: 'Original business license issued by the City of Boston authorizing William Brod to operate an import and dry goods concern.',
    url: null,
    thumbnailUrl: null,
    tags: ['business', 'legal document', '1850', 'primary source'],
    uploadedBy: 'Archive Admin',
    uploadDate: '2018-04-15',
  },
  {
    id: 'U003',
    personId: 'P001',
    type: 'picture',
    title: 'William Brod — Carte de Visite, c. 1865',
    description: 'A studio portrait taken shortly after William\'s return from military service. He wears a dark frock coat and holds a book. The photograph is mounted on cardboard in the style of the period.',
    url: null,
    thumbnailUrl: null,
    tags: ['portrait', 'Civil War era', 'studio photograph', 'c.1865'],
    uploadedBy: 'Archive Admin',
    uploadDate: '2018-04-15',
  },
  {
    id: 'U004',
    personId: 'P008',
    type: 'picture',
    title: 'George Brod — Bank Portrait, c. 1920',
    description: 'Official portrait painted when George assumed the presidency of First National Bank of Boston. Oil on canvas, now hangs in the bank lobby.',
    url: null,
    thumbnailUrl: null,
    tags: ['portrait', 'oil painting', 'banking', '1920s'],
    uploadedBy: 'Archive Admin',
    uploadDate: '2019-02-10',
  },
  {
    id: 'U005',
    personId: 'P008',
    type: 'picture',
    title: 'George & Agnes — Wedding Day, 1898',
    description: 'A formal studio photograph taken on the day of their wedding at St. Paul\'s Cathedral. Agnes is in a white satin gown; George wears a morning coat. The photograph is in excellent condition.',
    url: null,
    thumbnailUrl: null,
    tags: ['wedding', 'portrait', '1898', 'Agnes', 'George'],
    uploadedBy: 'Eleanor Brod-Morrison',
    uploadDate: '2019-02-10',
  },
  {
    id: 'U006',
    personId: 'P008',
    type: 'document',
    title: 'Private Journal — Depression Years, 1931–1934',
    description: 'Scanned pages from George\'s private journal kept during the Great Depression. Handwritten in black ink, 214 pages total. Access restricted to family members.',
    url: null,
    thumbnailUrl: null,
    tags: ['journal', 'Great Depression', 'private', 'primary source'],
    uploadedBy: 'Eleanor Brod-Morrison',
    uploadDate: '2019-02-10',
  },
  {
    id: 'U007',
    personId: 'P008',
    type: 'video',
    title: 'George Brod — Oral History Interview (1940)',
    description: 'A rare 16mm film recording of George speaking at a Harvard alumni event, 1940. Approximately 8 minutes. Discusses his early career and the Depression years. Film digitized by the Harvard Film Archive.',
    url: null,
    thumbnailUrl: null,
    tags: ['interview', 'oral history', 'Harvard', '1940', 'film'],
    uploadedBy: 'Charles Brod III',
    uploadDate: '2021-09-01',
  },
  {
    id: 'U008',
    personId: 'P005',
    type: 'document',
    title: 'Clara\'s Recipe Book (German/English)',
    description: 'Full scan of Clara\'s cloth-bound recipe notebook. 48 pages, written in German and English. Recipes include Stollen, Lebkuchen, Boston brown bread, and fish chowder.',
    url: null,
    thumbnailUrl: null,
    tags: ['recipe book', 'German', 'artifact', 'primary source', 'food'],
    uploadedBy: 'Archive Admin',
    uploadDate: '2018-06-01',
  },
  {
    id: 'U009',
    personId: 'P005',
    type: 'picture',
    title: 'Clara Müller-Brod — Studio Portrait, c. 1880',
    description: 'A formal portrait of Clara in her mid-thirties. She is seated at what appears to be a piano keyboard just outside the frame. Photographer unknown, Back Bay studio.',
    url: null,
    thumbnailUrl: null,
    tags: ['portrait', 'studio photograph', 'c.1880', 'piano'],
    uploadedBy: 'Archive Admin',
    uploadDate: '2018-06-01',
  },
  {
    id: 'U010',
    personId: 'P017',
    type: 'picture',
    title: 'Brod Family Reunion, Beacon Hill — 1955',
    description: 'A group photograph taken on the steps of the Commonwealth Avenue house. Approximately 35 family members across four generations. Names identified on reverse.',
    url: null,
    thumbnailUrl: null,
    tags: ['family gathering', 'reunion', '1955', 'group photo', 'Beacon Hill'],
    uploadedBy: 'Archive Admin',
    uploadDate: '2020-01-15',
  },
  {
    id: 'U011',
    personId: 'P017',
    type: 'video',
    title: 'Family Home Movies — Summer 1962',
    description: 'Super 8 film footage of a summer gathering at the Cape Cod house. Approximately 12 minutes. Shows children playing, a lobster bake, and an impromptu softball game on the lawn.',
    url: null,
    thumbnailUrl: null,
    tags: ['home movie', 'Cape Cod', '1962', 'family gathering', 'summer'],
    uploadedBy: 'Charles Brod III',
    uploadDate: '2021-09-01',
  },
]
