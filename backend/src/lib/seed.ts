import {
  PrismaClient,
  Difficulty,
  Season,
  MealPlan,
  PaymentMethod,
  PaymentType,
  PaymentStatus,
  ProviderType,
  UserRole as Role,
  TrekStatus,
  AvailabilityStatus,
  BookingStatus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const hash = (p: string) => bcrypt.hashSync(p, 12)

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

const CATEGORIES = [
  { name: 'High Altitude Trek',  slug: 'high-altitude',  description: 'Treks reaching above 5,000m — only for experienced mountaineers.' },
  { name: 'Classic Trek',         slug: 'classic',         description: "Nepal's most iconic and well-trodden routes." },
  { name: 'Off the Beaten Path',  slug: 'off-beaten-path', description: 'Remote, restricted, or less-visited routes for adventurers.' },
  { name: 'Short Hike',           slug: 'short-hike',      description: 'Multi-day hikes under 7 days, ideal for beginners.' },
]

const TAGS = [
  'Everest Region', 'Annapurna Region', 'Langtang Region', 'Khumbu', 'Restricted Area',
  'Glacier Views', 'Buddhist Culture', 'Teahouse Trek', 'Camping Trek', 'Wildlife',
  'Sunrise View', 'Mountain Lakes',
]

const TREKS = [
  {
    slug: 'everest-base-camp',
    title: 'Everest Base Camp Trek',
    region: 'Khumbu',
    location: 'Lukla → Everest Base Camp → Lukla',
    startPoint: 'Lukla',
    endPoint: 'Lukla',
    difficulty: Difficulty.CHALLENGING,
    durationDays: 14,
    altitude: 5364,
    distanceKm: 130,
    priceUsd: 1850,
    priceNpr: 246550,
    bestSeason: [Season.SPRING, Season.AUTUMN],
    openMonths: [3, 4, 5, 9, 10, 11],
    latitude: 27.9881,
    longitude: 86.9250,
    permitRequired: true,
    permitName: 'Sagarmatha NP + TIMS',
    permitCost: 50,
    guideRequired: true,
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    ],
    description: "The Everest Base Camp Trek is the world's most famous high-altitude trekking route, drawing adventurers from every corner of the globe to stand at the foot of the planet's highest mountain. Over 14 extraordinary days, you'll journey through the heart of the Khumbu region, ascending from the airstrip at Lukla through Namche Bazaar, past ancient Tengboche Monastery, through the remote upper valley settlements of Dingboche and Lobuche, to finally reach Everest Base Camp itself at 5,364m.",
    highlights: [
      'Stand at Everest Base Camp (5,364m)',
      'Watch sunrise over Everest from Kala Patthar (5,545m)',
      'Explore Namche Bazaar — the legendary Sherpa capital',
      'Visit Tengboche Monastery',
      'Cross suspension bridges draped in prayer flags',
      'Experience authentic Sherpa teahouse hospitality',
    ],
    includes: [
      'Round-trip Kathmandu–Lukla flights',
      'All permits (Sagarmatha NP entry + TIMS card)',
      'Experienced licensed guide',
      'Porter (1 per 2 trekkers)',
      'All tea house accommodation',
      'Three meals per day on trail',
    ],
    excludes: [
      'International flights',
      'Travel & rescue insurance',
      'Personal trekking gear',
      'Tips for guide and porter',
      'Alcoholic beverages',
    ],
    requirements: [
      'Good physical fitness',
      'Previous hiking experience recommended',
      'Valid travel insurance with high-altitude rescue coverage',
    ],
    aiSummary: "The Everest Base Camp Trek is the definitive Himalayan pilgrimage — a 14-day journey through Nepal's Khumbu region to the foot of the world's highest mountain. Best in October–November and March–May. Two acclimatisation days are built in for altitudes exceeding 5,000m.",
    aiPackingList: [
      'Down jacket', 'Waterproof shell jacket & trousers', 'Base layers',
      'Trekking boots', 'Gaiters', 'Trekking socks', 'Sun hat', 'Trekking poles',
      'Headlamp', 'Sunscreen', 'Water purification', 'First aid kit',
    ],
    itinerary: [
      { dayNumber: 1, title: 'Fly Kathmandu → Lukla, Trek to Phakding', altitudeM: 2610, distanceKm: 8, accommodation: 'Phakding Tea House', meals: 'Lunch, Dinner', description: 'Scenic flight to Lukla then descend to Phakding along the Dudh Koshi river.', highlights: ['First suspension bridge', 'Dudh Koshi river valley'] },
      { dayNumber: 2, title: 'Phakding → Namche Bazaar', altitudeM: 3440, distanceKm: 11, accommodation: 'Namche Guesthouse', meals: 'Breakfast, Lunch, Dinner', description: 'Cross the Hillary Suspension Bridge and ascend to Namche Bazaar.', highlights: ['Hillary Suspension Bridge', 'First Everest glimpse'] },
      { dayNumber: 3, title: 'Namche Bazaar — Acclimatisation', altitudeM: 3440, distanceKm: 5, accommodation: 'Namche Guesthouse', meals: 'Breakfast, Dinner', description: 'Rest day with optional hike to Everest View Hotel.', highlights: ['Everest View Hotel'] },
      { dayNumber: 4, title: 'Namche → Tengboche', altitudeM: 3867, distanceKm: 10, accommodation: 'Tengboche Lodge', meals: 'Breakfast, Lunch, Dinner', description: 'Traverse with views of Ama Dablam to Tengboche Monastery.', highlights: ['Ama Dablam views', 'Tengboche Monastery'] },
      { dayNumber: 5, title: 'Tengboche → Dingboche', altitudeM: 4410, distanceKm: 11, accommodation: 'Dingboche Tea House', meals: 'Breakfast, Lunch, Dinner', description: 'Enter high-altitude tundra via Pangboche.', highlights: ['Pangboche Monastery'] },
      { dayNumber: 6, title: 'Dingboche — Acclimatisation', altitudeM: 4410, distanceKm: 6, accommodation: 'Dingboche Tea House', meals: 'Breakfast, Dinner', description: 'Hike Nangkartshang Peak for views.', highlights: ['Nangkartshang Peak'] },
      { dayNumber: 7, title: 'Dingboche → Lobuche', altitudeM: 4940, distanceKm: 10, accommodation: 'Lobuche Tea House', meals: 'Breakfast, Lunch, Dinner', description: 'Cross Khumbu Glacier moraine past climbers memorials.', highlights: ['Khumbu Glacier moraine'] },
      { dayNumber: 8, title: 'Lobuche → Everest Base Camp', altitudeM: 5364, distanceKm: 14, accommodation: 'Gorak Shep Tea House', meals: 'Breakfast, Lunch, Dinner', description: 'Reach Everest Base Camp.', highlights: ['Everest Base Camp'] },
      { dayNumber: 9, title: 'Kala Patthar Sunrise → Pheriche', altitudeM: 4280, distanceKm: 15, accommodation: 'Pheriche Tea House', meals: 'Breakfast, Lunch, Dinner', description: 'Predawn climb to Kala Patthar for sunrise.', highlights: ['Kala Patthar sunrise'] },
      { dayNumber: 10, title: 'Pheriche → Namche Bazaar', altitudeM: 3440, distanceKm: 20, accommodation: 'Namche Guesthouse', meals: 'Breakfast, Lunch, Dinner', description: 'Descend through familiar terrain.', highlights: ['Rapid descent'] },
      { dayNumber: 11, title: 'Namche → Lukla', altitudeM: 2860, distanceKm: 19, accommodation: 'Lukla Tea House', meals: 'Breakfast, Lunch, Dinner', description: 'Final trail day back to Lukla.', highlights: ['Final descent'] },
      { dayNumber: 12, title: 'Fly Lukla → Kathmandu', altitudeM: 1400, distanceKm: 0, accommodation: 'Kathmandu Hotel', meals: 'Breakfast', description: 'Morning flight back to Kathmandu.', highlights: ['Mountain flight'] },
    ],
    elevationPoints: [
      { dayNumber: 1, locationName: 'Lukla', altitudeM: 2860 },
      { dayNumber: 1, locationName: 'Phakding', altitudeM: 2610 },
      { dayNumber: 2, locationName: 'Namche Bazaar', altitudeM: 3440 },
      { dayNumber: 4, locationName: 'Tengboche', altitudeM: 3867 },
      { dayNumber: 5, locationName: 'Dingboche', altitudeM: 4410 },
      { dayNumber: 6, locationName: 'Nangkartshang', altitudeM: 5083 },
      { dayNumber: 7, locationName: 'Lobuche', altitudeM: 4940 },
      { dayNumber: 8, locationName: 'Base Camp', altitudeM: 5364 },
      { dayNumber: 9, locationName: 'Kala Patthar', altitudeM: 5545 },
    ],
    faqs: [
      { question: 'Do I need previous trekking experience?', answer: 'Experience is recommended but not mandatory. You should be comfortable hiking 5–7 hours daily.', sortOrder: 1 },
      { question: 'Is altitude sickness a concern?', answer: 'AMS is a real risk above 3,000m. Our itinerary includes two acclimatisation days and we carry pulse oximeters.', sortOrder: 2 },
    ],
    categorySlug: 'high-altitude',
    tagNames: ['Everest Region', 'Khumbu', 'Glacier Views', 'Teahouse Trek'],
  },
  {
    slug: 'annapurna-circuit',
    title: 'Annapurna Circuit Trek',
    region: 'Annapurna',
    location: 'Besisahar → Thorong La → Muktinath → Nayapul',
    startPoint: 'Besisahar',
    endPoint: 'Nayapul',
    difficulty: Difficulty.CHALLENGING,
    durationDays: 18,
    altitude: 5416,
    distanceKm: 230,
    priceUsd: 1650,
    priceNpr: 219780,
    bestSeason: [Season.SPRING, Season.AUTUMN],
    openMonths: [3, 4, 5, 9, 10, 11],
    latitude: 28.5971,
    longitude: 84.1167,
    permitRequired: true,
    permitName: 'ACAP + TIMS',
    permitCost: 45,
    guideRequired: false,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1605543667606-52b0bf0b402c?w=1200&q=80'],
    description: "The Annapurna Circuit is one of the greatest treks on earth — an 18-day odyssey circumnavigating the Annapurna massif, crossing the legendary Thorong La Pass at 5,416m and traversing six ecological zones from subtropical lowland to high-altitude Tibetan plateau.",
    highlights: [
      "Cross Thorong La Pass (5,416m)",
      'Visit Muktinath Temple',
      'Traverse six ecological zones',
      'Sunrise from Poon Hill',
      'Explore the walled city of Manang',
    ],
    includes: ['ACAP & TIMS permits', 'Certified guide', 'Porter', 'Tea house accommodation', 'All meals', 'Ground transport'],
    excludes: ['International flights', 'Travel insurance', 'Personal gear', 'Tips'],
    requirements: ['Good physical fitness', 'Multi-day trekking experience', 'Valid travel insurance'],
    aiSummary: "The Annapurna Circuit is trekking's greatest cross-cultural epic — 230km circling the Annapurna massif. Best in October–November and March–May. Suitable for fit, experienced trekkers.",
    aiPackingList: ['Down jacket', 'Waterproof gear', 'Trekking poles', 'Altitude medication', 'Gaiters'],
    itinerary: [
      { dayNumber: 1, title: 'Drive Kathmandu → Besisahar', altitudeM: 760, distanceKm: 175, accommodation: 'Besisahar Guesthouse', meals: 'Dinner', description: '6–7 hour drive to the trailhead.', highlights: ['Circuit trailhead start'] },
      { dayNumber: 5, title: 'Pisang → Manang', altitudeM: 3517, distanceKm: 18, accommodation: 'Manang Tea House', meals: 'Breakfast, Lunch, Dinner', description: 'Views of Annapurna III and Gangapurna.', highlights: ['Tilicho Peak view'] },
      { dayNumber: 9, title: 'Cross Thorong La Pass → Muktinath', altitudeM: 3800, distanceKm: 20, accommodation: 'Muktinath Tea House', meals: 'Breakfast, Lunch, Dinner', description: '3am departure to cross Thorong La.', highlights: ['Thorong La summit', 'Muktinath Temple'] },
    ],
    elevationPoints: [
      { dayNumber: 1, locationName: 'Besisahar', altitudeM: 760 },
      { dayNumber: 5, locationName: 'Manang', altitudeM: 3517 },
      { dayNumber: 9, locationName: 'Thorong La', altitudeM: 5416 },
      { dayNumber: 9, locationName: 'Muktinath', altitudeM: 3800 },
    ],
    faqs: [
      { question: 'Can I do the Annapurna Circuit without a guide?', answer: 'Yes — this is one of the few major treks in Nepal that does not require a mandatory guide.', sortOrder: 1 },
    ],
    categorySlug: 'classic',
    tagNames: ['Annapurna Region', 'Glacier Views', 'Buddhist Culture', 'Teahouse Trek'],
  },
  {
    slug: 'langtang-valley',
    title: 'Langtang Valley Trek',
    region: 'Langtang',
    location: 'Syabrubesi → Kyanjin Gompa → Syabrubesi',
    startPoint: 'Syabrubesi',
    endPoint: 'Syabrubesi',
    difficulty: Difficulty.MODERATE,
    durationDays: 10,
    altitude: 4984,
    distanceKm: 75,
    priceUsd: 890,
    priceNpr: 118580,
    bestSeason: [Season.SPRING, Season.AUTUMN, Season.WINTER],
    openMonths: [3, 4, 5, 9, 10, 11, 12],
    latitude: 28.2130,
    longitude: 85.5161,
    permitRequired: true,
    permitName: 'Langtang NP + TIMS',
    permitCost: 35,
    guideRequired: false,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    images: [],
    description: "The Langtang Valley Trek is Nepal's closest major trekking destination to Kathmandu, just 3 hours by road, yet delivers Himalayan scenery and cultural depth that rivals routes four times its distance.",
    highlights: ["One of Nepal's most accessible high-altitude valleys", 'Hike Tserko Ri (4,984m)', 'Visit Kyanjin Monastery', 'Tamang Buddhist culture'],
    includes: ['Langtang NP + TIMS permits', 'Guide', 'Porter', 'Tea house accommodation', 'All meals'],
    excludes: ['International flights', 'Insurance', 'Tips'],
    requirements: ['Moderate fitness', 'Valid travel insurance'],
    aiSummary: "Langtang is Nepal's ideal first Himalayan trek: close to Kathmandu, moderately challenging, culturally rich. Best October–November and March–May.",
    aiPackingList: ['Fleece jacket', 'Wind shell', 'Trekking boots', 'Water purification'],
    itinerary: [
      { dayNumber: 1, title: 'Drive Kathmandu → Syabrubesi', altitudeM: 1460, distanceKm: 117, accommodation: 'Syabrubesi Tea House', meals: 'Dinner', description: '7-hour scenic drive.', highlights: ['Trisuli river'] },
      { dayNumber: 4, title: 'Langtang → Kyanjin Gompa', altitudeM: 3817, distanceKm: 8, accommodation: 'Kyanjin Lodge', meals: 'Breakfast, Lunch, Dinner', description: 'Visit Kyanjin Monastery.', highlights: ['Kyanjin Monastery'] },
      { dayNumber: 5, title: 'Day Hike to Tserko Ri', altitudeM: 4984, distanceKm: 10, accommodation: 'Kyanjin Lodge', meals: 'Breakfast, Lunch, Dinner', description: 'Panoramic views of Langtang Lirung.', highlights: ['Tserko Ri summit'] },
    ],
    elevationPoints: [
      { dayNumber: 1, locationName: 'Syabrubesi', altitudeM: 1460 },
      { dayNumber: 4, locationName: 'Kyanjin', altitudeM: 3817 },
      { dayNumber: 5, locationName: 'Tserko Ri', altitudeM: 4984 },
    ],
    faqs: [
      { question: 'Is Langtang safe after the 2015 earthquake?', answer: 'Yes — the trail and villages have been fully rebuilt and are safe.', sortOrder: 1 },
    ],
    categorySlug: 'classic',
    tagNames: ['Langtang Region', 'Buddhist Culture', 'Wildlife', 'Teahouse Trek'],
  },
  {
    slug: 'manaslu-circuit',
    title: 'Manaslu Circuit Trek',
    region: 'Manaslu',
    location: 'Soti Khola → Larkya La → Dharapani',
    startPoint: 'Soti Khola',
    endPoint: 'Dharapani',
    difficulty: Difficulty.STRENUOUS,
    durationDays: 16,
    altitude: 5160,
    distanceKm: 177,
    priceUsd: 2200,
    priceNpr: 293040,
    bestSeason: [Season.SPRING, Season.AUTUMN],
    openMonths: [9, 10, 11, 3, 4, 5],
    latitude: 28.5500,
    longitude: 84.5600,
    permitRequired: true,
    permitName: 'Manaslu Restricted Area Permit + MCAP + TIMS',
    permitCost: 100,
    guideRequired: true,
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80',
    images: [],
    description: "The Manaslu Circuit is Nepal's premier next-level trek, circling Mt. Manaslu (8,163m) through a restricted-area permit zone, delivering the drama of the Annapurna Circuit as it existed 30 years ago.",
    highlights: ['Restricted-area trek', 'Cross Larkya La Pass (5,160m)', 'Remote Tibetan-influenced villages', 'Birendra Lake'],
    includes: ['All restricted area permits', 'Licensed guide', 'Porter', 'Tea house accommodation', 'All meals'],
    excludes: ['International flights', 'Insurance', 'Tips'],
    requirements: ['Previous high-altitude trekking experience', 'Strong fitness', 'Minimum 2 trekkers'],
    aiSummary: 'Manaslu is the Annapurna Circuit of 25 years ago: raw, remote, and revelatory. Larkya La (5,160m) rivals Thorong La for drama. Mandatory guide policy applies.',
    aiPackingList: ['Heavy down jacket', 'Crampons', 'Warm sleeping bag', 'Altitude medication'],
    itinerary: [
      { dayNumber: 1, title: 'Drive Kathmandu → Soti Khola', altitudeM: 710, distanceKm: 180, accommodation: 'Soti Khola Lodge', meals: 'Dinner', description: '7-hour drive to trailhead.', highlights: ['Remote trailhead'] },
      { dayNumber: 11, title: 'Cross Larkya La → Bimthang', altitudeM: 3590, distanceKm: 24, accommodation: 'Bimthang Tea House', meals: 'Breakfast, Lunch, Dinner', description: '3am start to cross Larkya La.', highlights: ['Larkya La (5,160m)'] },
    ],
    elevationPoints: [
      { dayNumber: 1, locationName: 'Soti Khola', altitudeM: 710 },
      { dayNumber: 7, locationName: 'Samagaon', altitudeM: 3520 },
      { dayNumber: 11, locationName: 'Larkya La', altitudeM: 5160 },
    ],
    faqs: [
      { question: 'What makes Manaslu a restricted area?', answer: 'Nepal restricts access to several border regions with China/Tibet, limiting daily visitors.', sortOrder: 1 },
    ],
    categorySlug: 'off-beaten-path',
    tagNames: ['Restricted Area', 'Glacier Views', 'Buddhist Culture', 'Wildlife'],
  },
  {
    slug: 'upper-mustang',
    title: 'Upper Mustang Trek — The Forbidden Kingdom',
    region: 'Mustang',
    location: 'Jomsom → Lo Manthang → Jomsom',
    startPoint: 'Jomsom',
    endPoint: 'Jomsom',
    difficulty: Difficulty.MODERATE,
    durationDays: 12,
    altitude: 3840,
    distanceKm: 150,
    priceUsd: 3100,
    priceNpr: 412940,
    bestSeason: [Season.SPRING, Season.SUMMER],
    openMonths: [5, 6, 7, 8, 9, 10],
    latitude: 29.1816,
    longitude: 83.9694,
    permitRequired: true,
    permitName: 'Upper Mustang Restricted Area Permit',
    permitCost: 500,
    guideRequired: true,
    imageUrl: 'https://images.unsplash.com/photo-1571306977140-b5aa64b2e19b?w=1200&q=80',
    images: [],
    description: "Upper Mustang is unlike anywhere else in Nepal — protected by the rain shadow, this high plateau is excellent in summer. The landscape is pure lunar theatre, with the walled city of Lo Manthang as its crowning jewel.",
    highlights: ['Lo Manthang walled city', '14th-century monasteries', 'Surreal Martian landscape', 'Summer trekking season'],
    includes: ['Restricted Area Permit', 'Liaison officer', 'Guide + porter', 'All accommodation', 'All meals'],
    excludes: ['International flights', 'Travel insurance', 'Tips'],
    requirements: ['Some trekking fitness', 'Insurance', 'Minimum 2 trekkers'],
    aiSummary: 'Upper Mustang offers a completely unique trekking experience: medieval Tibetan kingdom culture and Mars-like canyon country. Uniquely excellent in June–August.',
    aiPackingList: ['Sun protection', 'Dust mask', 'Wind shell', 'Sunscreen'],
    itinerary: [
      { dayNumber: 1, title: 'Fly Pokhara → Jomsom · Trek to Kagbeni', altitudeM: 2810, distanceKm: 10, accommodation: 'Kagbeni Guesthouse', meals: 'Lunch, Dinner', description: 'Mountain flight then walk to medieval Kagbeni.', highlights: ['Kagbeni medieval village'] },
      { dayNumber: 5, title: 'Arrive Lo Manthang', altitudeM: 3730, distanceKm: 16, accommodation: 'Lo Manthang Lodge', meals: 'Breakfast, Lunch, Dinner', description: 'Enter the walled city of Lo Manthang.', highlights: ['Lo Manthang walled city'] },
    ],
    elevationPoints: [
      { dayNumber: 1, locationName: 'Jomsom', altitudeM: 2720 },
      { dayNumber: 5, locationName: 'Lo Manthang', altitudeM: 3730 },
    ],
    faqs: [
      { question: 'Why is the permit $500?', answer: 'Nepal introduced the fee in 1992 to limit tourism and preserve the unique culture and ecology.', sortOrder: 1 },
    ],
    categorySlug: 'off-beaten-path',
    tagNames: ['Restricted Area', 'Buddhist Culture', 'Annapurna Region'],
  },
  {
    slug: 'gokyo-lakes-ri',
    title: 'Gokyo Lakes & Ri Trek',
    region: 'Khumbu',
    location: 'Lukla → Gokyo Ri → Renjo La → Lukla',
    startPoint: 'Lukla',
    endPoint: 'Lukla',
    difficulty: Difficulty.CHALLENGING,
    durationDays: 13,
    altitude: 5360,
    distanceKm: 110,
    priceUsd: 1550,
    priceNpr: 206490,
    bestSeason: [Season.SPRING, Season.AUTUMN],
    openMonths: [3, 4, 5, 9, 10, 11],
    latitude: 27.9600,
    longitude: 86.6700,
    permitRequired: true,
    permitName: 'Sagarmatha NP + TIMS',
    permitCost: 50,
    guideRequired: true,
    imageUrl: 'https://images.unsplash.com/photo-1562329265-95a6d7a83440?w=1200&q=80',
    images: [],
    description: "The Gokyo Lakes trek is widely cited as more visually spectacular than Everest Base Camp. At its heart lie five sacred glacial lakes set against the Ngozumpa Glacier, with Gokyo Ri offering views of four 8,000m peaks simultaneously.",
    highlights: ['Five sacred Gokyo Lakes', 'Gokyo Ri (5,360m): four 8,000m peaks', 'Ngozumpa Glacier', 'Less crowded than EBC'],
    includes: ['Permits', 'Guide', 'Porter', 'Tea house accommodation', 'All meals'],
    excludes: ['International flights', 'Insurance', 'Tips'],
    requirements: ['Good fitness', 'Prior high-altitude experience recommended'],
    aiSummary: 'Gokyo offers everything EBC does, plus the visual bonus of sacred lakes and Ngozumpa Glacier. The summit view from Gokyo Ri is arguably superior to Kala Patthar.',
    aiPackingList: ['Down jacket', 'Trekking poles', 'UV sunglasses', 'Gaiters'],
    itinerary: [
      { dayNumber: 1, title: 'Fly Kathmandu → Lukla → Phakding', altitudeM: 2610, distanceKm: 8, accommodation: 'Phakding Tea House', meals: 'Lunch, Dinner', description: 'Same start as EBC, branches at Namche.', highlights: ['Lukla flight'] },
      { dayNumber: 7, title: 'Hike Gokyo Ri', altitudeM: 5360, distanceKm: 8, accommodation: 'Gokyo Tea House', meals: 'Breakfast, Lunch, Dinner', description: 'Dawn ascent for the four-8,000er panorama.', highlights: ['Gokyo Ri (5,360m)'] },
    ],
    elevationPoints: [
      { dayNumber: 1, locationName: 'Phakding', altitudeM: 2610 },
      { dayNumber: 6, locationName: 'Gokyo', altitudeM: 4750 },
      { dayNumber: 7, locationName: 'Gokyo Ri', altitudeM: 5360 },
    ],
    faqs: [],
    categorySlug: 'high-altitude',
    tagNames: ['Everest Region', 'Khumbu', 'Mountain Lakes', 'Glacier Views', 'Teahouse Trek'],
  },
  {
    slug: 'annapurna-base-camp',
    title: 'Annapurna Base Camp Trek',
    region: 'Annapurna',
    location: 'Nayapul → Annapurna Base Camp → Nayapul',
    startPoint: 'Nayapul',
    endPoint: 'Nayapul',
    difficulty: Difficulty.MODERATE,
    durationDays: 11,
    altitude: 4130,
    distanceKm: 115,
    priceUsd: 1100,
    priceNpr: 146520,
    bestSeason: [Season.SPRING, Season.AUTUMN],
    openMonths: [3, 4, 5, 9, 10, 11],
    latitude: 28.5310,
    longitude: 83.8770,
    permitRequired: true,
    permitName: 'ACAP + TIMS',
    permitCost: 45,
    guideRequired: false,
    imageUrl: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&q=80',
    images: [],
    description: "The Annapurna Base Camp Trek ascends through the Modi Khola gorge into the Annapurna Sanctuary, a glacial amphitheatre ringed by Annapurna I, Machhapuchhare, Gangapurna, and Hiunchuli.",
    highlights: ['The Annapurna Sanctuary amphitheatre', "Machhapuchhare Fishtail Peak", 'Sunrise at ABC', 'Lower altitude than EBC'],
    includes: ['ACAP + TIMS permits', 'Guide', 'Porter', 'Tea houses', 'All meals'],
    excludes: ['International flights', 'Insurance', 'Tips'],
    requirements: ['Moderate fitness', 'No prior experience needed'],
    aiSummary: 'ABC is the best entry-level high-drama trek in Nepal. Lower altitude than EBC with equally iconic mountain scenery.',
    aiPackingList: ['Rain gear', 'Trekking poles', 'Warm layers', 'Sunscreen'],
    itinerary: [
      { dayNumber: 1, title: 'Drive Pokhara → Nayapul · Trek to Tikhedhunga', altitudeM: 1540, distanceKm: 10, accommodation: 'Tikhedhunga Tea House', meals: 'Dinner', description: 'Begin trekking through Gurung villages.', highlights: ['Gurung villages'] },
      { dayNumber: 7, title: 'MBC → Annapurna Base Camp', altitudeM: 4130, distanceKm: 7, accommodation: 'ABC Tea House', meals: 'Breakfast, Lunch, Dinner', description: 'Final ascent into the sanctuary.', highlights: ['Annapurna Sanctuary'] },
    ],
    elevationPoints: [
      { dayNumber: 1, locationName: 'Nayapul', altitudeM: 1070 },
      { dayNumber: 4, locationName: 'Poon Hill', altitudeM: 3210 },
      { dayNumber: 7, locationName: 'ABC', altitudeM: 4130 },
    ],
    faqs: [],
    categorySlug: 'classic',
    tagNames: ['Annapurna Region', 'Sunrise View', 'Teahouse Trek'],
  },
  {
    slug: 'poon-hill-ghorepani',
    title: 'Poon Hill & Ghorepani Trek',
    region: 'Annapurna',
    location: 'Nayapul → Ghorepani → Poon Hill → Nayapul',
    startPoint: 'Nayapul',
    endPoint: 'Nayapul',
    difficulty: Difficulty.EASY,
    durationDays: 5,
    altitude: 3210,
    distanceKm: 53,
    priceUsd: 450,
    priceNpr: 59940,
    bestSeason: [Season.SPRING, Season.AUTUMN, Season.WINTER],
    openMonths: [1, 2, 3, 4, 5, 9, 10, 11, 12],
    latitude: 28.4009,
    longitude: 83.7000,
    permitRequired: true,
    permitName: 'ACAP + TIMS',
    permitCost: 45,
    guideRequired: false,
    imageUrl: 'https://images.unsplash.com/photo-1534489468-96fd1c7a7cb3?w=1200&q=80',
    images: [],
    description: "The Poon Hill Trek is Nepal's most popular short trek. In 5 days, hike through rhododendron forests, ascend to Ghorepani, and make the classic dawn hike to Poon Hill for sunrise over Dhaulagiri and the Annapurna massif.",
    highlights: ['Poon Hill sunrise', 'Rhododendron forests', 'Gurung and Magar villages', 'Accessible from Pokhara'],
    includes: ['ACAP + TIMS permits', 'Guide optional', 'Tea houses', 'All meals'],
    excludes: ['International flights', 'Insurance', 'Tips'],
    requirements: ['Basic fitness — suitable for beginners'],
    aiSummary: "Poon Hill is Nepal's best short trek: accessible, reasonably priced, and visually stunning at dawn. Ideal for families and first-timers.",
    aiPackingList: ['Headlamp', 'Warm layer', 'Rain shell', 'Comfortable walking shoes'],
    itinerary: [
      { dayNumber: 1, title: 'Drive Pokhara → Nayapul · Trek to Tikhedhunga', altitudeM: 1540, distanceKm: 10, accommodation: 'Tikhedhunga Tea House', meals: 'Dinner', description: 'Easy riverside walk.', highlights: ['Modi Khola River'] },
      { dayNumber: 3, title: 'Poon Hill Sunrise · Trek to Tadapani', altitudeM: 2590, distanceKm: 8, accommodation: 'Tadapani Tea House', meals: 'Breakfast, Lunch, Dinner', description: '5am hike to Poon Hill for sunrise.', highlights: ['Poon Hill sunrise'] },
    ],
    elevationPoints: [
      { dayNumber: 2, locationName: 'Ghorepani', altitudeM: 2874 },
      { dayNumber: 3, locationName: 'Poon Hill', altitudeM: 3210 },
    ],
    faqs: [
      { question: 'Can I do Poon Hill without a guide?', answer: 'Yes — the circuit is well-marked and solo trekking is safe and common.', sortOrder: 1 },
    ],
    categorySlug: 'short-hike',
    tagNames: ['Annapurna Region', 'Sunrise View', 'Teahouse Trek'],
  },
  {
    slug: 'kanchenjunga-base-camp',
    title: 'Kanchenjunga Base Camp Trek',
    region: 'Kanchenjunga',
    location: 'Taplejung → North & South Base Camps → Taplejung',
    startPoint: 'Taplejung',
    endPoint: 'Taplejung',
    difficulty: Difficulty.EXTREME,
    durationDays: 22,
    altitude: 5143,
    distanceKm: 220,
    priceUsd: 2800,
    priceNpr: 372960,
    bestSeason: [Season.SPRING, Season.AUTUMN],
    openMonths: [3, 4, 5, 9, 10, 11],
    latitude: 27.7025,
    longitude: 88.1475,
    permitRequired: true,
    permitName: 'Kanchenjunga Conservation Area + Restricted Area Permit',
    permitCost: 120,
    guideRequired: true,
    imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80',
    images: [],
    description: "The Kanchenjunga Base Camp Trek is Nepal's ultimate wilderness trekking experience — a 22-day odyssey to the foot of the world's third-highest mountain in far eastern Nepal, one of the country's most remote corners.",
    highlights: ['Kanchenjunga North and South Base Camps', "World's third-highest mountain up close", "Nepal's least-visited major treks", 'Extraordinary biodiversity'],
    includes: ['All permits', 'Experienced guide', 'Porter', 'Camping & tea houses', 'All meals'],
    excludes: ['International flights', 'Insurance', 'Tips', 'Rescue insurance'],
    requirements: ['Expert fitness', 'Previous Himalayan experience mandatory', 'Minimum 2 trekkers'],
    aiSummary: 'Kanchenjunga is for serious, experienced Himalayan trekkers wanting genuinely remote territory. 22 days, extreme fitness required, mandatory guide.',
    aiPackingList: ['Expedition sleeping bag', 'High-altitude boots', 'Full camping kit', 'Medical kit'],
    itinerary: [
      { dayNumber: 1, title: 'Fly Kathmandu → Bhadrapur → Drive to Taplejung', altitudeM: 1820, distanceKm: 0, accommodation: 'Taplejung Guesthouse', meals: 'Dinner', description: 'Long travel day to far-eastern Nepal trailhead.', highlights: ['Remote trailhead'] },
      { dayNumber: 15, title: 'Kanchenjunga North Base Camp', altitudeM: 5143, distanceKm: 10, accommodation: 'Camp', meals: 'Breakfast, Lunch, Dinner', description: 'The pinnacle of the trek.', highlights: ['North Base Camp'] },
    ],
    elevationPoints: [
      { dayNumber: 1, locationName: 'Taplejung', altitudeM: 1820 },
      { dayNumber: 15, locationName: 'North BC', altitudeM: 5143 },
    ],
    faqs: [
      { question: 'Why is this ranked Extreme difficulty?', answer: 'The combination of 22 days of sustained remote trekking, high altitude, and limited rescue access makes this unsuitable for those without serious experience.', sortOrder: 1 },
    ],
    categorySlug: 'off-beaten-path',
    tagNames: ['Restricted Area', 'Glacier Views', 'Wildlife', 'Camping Trek'],
  },
  {
    slug: 'dolpo-shey-phoksundo',
    title: 'Dolpo & Shey Phoksundo Lake Trek',
    region: 'Dolpo',
    location: 'Juphal → Shey Phoksundo → Juphal',
    startPoint: 'Juphal',
    endPoint: 'Juphal',
    difficulty: Difficulty.STRENUOUS,
    durationDays: 14,
    altitude: 5090,
    distanceKm: 130,
    priceUsd: 2600,
    priceNpr: 346360,
    bestSeason: [Season.AUTUMN, Season.SPRING],
    openMonths: [9, 10, 11, 5, 6],
    latitude: 29.1000,
    longitude: 82.9500,
    permitRequired: true,
    permitName: 'Lower Dolpo Permit + ACAP',
    permitCost: 200,
    guideRequired: true,
    imageUrl: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200&q=80',
    images: [],
    description: "Dolpo is the setting of Peter Matthiessen's The Snow Leopard and one of earth's most otherworldly landscapes, preserving one of the most intact forms of Tibetan Buddhist culture remaining anywhere.",
    highlights: ["Shey Phoksundo Lake — Nepal's deepest lake", 'Tibetan Buddhist culture', 'Setting of The Snow Leopard', "Nepal's most remote treks"],
    includes: ['Lower Dolpo permits', 'Experienced guide', 'Porter', 'Camping equipment', 'All meals'],
    excludes: ['International flights', 'Insurance', 'Tips'],
    requirements: ['Strong fitness', 'Camping experience helpful', 'Previous trekking experience required'],
    aiSummary: 'Dolpo is for those who want to step entirely outside the modern world. Shey Phoksundo Lake alone justifies the journey. Best September–November.',
    aiPackingList: ['Full camping kit', 'Expedition sleeping bag', 'Trekking poles', 'Water filter'],
    itinerary: [
      { dayNumber: 1, title: 'Fly Kathmandu → Nepalgunj → Juphal', altitudeM: 2480, distanceKm: 0, accommodation: 'Juphal Guesthouse', meals: 'Dinner', description: "Two flights into one of Nepal's most remote airstrips.", highlights: ['Dolpo airstrip'] },
      { dayNumber: 5, title: 'Arrive Phoksundo Lake', altitudeM: 3611, distanceKm: 15, accommodation: 'Phoksundo Lodge', meals: 'Breakfast, Lunch, Dinner', description: 'First view of the turquoise lake.', highlights: ['Shey Phoksundo Lake'] },
    ],
    elevationPoints: [
      { dayNumber: 1, locationName: 'Juphal', altitudeM: 2480 },
      { dayNumber: 5, locationName: 'Phoksundo L', altitudeM: 3611 },
    ],
    faqs: [
      { question: 'What is "The Snow Leopard" book?', answer: 'A 1978 travel classic by Peter Matthiessen about a 1973 trek through Dolpo. Reading it deepens the experience.', sortOrder: 1 },
    ],
    categorySlug: 'off-beaten-path',
    tagNames: ['Restricted Area', 'Mountain Lakes', 'Buddhist Culture', 'Wildlife', 'Camping Trek'],
  },
]

