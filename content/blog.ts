// Blog posts for /blog. Plain typed data, rendered by pages/BlogPost.tsx and listed by pages/BlogIndex.tsx.
//
// Content rules (UK consumer law: no misleading claims):
// - Prices: only "from £45" and what /pricing already says. No other prices, averages or market figures.
// - No statistics, customer stories, testimonials, ratings or client counts. No competitor names, no "best"/"cheapest".
// - Timings and checklists are general guidance, framed as typical and dependent on the property.
//
// Inline links use [text](/path) and must point at a route in config/routes.ts.

import { Page } from '../types';

export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

export interface BlogPost {
  page: Page;
  slug: string;
  // On-page H1
  title: string;
  meta: { path: string; title: string; description: string };
  datePublished: string;
  intro: string[];
  sections: { heading: string; blocks: BlogBlock[] }[];
  faq: { q: string; a: string }[];
  // Slugs of the two posts linked under "Keep reading"
  related: [string, string];
}

export const BLOG_DATE = '2026-10-19';

export const BLOG_INDEX_META = {
  path: '/blog',
  title: 'Airbnb Hosting Blog: Turnover Cleaning Tips | Airola',
  description: 'Practical guides for Airbnb and short-let hosts in East London: turnover cleaning costs, checklists, timings, same-day turnovers and photo proof.',
};

const post = (p: Omit<BlogPost, 'meta' | 'datePublished'> & { metaTitle: string; description: string }): BlogPost => {
  const { metaTitle, description, ...rest } = p;
  return { ...rest, datePublished: BLOG_DATE, meta: { path: `/blog/${p.slug}`, title: metaTitle, description } };
};

