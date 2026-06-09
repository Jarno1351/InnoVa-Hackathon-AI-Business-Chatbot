export const initialChatHistory = [
  {
    id: crypto.randomUUID(),
    title: 'finding a keyboard',
    time: '2 hours ago',
    messages: [
      { sender: 'user', text: 'where can i find an affordable keyboard?' },
      { sender: 'bot', text: 'Here are registered shops that have keyboards. Open the recommendations panel to view supplier details.' }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'finding a table',
    time: '2 hours ago',
    messages: [
      { sender: 'user', text: 'I need a study table' },
      { sender: 'bot', text: 'I can help you find local furniture shops.' }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'phone charger options',
    time: 'Yesterday',
    messages: [
      { sender: 'user', text: 'Where can I buy a type-c charger?' },
      { sender: 'bot', text: 'I found gadget shops that may carry type-c chargers.' }
    ]
  }
];

export const fallbackShops = [
  {
    id: 1,
    name: 'KeyCraft Hub',
    description: 'Premium peripherals, compact keyboards, and custom computer accessories.',
    category: 'Computer Peripherals',
    match: 'Mechanical keyboard match',
    rating: 4.9,
    reviews: 120,
    address: 'Door 3, Valencia Tech Arcade, Poblacion, Valencia City, Bukidnon',
    availability: 'Open now',
    icon: '▤',
    product: {
      name: 'Affordable Mechanical Keyboard',
      description: 'Compact 75% mechanical keyboard recommended for students, gaming, and typing. A strong match for users looking for an affordable keyboard from a verified local supplier.',
      price: '₱899',
      oldPrice: '₱1,099',
      rating: 4.9,
      reviews: 120,
      imageIcon: '▤',
      specs: ['Compact 75% mechanical layout', 'Linear smooth red switches', 'Customizable RGB backlight', 'Detachable braided USB Type-C cable'],
      supplierContact: 'Contact placeholder: 09XX-XXX-XXXX'
    }
  },
  {
    id: 2,
    name: 'Campus Gadget Hub',
    description: 'Budget-friendly gadgets, chargers, earphones, mice, and keyboards for students.',
    category: 'Gadgets & Accessories',
    match: 'Budget keyboard supplier',
    rating: 4.7,
    reviews: 86,
    address: 'Ground Floor, Student Commercial Lane, Central Mindanao University, Maramag, Bukidnon',
    availability: 'Available',
    icon: '▧',
    product: {
      name: 'Student Budget Keyboard',
      description: 'Entry-level keyboard for school work, online classes, and casual gaming. Recommended when the user needs a low-cost local option.',
      price: '₱550',
      oldPrice: '₱699',
      rating: 4.7,
      reviews: 86,
      imageIcon: '▧',
      specs: ['Full-size keyboard', 'Quiet membrane keys', 'USB wired connection', 'Suitable for school and office tasks'],
      supplierContact: 'Contact placeholder: campus-gadget@example.com'
    }
  },
  {
    id: 3,
    name: 'TechZone Local',
    description: 'Local electronics supplier selling computer accessories and mobile essentials.',
    category: 'Electronics Store',
    match: 'RGB gaming keyboard match',
    rating: 4.8,
    reviews: 104,
    address: '2nd Floor, Mercado Building, Sayre Highway, Valencia City, Bukidnon',
    availability: 'In stock',
    icon: '⌘',
    product: {
      name: 'RGB Gaming Keyboard',
      description: 'Affordable RGB keyboard for gaming setups. Recommended for users asking for keyboard options with better visual style.',
      price: '₱750',
      oldPrice: '₱950',
      rating: 4.8,
      reviews: 104,
      imageIcon: '⌘',
      specs: ['RGB lighting modes', 'Anti-ghosting support', 'Durable plastic frame', 'Wired USB connection'],
      supplierContact: 'Contact placeholder: TechZone front desk'
    }
  },
  {
    id: 4,
    name: 'Local Office Supply Co.',
    description: 'Office and study essentials including tables, chairs, stationery, and basic devices.',
    category: 'Office & School Supplies',
    match: 'Basic office keyboard match',
    rating: 4.6,
    reviews: 72,
    address: 'Unit 5, City Commercial Complex, Quezon Street, Valencia City, Bukidnon',
    availability: 'Open until 8 PM',
    icon: '□',
    product: {
      name: 'Basic Office Keyboard',
      description: 'Simple office keyboard for typing, school work, and document tasks. Best for users who prioritize basic function over gaming features.',
      price: '₱420',
      oldPrice: '₱520',
      rating: 4.6,
      reviews: 72,
      imageIcon: '□',
      specs: ['Standard key layout', 'Plug-and-play USB', 'Lightweight build', 'Good for office and school use'],
      supplierContact: 'Contact placeholder: office-supply@example.com'
    }
  }
];