async function main() {
  console.log('\n🌱  ExploreHimalaya — Database Seed Starting\n')
  console.log('═'.repeat(55))

  console.log('\n📂  Seeding categories…')
  const categoryMap: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    const c = await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat })
    categoryMap[cat.slug] = c.id
    console.log(`   ✓ ${cat.name}`)
  }

  console.log('\n🏷️   Seeding tags…')
  const tagMap: Record<string, string> = {}
  for (const name of TAGS) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const t = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } })
    tagMap[name] = t.id
  }
  console.log(`   ✓ ${TAGS.length} tags`)

  console.log('\n👤  Seeding users…')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@explorehimalaya.com' },
    update: {},
    create: { email: 'admin@explorehimalaya.com', passwordHash: hash('Admin1234!'), name: 'Platform Admin', role: Role.ADMIN, isActive: true, emailVerified: true },
  })
  console.log('   ✓ ADMIN    — admin@explorehimalaya.com  (Admin1234!)')

  const providerUser = await prisma.user.upsert({
    where: { email: 'summit@explorehimalaya.com' },
    update: {},
    create: { email: 'summit@explorehimalaya.com', passwordHash: hash('Provider1234!'), name: 'Summit Treks Nepal', role: Role.PROVIDER, isActive: true, emailVerified: true, phone: '+977-1-4701234' },
  })
  console.log('   ✓ PROVIDER — summit@explorehimalaya.com  (Provider1234!)')

  const providerUser2 = await prisma.user.upsert({
    where: { email: 'himalayan@explorehimalaya.com' },
    update: {},
    create: { email: 'himalayan@explorehimalaya.com', passwordHash: hash('Provider1234!'), name: 'Himalayan Expedition Co.', role: Role.PROVIDER, isActive: true, emailVerified: true },
  })
  console.log('   ✓ PROVIDER — himalayan@explorehimalaya.com  (Provider1234!)')

  const traveler = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: { email: 'alex@example.com', passwordHash: hash('Traveler1234!'), name: 'Alex Trekker', displayName: 'Alex T.', nationality: 'DE', role: Role.TRAVELER, isActive: true, emailVerified: true, newsletterOptIn: true },
  })
  console.log('   ✓ TRAVELER — alex@example.com  (Traveler1234!)')

  console.log('\n🏢  Seeding provider profiles…')
  const provider1 = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id, companyName: 'Summit Treks Nepal Pvt. Ltd.', providerType: ProviderType.TREKKING_AGENCY,
      licenseNumber: 'NTB-REG-2008-0047', licenseExpiry: new Date('2026-12-31'), isVerified: true,
      verifiedAt: new Date('2024-01-15'), verifiedBy: admin.id,
      description: "Nepal's premier Himalayan trekking company with 15 years of experience.",
      establishedYear: 2008, city: 'Kathmandu', province: 'Bagmati', address: 'Thamel, Kathmandu',
      latitude: 27.7151, longitude: 85.3123, websiteUrl: 'https://summittrekkinnepal.com', totalTreks: 6,
    },
  })

  const provider2 = await prisma.provider.upsert({
    where: { userId: providerUser2.id },
    update: {},
    create: {
      userId: providerUser2.id, companyName: 'Himalayan Expedition Co.', providerType: ProviderType.TREKKING_AGENCY,
      licenseNumber: 'NTB-REG-2015-0203', isVerified: true, verifiedAt: new Date('2024-02-01'), verifiedBy: admin.id,
      description: 'Specialists in off-the-beaten-path treks and restricted area expeditions.',
      establishedYear: 2015, city: 'Kathmandu', province: 'Bagmati', totalTreks: 4,
    },
  })
  console.log('   ✓ Summit Treks Nepal Pvt. Ltd.')
  console.log('   ✓ Himalayan Expedition Co.')

  console.log('\n🏔️   Seeding treks…')
  const providerAssignment: Record<string, typeof provider1> = {
    'everest-base-camp': provider1, 'annapurna-circuit': provider1, 'langtang-valley': provider1,
    'gokyo-lakes-ri': provider1, 'annapurna-base-camp': provider1, 'poon-hill-ghorepani': provider1,
    'manaslu-circuit': provider2, 'upper-mustang': provider2, 'kanchenjunga-base-camp': provider2, 'dolpo-shey-phoksundo': provider2,
  }

  const trekIds: Record<string, string> = {}

  for (const t of TREKS) {
    const provider = providerAssignment[t.slug] ?? provider1
    const categoryId = t.categorySlug ? categoryMap[t.categorySlug] : undefined

    await prisma.itinerary.deleteMany({ where: { trek: { slug: t.slug } } })
    await prisma.elevationPoint.deleteMany({ where: { trek: { slug: t.slug } } })
    await prisma.trekFAQ.deleteMany({ where: { trek: { slug: t.slug } } })
    await prisma.trekTag.deleteMany({ where: { trek: { slug: t.slug } } })

    const trek = await prisma.trek.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title, description: t.description, aiSummary: t.aiSummary, aiPackingList: t.aiPackingList,
        priceUsd: t.priceUsd, status: TrekStatus.ACTIVE,
        avgRating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
        totalReviews: Math.floor(50 + Math.random() * 2000),
      },
      create: {
        slug: t.slug, title: t.title, status: TrekStatus.ACTIVE, description: t.description,
        highlights: t.highlights, includes: t.includes, excludes: t.excludes, requirements: t.requirements,
        region: t.region, location: t.location, startPoint: t.startPoint, endPoint: t.endPoint,
        latitude: t.latitude, longitude: t.longitude, difficulty: t.difficulty, durationDays: t.durationDays,
        altitude: t.altitude, distanceKm: t.distanceKm, priceUsd: t.priceUsd, priceNpr: t.priceNpr,
        depositPercent: 20, mealPlan: MealPlan.FULL_BOARD, bestSeason: t.bestSeason, openMonths: t.openMonths,
        minGroupSize: 1, maxGroupSize: 16, permitRequired: t.permitRequired, permitName: t.permitName,
        permitCost: t.permitCost, guideRequired: t.guideRequired, porterAvailable: true,
        imageUrl: t.imageUrl, images: t.images, aiSummary: t.aiSummary, aiPackingList: t.aiPackingList,
        providerId: provider.id, categoryId,
        avgRating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
        totalReviews: Math.floor(50 + Math.random() * 2000),
        totalBookings: Math.floor(20 + Math.random() * 500),
      },
    })

    trekIds[t.slug] = trek.id

    if (t.itinerary.length > 0) {
      await prisma.itinerary.createMany({
        data: t.itinerary.map((day) => ({
          trekId: trek.id, dayNumber: day.dayNumber, title: day.title, description: day.description,
          distanceKm: day.distanceKm, altitudeM: day.altitudeM, accommodation: day.accommodation,
          meals: day.meals, highlights: day.highlights ?? [],
        })),
        skipDuplicates: true,
      })
    }

    if (t.elevationPoints.length > 0) {
      await prisma.elevationPoint.createMany({
        data: t.elevationPoints.map((ep) => ({ trekId: trek.id, dayNumber: ep.dayNumber, locationName: ep.locationName, altitudeM: ep.altitudeM })),
        skipDuplicates: true,
      })
    }

    if (t.faqs.length > 0) {
      await prisma.trekFAQ.createMany({
        data: t.faqs.map((f) => ({ trekId: trek.id, question: f.question, answer: f.answer, sortOrder: f.sortOrder })),
        skipDuplicates: true,
      })
    }

    for (const tagName of t.tagNames) {
      const tagId = tagMap[tagName]
      if (tagId) {
        await prisma.trekTag.upsert({
          where: { trekId_tagId: { trekId: trek.id, tagId } },
          update: {},
          create: { trekId: trek.id, tagId },
        })
      }
    }

    console.log(`   ✓ ${t.title.padEnd(45)} ($${t.priceUsd})`)
  }

  console.log('\n📅  Seeding availability windows…')
  let availCount = 0
  for (const [slug, trekId] of Object.entries(trekIds)) {
    const trek = TREKS.find((t) => t.slug === slug)!
    for (let monthOffset = 1; monthOffset <= 6; monthOffset++) {
      const startDate = addMonths(TODAY, monthOffset)
      startDate.setDate(1)
      const endDate = addDays(startDate, trek.durationDays)
      const startMonth = startDate.getMonth() + 1
      if (!trek.openMonths.includes(startMonth)) continue

      await prisma.availability.upsert({
        where: { trekId_startDate: { trekId, startDate } },
        update: {},
        create: { trekId, startDate, endDate, totalSlots: 16, bookedSlots: Math.floor(Math.random() * 8), status: AvailabilityStatus.OPEN, isActive: true },
      })
      availCount++
    }
  }
  console.log(`   ✓ ${availCount} availability windows created`)

  console.log('\n📋  Seeding sample bookings…')
  const ebcId = trekIds['everest-base-camp']
  const poonId = trekIds['poon-hill-ghorepani']

  const ebcAvail = await prisma.availability.findFirst({ where: { trekId: ebcId, isActive: true }, orderBy: { startDate: 'asc' } })

  const booking1 = await prisma.booking.upsert({
    where: { reference: 'EH-2024-SEED001' },
    update: {},
    create: {
      reference: 'EH-2024-SEED001', userId: traveler.id, trekId: ebcId, availabilityId: ebcAvail?.id,
      startDate: ebcAvail?.startDate ?? addMonths(TODAY, 2), groupSize: 2, mealPlan: MealPlan.FULL_BOARD,
      unitPriceUsd: 1850, subtotalUsd: 3700, discountUsd: 0, taxUsd: 0, totalUsd: 3700, paidAmountUsd: 740,
      status: BookingStatus.CONFIRMED, paymentStatus: PaymentStatus.PARTIALLY_PAID,
      guestName: 'Alex Trekker', guestEmail: 'alex@example.com', guestPhone: '+49-176-12345678',
      guestNationality: 'DE', specialRequests: 'Vegetarian meals please. First time at altitude.', confirmedAt: new Date(),
    },
  })

  await prisma.payment.upsert({
    where: { gatewayTxId: 'stripe_txn_seed_001' },
    update: {},
    create: { bookingId: booking1.id, userId: traveler.id, amountUsd: 740, paymentType: PaymentType.DEPOSIT, paymentMethod: PaymentMethod.CREDIT_CARD, status: PaymentStatus.PAID, gatewayName: 'Stripe', gatewayTxId: 'stripe_txn_seed_001', paidAt: new Date() },
  })

  const booking2 = await prisma.booking.upsert({
    where: { reference: 'EH-2024-SEED002' },
    update: {},
    create: {
      reference: 'EH-2024-SEED002', userId: traveler.id, trekId: poonId, startDate: addMonths(TODAY, 1),
      groupSize: 3, mealPlan: MealPlan.FULL_BOARD, unitPriceUsd: 450, subtotalUsd: 1350, discountUsd: 50,
      taxUsd: 0, totalUsd: 1300, paidAmountUsd: 1300, status: BookingStatus.CONFIRMED, paymentStatus: PaymentStatus.PAID,
      guestName: 'Alex Trekker', guestEmail: 'alex@example.com', confirmedAt: new Date(),
    },
  })

  await prisma.payment.upsert({
    where: { gatewayTxId: 'khalti_txn_seed_002' },
    update: {},
    create: { bookingId: booking2.id, userId: traveler.id, amountUsd: 1300, paymentType: PaymentType.FULL, paymentMethod: PaymentMethod.KHALTI, status: PaymentStatus.PAID, gatewayName: 'Khalti', gatewayTxId: 'khalti_txn_seed_002', paidAt: new Date() },
  })

  console.log('   ✓ Booking EH-2024-SEED001 — EBC (2 pax, deposit paid)')
  console.log('   ✓ Booking EH-2024-SEED002 — Poon Hill (3 pax, fully paid)')

  console.log('\n⭐  Seeding reviews…')
  const reviewData = [
    {
      trekSlug: 'everest-base-camp',
      title: 'Changed my life. No hyperbole.',
      body: "I've trekked in the Alps, Patagonia, and the Rockies — nothing prepared me for EBC. The scale of the mountains and the totality of the experience made this the trip of a lifetime.",
      overallRating: 5, sceneryRating: 5, guideRating: 5, valueRating: 4, difficultyRating: 5, safetyRating: 5, isFeatured: true,
    },
    {
      trekSlug: 'annapurna-circuit',
      title: 'Thorong La at dawn — unforgettable',
      body: "The Annapurna Circuit is the best 18 days I've ever spent anywhere. Thorong La at 4am with headtorches and Manaslu glowing pink on the horizon will stay with me forever.",
      overallRating: 5, sceneryRating: 5, guideRating: 4, valueRating: 5, difficultyRating: 4, safetyRating: 5, isFeatured: true,
    },
    {
      trekSlug: 'langtang-valley',
      title: 'Perfect for a first Himalayan trek',
      body: "I chose Langtang as my introduction to Nepal trekking and couldn't be happier. Close to Kathmandu, manageable altitude, beautiful Tamang culture.",
      overallRating: 4, sceneryRating: 5, guideRating: 4, valueRating: 5, difficultyRating: 3, safetyRating: 4, isFeatured: false,
    },
  ]

  for (const r of reviewData) {
    const trekId = trekIds[r.trekSlug]
    if (!trekId) continue
    await prisma.review.upsert({
      where: { userId_trekId: { userId: traveler.id, trekId } },
      update: {},
      create: {
        userId: traveler.id, trekId, overallRating: r.overallRating, sceneryRating: r.sceneryRating,
        guideRating: r.guideRating, valueRating: r.valueRating, difficultyRating: r.difficultyRating,
        safetyRating: r.safetyRating, title: r.title, body: r.body, isVerified: false, isVisible: true,
        isFeatured: r.isFeatured, helpfulVotes: Math.floor(10 + Math.random() * 200),
      },
    })
    console.log(`   ✓ Review on "${r.trekSlug}"`)
  }

  console.log('\n🎟️   Seeding promo codes…')
  await prisma.promoCode.upsert({
    where: { code: 'HIMALAYA10' },
    update: {},
    create: { code: 'HIMALAYA10', description: '10% off all treks — launch promotion', discountPercent: 10, maxUses: 500, validFrom: new Date('2024-01-01'), validUntil: new Date('2025-12-31'), isActive: true },
  })
  await prisma.promoCode.upsert({
    where: { code: 'EBC2024' },
    update: {},
    create: { code: 'EBC2024', description: '$200 off Everest Base Camp — autumn special', discountFixed: 200, maxUses: 100, minBookingUsd: 1800, validFrom: new Date('2024-09-01'), validUntil: new Date('2024-11-30'), isActive: true, trekIds: [trekIds['everest-base-camp']] },
  })
  console.log('   ✓ HIMALAYA10 (10% off all treks)')
  console.log('   ✓ EBC2024    ($200 off EBC)')

  await prisma.wishlistItem.upsert({
    where: { userId_trekId: { userId: traveler.id, trekId: trekIds['upper-mustang'] } },
    update: {},
    create: { userId: traveler.id, trekId: trekIds['upper-mustang'], notes: 'Dream trek for 2025!' },
  })
  await prisma.wishlistItem.upsert({
    where: { userId_trekId: { userId: traveler.id, trekId: trekIds['gokyo-lakes-ri'] } },
    update: {},
    create: { userId: traveler.id, trekId: trekIds['gokyo-lakes-ri'] },
  })
  console.log('\n💫  Added 2 wishlist items for Alex Trekker')

  console.log('\n' + '═'.repeat(55))
  console.log('✅  SEED COMPLETE\n')
  console.log('  Users      : 4 (1 admin, 2 providers, 1 traveler)')
  console.log('  Providers  : 2')
  console.log('  Categories : 4')
  console.log('  Tags       : 12')
  console.log(`  Treks      : ${TREKS.length}`)
  console.log(`  Avail.     : ${availCount} windows`)
  console.log('  Bookings   : 2 (with payments)')
  console.log('  Reviews    : 3')
  console.log('  Promo codes: 2\n')
  console.log('Test credentials:')
  console.log('  admin@explorehimalaya.com     Admin1234!')
  console.log('  summit@explorehimalaya.com    Provider1234!')
  console.log('  himalayan@explorehimalaya.com Provider1234!')
  console.log('  alex@example.com              Traveler1234!')
  console.log('')
}

main()
  .catch((e) => {
    console.error('\n❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())