export const BLOG_POSTS: BlogPost[] = [
  post({
    page: Page.BLOG_COST,
    slug: 'airbnb-turnover-cleaning-cost-london',
    title: 'How much does Airbnb turnover cleaning cost in London?',
    metaTitle: 'Airbnb Turnover Cleaning Cost in London | Airola',
    description: 'What decides the price of an Airbnb turnover clean in London, what should be included, and how to plan for it. Airola turnovers start from £45.',
    intro: [
      "Cleaning is one of the few costs you pay on almost every booking, so it is worth understanding what you are paying for. The price of a turnover clean is not one fixed number across London. It depends on your property, what you want done between guests, and how often you need it.",
      "This guide explains what usually drives the price, what a fair turnover should include, and exactly what Airola charges for hosts in East London.",
    ],
    sections: [
      {
        heading: 'What decides the price of a turnover clean',
        blocks: [
          { type: 'p', text: "Most turnover cleaning is priced around the work involved, and a few things make the biggest difference:" },
          {
            type: 'ul',
            items: [
              "Size of the property. More bedrooms and bathrooms mean more beds to stage, more surfaces to clean and more floor to cover.",
              "What is included. A reset of the kitchen, bathroom and floors is different from a clean that also changes linen, washes dishes and wipes inside the fridge.",
              "How the guests left it. A tidy one-night stay and a week-long family stay rarely take the same effort.",
              "How often you book. Many cleaners price regular work differently from one-off jobs.",
              "Timing. A clean squeezed between a morning check-out and an afternoon check-in needs a cleaner who is free at exactly the right time.",
            ],
          },
        ],
      },
      {
        heading: 'What Airola charges',
        blocks: [
          { type: 'p', text: "We keep our prices on the page so you can work out your cost before you book. Prices are for a 1-bedroom property, and every package adds £20 per extra bedroom." },
          {
            type: 'ul',
            items: [
              "Standard Turnover: from £45 for a 1-bed, one-off. A 2-bed Standard Turnover is £65. It covers the kitchen, bathroom and floors, bed staging, a damage and low-stock check, and photo confirmation after every clean.",
              "Guest-Ready Plus: from £79 for a 1-bed, one-off. It includes everything in Standard Turnover plus linen change and bed making, dishwashing and a kitchen reset, inside the fridge and cupboards, and a pre-check-in double inspection.",
              "Book every turnover with us and you save £10 per clean: £35 for a 1-bed Standard Turnover and £69 for Guest-Ready Plus. There is no contract and you can cancel anytime.",
            ],
          },
          { type: 'p', text: "Your final price is confirmed before we clean. You can see the full breakdown on our [pricing page](/pricing), or [get your price in about 60 seconds](/quote) by choosing your bedrooms, package and any add-ons." },
        ],
      },
      {
        heading: 'What a turnover clean should include',
        blocks: [
          { type: 'p', text: "A low price only helps if the property is genuinely ready for the next guest. Whoever cleans for you, check that the price covers the kitchen and bathroom, floors throughout, beds made or staged, bins emptied, and a look round for damage or anything missing. It also helps to know how you will find out the clean is done." },
          { type: 'p', text: "For a room-by-room list you can share with any cleaner, see our [Airbnb turnover cleaning checklist](/blog/airbnb-turnover-cleaning-checklist)." },
        ],
      },
      {
        heading: 'Hourly rates or a fixed price per clean?',
        blocks: [
          { type: 'p', text: "Some cleaners charge by the hour and some charge a fixed price per turnover. An hourly rate can look cheaper at first, but the total depends on how long each clean takes, which you cannot always predict. A fixed price per clean makes your costs easier to plan, because you know the figure before the booking comes in." },
          { type: 'p', text: "If you are comparing options, compare like for like: the same property size, the same inclusions, and whether laundry, restocking and photo updates are part of the price or extras. How long a clean takes is a separate question, which we cover in [how long an Airbnb turnover clean takes](/blog/how-long-does-an-airbnb-turnover-clean-take)." },
        ],
      },
      {
        heading: 'Building cleaning into your pricing',
        blocks: [
          { type: 'p', text: "Airbnb lets you add a cleaning fee to each booking, or you can build cleaning into your nightly rate. Either way, the cost of a turnover is spread across the nights in that stay, so it weighs more heavily on short stays than on long ones." },
          { type: 'p', text: "That is why it is worth knowing your per-clean cost before you set minimum stays or run a promotion. A clear, fixed turnover price makes that maths much simpler." },
        ],
      },
      {
        heading: 'Keeping turnover costs predictable',
        blocks: [
          {
            type: 'ul',
            items: [
              "Keep spare sets of linen and towels in the property so a linen change never holds up the clean.",
              "Store cleaning supplies and guest essentials in one labelled place.",
              "Leave clear notes on access, bins and anything specific to your property.",
              "Book recurring cleans if your calendar is busy, so every check-out is covered without re-booking each time.",
            ],
          },
        ],
      },
    ],
    faq: [
      { q: 'Is a linen change included?', a: 'Linen change and bed making are part of Guest-Ready Plus. With Standard Turnover we stage the beds, and you can add a linen change when you get your quote.' },
      { q: 'Do I pay when I request a quote?', a: 'No. There is no payment when you get your price, and your final price is confirmed before we clean.' },
      { q: 'Which areas do you cover?', a: 'We focus on East London, including Stratford, Royal Wharf, Canary Wharf, Canning Town, Hackney Wick, Bow, Mile End and Leyton.' },
    ],
    related: ['airbnb-turnover-cleaning-checklist', 'how-long-does-an-airbnb-turnover-clean-take'],
  }),

  post({
    page: Page.BLOG_CHECKLIST,
    slug: 'airbnb-turnover-cleaning-checklist',
    title: 'What should an Airbnb turnover clean include? A checklist for hosts',
    metaTitle: 'Airbnb Turnover Cleaning Checklist | Airola',
    description: 'A room-by-room Airbnb turnover cleaning checklist for hosts: kitchen, bathroom, bedrooms, restocking and final checks before the next guest arrives.',
    intro: [
      "A turnover clean has one job: get the property from the state the last guest left it in to ready for the next one, usually in a short window. It is not a full deep clean, but it has to cover everything a guest will notice.",
      "Use this checklist to brief a cleaner, to check a clean has been done properly, or to compare what different services include. Every property is different, so treat it as a starting point and add anything specific to yours.",
    ],
    sections: [
      {
        heading: 'Before cleaning starts',
        blocks: [
          {
            type: 'ul',
            items: [
              'Walk through every room and note any damage, breakages or stains before anything is moved.',
              'Check for items the last guest left behind, and set them aside.',
              'Open windows to air the property if the weather allows.',
              'Strip the beds and gather used towels so laundry can start straight away.',
            ],
          },
        ],
      },
      {
        heading: 'Kitchen',
        blocks: [
          {
            type: 'ul',
            items: [
              'Wash, dry and put away dishes, or load and run the dishwasher.',
              'Wipe worktops, the hob, splashback and the outside of appliances.',
              'Clean the sink and taps.',
              'Clear out anything the guest left in the fridge, and wipe inside if needed.',
              'Check the microwave, kettle and coffee maker are clean and empty.',
              'Empty the bins and put in fresh liners.',
            ],
          },
        ],
      },
      {
        heading: 'Bathroom',
        blocks: [
          {
            type: 'ul',
            items: [
              'Clean the toilet, inside and out.',
              'Clean the shower, bath, screen and tiles, and clear the plughole.',
              'Clean the sink, taps and mirror.',
              'Put out fresh towels and a bath mat.',
              'Check toilet roll, hand soap and any toiletries you provide.',
            ],
          },
        ],
      },
      {
        heading: 'Bedrooms',
        blocks: [
          {
            type: 'ul',
            items: [
              'Make the beds with fresh linen, and check mattress protectors and pillows.',
              'Stage the beds the way your listing photos show them.',
              'Dust surfaces and check under the beds and in wardrobes and drawers.',
              'Check there are enough hangers and that lamps work.',
            ],
          },
        ],
      },
      {
        heading: 'Living areas and floors',
        blocks: [
          {
            type: 'ul',
            items: [
              'Plump cushions, fold throws and reset furniture to its usual layout.',
              'Dust surfaces, shelves and the TV area.',
              'Hoover carpets and rugs, and mop hard floors throughout.',
              'Wipe light switches, door handles and remote controls.',
            ],
          },
        ],
      },
      {
        heading: 'Entrance, hallway and outside space',
        blocks: [
          { type: 'p', text: "The entrance is the first thing a guest sees, so it is worth a minute of attention on every turnover." },
          {
            type: 'ul',
            items: [
              'Wipe the front door, handles and any keypad or key safe.',
              'Sweep or hoover the hallway and clear anything left by the door.',
              'If there is a balcony or terrace, sweep it, wipe the table and chairs, and remove any rubbish.',
              'Check that nothing is covering smoke or carbon monoxide alarms.',
              'Make sure the key, lockbox or smart lock is ready for the next check-in.',
            ],
          },
        ],
      },
      {
        heading: 'Restocking and final checks',
        blocks: [
          {
            type: 'ul',
            items: [
              'Restock essentials such as toilet roll, hand soap, dish soap and bin liners.',
              'Note anything running low so you can reorder before it runs out.',
              'Check the heating, Wi-Fi details and house guide are in place.',
              'Do a last walk-through as if you were the guest arriving.',
              'Take photos of each room once it is finished.',
            ],
          },
          { type: 'p', text: "That last step matters more than it sounds. Photos show the property was ready, and they make it far easier to deal with any problem later. We explain why in [how photo proof after cleaning protects hosts](/blog/photo-proof-after-cleaning-airbnb)." },
        ],
      },
      {
        heading: 'How this maps to Airola packages',
        blocks: [
          { type: 'p', text: "Our Standard Turnover covers the core reset: kitchen, bathroom and floors, bed staging, a damage and low-stock check, and photo confirmation after every clean. Guest-Ready Plus adds linen change and bed making, dishwashing and a kitchen reset, inside the fridge and cupboards, and a pre-check-in double inspection." },
          { type: 'p', text: "Turnovers start from £45 for a 1-bed. You can compare both packages on our [pricing page](/pricing), read more about [what turnover cleaning costs in London](/blog/airbnb-turnover-cleaning-cost-london), or [get your price](/quote) for your property." },
        ],
      },
    ],
    faq: [
      { q: 'Is a turnover clean the same as a deep clean?', a: 'No. A turnover resets the property between guests. A deep clean goes further, for example inside ovens or behind furniture, and is usually done less often depending on how busy your calendar is.' },
      { q: 'Should I leave cleaning supplies at the property?', a: 'It helps to keep guest essentials and spare linen there. Our team arrives fully equipped with cleaning supplies, and essentials restocking can be added to your plan.' },
      { q: 'Can I give the cleaner my own checklist?', a: 'Yes, and it is a good idea. Every property has its own details, such as how you like beds staged or where spare items are kept.' },
      { q: 'How can I check the clean was done if I am not there?', a: 'Ask for photos of each room once the clean is finished. With Airola, photo confirmation is sent to your WhatsApp after every clean, so you can compare the property against this checklist from wherever you are.' },
    ],
    related: ['airbnb-turnover-cleaning-cost-london', 'photo-proof-after-cleaning-airbnb'],
  }),

  post({
    page: Page.BLOG_DURATION,
    slug: 'how-long-does-an-airbnb-turnover-clean-take',
    title: 'How long does an Airbnb turnover clean take?',
    metaTitle: 'How Long Does an Airbnb Turnover Clean Take? | Airola',
    description: 'What affects how long an Airbnb turnover clean takes, a rough guide by property size, and how to plan cleans around check-out and check-in.',
    intro: [
      "There is no single answer, because a turnover clean takes as long as your property needs. A tidy studio after a one-night stay and a three-bedroom flat after a week-long family stay are very different jobs.",
      "This guide covers what affects the time, gives a rough idea of what to plan for, and explains how to make turnovers quicker and more predictable.",
    ],
    sections: [
      {
        heading: 'What affects how long a turnover takes',
        blocks: [
          {
            type: 'ul',
            items: [
              'Number of bedrooms and bathrooms. Each extra bed to make and bathroom to clean adds time.',
              'How the guests left it. Length of stay, number of guests, cooking and pets all make a difference.',
              'What is included. Linen changes, dishwashing and wiping inside the fridge take longer than a core reset.',
              'Laundry. Washing and drying linen on site can take longer than the clean itself.',
              'Access and layout. Waiting for keys, finding parking or carrying things up several floors all add up.',
              'Restocking and checks. A proper damage and low-stock check, and photos of each room, take a few extra minutes and are worth it.',
            ],
          },
          { type: 'p', text: "Bathrooms and kitchens usually take the most time in any turnover, because they need the most detailed cleaning and are where guests notice problems first. A property with two bathrooms can take noticeably longer than one with a single bathroom, even with the same number of bedrooms." },
        ],
      },
      {
        heading: 'A rough guide by property size',
        blocks: [
          { type: 'p', text: "As a very rough guide, a tidy studio or 1-bed flat is usually a few hours of work for one cleaner, and each extra bedroom and bathroom adds to that. Larger homes, or properties that need a lot of attention after a long stay, can take most of a day or need more than one person." },
          { type: 'p', text: "These are typical ranges, not promises. The only reliable figure is one based on your property, so ask whoever cleans for you for an estimate once they have seen it, and check it again after the first few turnovers. Our [turnover cleaning checklist](/blog/airbnb-turnover-cleaning-checklist) shows the tasks that make up that time." },
        ],
      },
      {
        heading: 'Why laundry changes the timing',
        blocks: [
          { type: 'p', text: "Washing and drying bedding during the clean ties the turnover to the washing machine. The simplest fix is to keep at least two full sets of linen and towels for every bed, so fresh sets go on straight away and the used ones are washed afterwards." },
        ],
      },
      {
        heading: 'Planning around check-out and check-in',
        blocks: [
          { type: 'p', text: "What matters most is the gap between your check-out and your next check-in. Many hosts use a late-morning check-out and a mid-afternoon check-in to leave a clear window for the clean." },
          { type: 'p', text: "If that gap is short, or you often have back-to-back bookings, it helps to plan for it in advance. Our guide to [preparing for a same-day turnover](/blog/same-day-airbnb-turnover-preparation) covers this step by step." },
        ],
      },
      {
        heading: 'How to make turnovers quicker',
        blocks: [
          {
            type: 'ul',
            items: [
              'Keep spare linen, towels and essentials in one labelled cupboard.',
              'Leave a short property guide for the cleaner: access, bins, where things go and how beds should be staged.',
              'Use the same layout after every stay so resetting the property becomes routine.',
              'Ask guests to leave keys in an agreed place and let you know when they have left.',
              'Book the same team regularly, so they learn the property and need fewer instructions.',
            ],
          },
        ],
      },
      {
        heading: 'How Airola schedules turnovers',
        blocks: [
          { type: 'p', text: "We schedule each clean around your check-out and next check-in window, and you can share your booking calendar so cleans are planned around your check-outs. We only see dates, never guest details. When we finish, photos of each room go to your WhatsApp." },
          { type: 'p', text: "Same-day cleans between check-out and check-in are available, subject to availability. You can see what each package includes on our [pricing page](/pricing), with turnovers from £45 for a 1-bed, or [get your price](/quote) for your property." },
        ],
      },
    ],
    faq: [
      { q: 'Can a turnover be done between a same-day check-out and check-in?', a: 'Usually, as long as the gap between them suits the size of the property. We offer same-day cleans between check-out and check-in, subject to availability.' },
      { q: 'Does a bigger property always take longer?', a: 'Generally yes, because there are more rooms to reset. But the condition the guests left it in and what is included can matter just as much as size.' },
      { q: 'Will the first clean take longer than later ones?', a: 'Often, yes. A first clean in a new property usually means learning the layout, where supplies are kept and how you like things set up. Later turnovers tend to be quicker once that routine is in place.' },
      { q: 'How will I know the clean is finished?', a: 'With Airola, you get photos of each room on WhatsApp when the clean is done, before your next guest arrives.' },
    ],
    related: ['airbnb-turnover-cleaning-checklist', 'same-day-airbnb-turnover-preparation'],
  }),

  post({
    page: Page.BLOG_SAME_DAY,
    slug: 'same-day-airbnb-turnover-preparation',
    title: 'How to prepare your Airbnb for a same-day turnover',
    metaTitle: 'How to Prepare for a Same-Day Airbnb Turnover | Airola',
    description: 'How to prepare your Airbnb for a same-day turnover: check-out and check-in times, linen, supplies, clear instructions and what to do when plans change.',
    intro: [
      "A same-day turnover is when one guest checks out and the next checks in on the same day. Your cleaner has only the gap between the two to get the property ready, so preparation makes the difference between a calm turnover and a rushed one.",
      "Here is how to set your property up so same-day turnovers run smoothly, whether you manage one flat in East London or several.",
    ],
    sections: [
      {
        heading: 'Set check-out and check-in times that leave room',
        blocks: [
          { type: 'p', text: "Your check-out and check-in times decide how long the cleaner has. A late-morning check-out with a mid-afternoon check-in, for example, leaves a clear window in the middle of the day. If you allow early check-ins or late check-outs, decide in advance how you will handle them on days with back-to-back bookings." },
          { type: 'p', text: "How long you need depends on the size of the property and what the clean includes. We explain the factors in [how long an Airbnb turnover clean takes](/blog/how-long-does-an-airbnb-turnover-clean-take)." },
        ],
      },
      {
        heading: 'Keep spare linen and supplies on site',
        blocks: [
          {
            type: 'ul',
            items: [
              'At least two full sets of bedding and towels for every bed, so fresh sets go straight on.',
              'A stock of essentials: toilet roll, hand soap, dish soap and bin liners.',
              'One labelled cupboard or box for spare items, so nothing has to be searched for.',
              'A simple list of what should be in stock, so low items get noticed.',
            ],
          },
        ],
      },
      {
        heading: 'Give your cleaner clear information',
        blocks: [
          { type: 'p', text: "On a tight turnover, every question costs time. A short guide for your cleaner helps a lot:" },
          {
            type: 'ul',
            items: [
              'How to get in: key safe, lockbox or smart lock details, and building access.',
              'Bin arrangements. Collection rules differ between East London boroughs and buildings, so note where rubbish and recycling go.',
              'How beds and living areas should look, ideally with a photo of each room set up.',
              'Anything particular to the property, such as a tricky lock or an appliance that needs resetting.',
            ],
          },
        ],
      },
      {
        heading: 'Keep your calendar and your cleaner in sync',
        blocks: [
          { type: 'p', text: "Same-day turnovers depend on your cleaner knowing exactly when bookings change. If you take a last-minute booking, extend a stay or agree to an early check-in, tell your cleaner straight away rather than on the day." },
          { type: 'p', text: "Sharing your booking calendar makes this much easier, because cleans can be planned around each check-out without you sending details every time. With Airola you can share your calendar, and we only see dates, never guest details." },
        ],
      },
      {
        heading: 'Make check-out easy for guests',
        blocks: [
          { type: 'p', text: "Clear check-out instructions help the turnover start on time. Keep requests short and reasonable: tell guests what time to leave, where to leave keys, and ask them to let you know when they have gone. A message the evening before check-out is a helpful reminder." },
        ],
      },
      {
        heading: 'Plan for things that go wrong',
        blocks: [
          { type: 'p', text: "Even with good preparation, same-day turnovers sometimes hit problems: a guest leaves late, something is broken, or supplies run out. Decide in advance who your cleaner should contact, and how quickly you can respond." },
          { type: 'p', text: "Photos taken during and after the clean help you make quick decisions from wherever you are. We explain why in [how photo proof after cleaning protects hosts](/blog/photo-proof-after-cleaning-airbnb)." },
        ],
      },
      {
        heading: 'Booking same-day turnovers with Airola',
        blocks: [
          { type: 'p', text: "We offer same-day cleans between check-out and check-in, subject to availability, across East London including Stratford, Royal Wharf and Canary Wharf. Each clean ends with photos of every room sent to your WhatsApp, and we flag any damage or low stock we find." },
          { type: 'p', text: "Turnovers start from £45 for a 1-bed. See what each package includes on our [pricing page](/pricing), or [get your price in about 60 seconds](/quote)." },
        ],
      },
    ],
    faq: [
      { q: 'What if a guest checks out late?', a: 'Let your cleaner know as soon as you can. A late check-out shortens the cleaning window, so it helps to have spare linen and supplies ready and a clear plan for that day.' },
      { q: 'Do I need to be at the property?', a: 'Not usually. With clear access instructions and photo updates after the clean, many hosts manage same-day turnovers remotely.' },
      { q: 'Can I book same-day cleans on short notice?', a: 'We offer same-day cleans subject to availability. Booking regular turnovers and sharing your calendar makes it easier to plan ahead.' },
      { q: 'Should I ask guests to strip the beds before they leave?', a: 'Some hosts do, but keep any check-out requests short and mention them in your listing, so guests know before they book. Spare linen sets on site do more to speed up a turnover than asking guests to help.' },
    ],
    related: ['how-long-does-an-airbnb-turnover-clean-take', 'photo-proof-after-cleaning-airbnb'],
  }),

  post({
    page: Page.BLOG_PHOTO_PROOF,
    slug: 'photo-proof-after-cleaning-airbnb',
    title: 'Why photo proof after cleaning protects Airbnb hosts',
    metaTitle: 'Why Photo Proof After Cleaning Protects Hosts | Airola',
    description: 'How photos taken after every Airbnb turnover help hosts: seeing the property before guests do, spotting damage and low stock, and settling disputes.',
    intro: [
      "When you are not at the property, you are trusting that the clean was done and that the place is ready for your next guest. Photo proof replaces that trust with something you can check.",
      "This guide explains what photo proof after cleaning means, how it protects you as a host, and what good photo updates look like.",
    ],
    sections: [
      {
        heading: 'What photo proof after cleaning means',
        blocks: [
          { type: 'p', text: "Photo proof is simple: when the clean is finished, the cleaner photographs each room and sends the photos to you. You get a record of the state of the property at the moment it was handed over for the next guest." },
        ],
      },
      {
        heading: 'You see the property before your guest does',
        blocks: [
          { type: 'p', text: "The first person to spot a problem should be you, not your guest. With photos after every clean, you can check that beds are made, the kitchen is reset and the bathroom is done before anyone arrives. If something looks wrong, there is still time to fix it." },
        ],
      },
      {
        heading: 'A record if something goes wrong',
        blocks: [
          { type: 'p', text: "If a guest reports a problem, or you find damage after a stay, photos help you work out what happened and when. Photos taken at the end of each clean show what the property looked like before the next guest checked in." },
          { type: 'p', text: "If you ever need to raise a damage claim through Airbnb, you will usually be asked for evidence, and dated photos are among the most useful things you can have. Check Airbnb's current rules and deadlines for claims, as they can change." },
        ],
      },
      {
        heading: 'Spotting damage and low stock early',
        blocks: [
          { type: 'p', text: "A cleaner is often the first person in the property after a guest leaves. When they flag damage, missing items or supplies running low straight away, you can replace or repair things before they affect the next stay, rather than finding out from a guest message." },
        ],
      },
      {
        heading: 'What good photo proof looks like',
        blocks: [
          {
            type: 'ul',
            items: [
              'Every room, including the ones that are hardest to photograph.',
              'Wide shots that show the whole room, plus close-ups of the bathroom, kitchen and beds.',
              'Sent as soon as the clean is finished, so the time of the message shows when the property was ready.',
              'Any damage or low stock photographed and flagged separately, so it does not get missed.',
              'Delivered somewhere you will actually see it, such as your phone.',
            ],
          },
          { type: 'p', text: "It also helps to agree what \"ready\" means in the first place. Our [Airbnb turnover cleaning checklist](/blog/airbnb-turnover-cleaning-checklist) is a good basis for that." },
        ],
      },
      {
        heading: 'Photos protect your cleaner too',
        blocks: [
          { type: 'p', text: "Photo proof is not only about checking up on the person who cleans. If a guest later says something was missed, a clear set of photos shows what the property looked like when the clean was finished. That keeps conversations about quality factual rather than one person's word against another's, and helps everyone fix any real gaps quickly." },
        ],
      },
      {
        heading: 'Peace of mind on tight turnovers',
        blocks: [
          { type: 'p', text: "Photo proof is most useful when time is short. On a same-day turnover you may not be able to visit between guests, and a set of photos lets you confirm everything is in order from wherever you are. See our tips on [preparing for a same-day turnover](/blog/same-day-airbnb-turnover-preparation)." },
        ],
      },
      {
        heading: 'How Airola does it',
        blocks: [
          { type: 'p', text: "Photo confirmation is part of every Airola turnover. When we finish, we send photos straight to your WhatsApp: beds staged, kitchen reset, bathroom done. If we spot damage or low stock, you hear about it right away. And if your first clean isn't guest-ready, our First-Clean Guarantee means we come back and re-clean the affected areas free." },
          { type: 'p', text: "Turnovers start from £45 for a 1-bed, with photo proof included. See our [pricing page](/pricing), or [get your price](/quote) for your property." },
        ],
      },
    ],
    faq: [
      { q: 'Is photo proof included in the price?', a: 'Yes. Photo confirmation after every clean is part of both Airola packages.' },
      { q: 'Where are the photos sent?', a: 'Straight to your WhatsApp when the clean is finished, before your next guest arrives.' },
      { q: 'How long should I keep the photos?', a: 'At least until the next guest has checked out and any issues from their stay are settled. Keeping the message thread is often enough, because it already holds the photos in date order.' },
      { q: 'What if I spot a problem in the photos?', a: 'Message us straight away. Our terms ask for any damage claims to be raised within 48 hours of the completed clean, and the photos make it easy to show what you mean.' },
    ],
    related: ['airbnb-turnover-cleaning-checklist', 'same-day-airbnb-turnover-preparation'],
  }),
];

export const blogPostBySlug = (slug: string) => BLOG_POSTS.find(p => p.slug === slug);
