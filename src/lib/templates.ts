export const TEMPLATES: Record<string, Record<string, string>> = {
  generic: {
    en: "Hi {contact_name}, I checked out {name}.\n\nYou do good work, but your online presence could bring you more {goal} with a cleaner layout and a stronger call to action.\n\nI build fast, professional websites for local businesses in 5-7 days.\n\nI noticed 2-3 things you could improve right away. Want me to send them here?",
    sq: "Përshëndetje! E pashë {name} dhe më la përshtypje puna juaj.\n\nMendoj që me një prezencë më profesionale online mund të merrni më shumë {goal}.\n\nUnë krijoj faqe interneti për biznese lokale brenda 5-7 ditësh.\n\nVura re 2-3 gjëra që mund t'i përmirësoni menjëherë. Dëshironi t'jua dërgoj këtu?"
  },
  no_website: {
    en: "Hi {contact_name}, I came across {name} and noticed you do not have a proper website yet.\n\nA lot of local customers search online before they call or visit. I build simple, professional websites for local businesses that help them look credible and get more inquiries.\n\nIf you want, I can send you a quick idea for what your website could look like.",
    sq: "Përshëndetje! E pashë {name} dhe vura re që ende nuk keni një website profesional.\n\nShumë klientë kërkojnë online para se të telefonojnë ose të vizitojnë biznesin. Një faqe e thjeshtë dhe profesionale ju ndihmon të dukeni më serioz dhe të merrni më shumë kërkesa.\n\nNëse dëshironi, mund t'ju dërgoj një ide të shpejtë se si mund të duket faqja juaj."
  },
  outdated_website: {
    en: "Hi {contact_name}, I checked the website for {name}.\n\nYour business looks solid, but the website feels outdated and may be costing you trust and leads.\n\nI help local businesses redesign their sites into something modern, mobile-friendly, and focused on getting more {goal}.\n\nIf you want, I can send you 3 specific improvements I would make.",
    sq: "Përshëndetje! E kontrollova faqen e {name}.\n\nBiznesi juaj duket serioz, por faqja aktuale mund të jetë duke ju humbur besim dhe klientë potencialë.\n\nUnë ridizajnoj faqe për biznese lokale në diçka moderne, të pastër dhe të optimizuar për telefon.\n\nNëse dëshironi, mund t'ju dërgoj 3 përmirësime konkrete që do t'i bëja."
  },
  booking: {
    en: "Hi {contact_name}, I came across {name}.\n\nYou look like the kind of business that would benefit from a website built around bookings, not just information.\n\nI design websites for local businesses that make it easier for customers to find you, trust you, and book faster.\n\nWant me to send a quick idea tailored to your business?",
    sq: "Përshëndetje! E pashë {name}.\n\nDuket si biznes që do të përfitonte shumë nga një website i ndërtuar për rezervime, jo vetëm për informacion.\n\nUnë krijoj faqe që i ndihmojnë klientët t'ju gjejnë më lehtë, t'ju besojnë më shpejt dhe të rezervojnë pa humbur kohë.\n\nDëshironi t'ju dërgoj një ide të shpejtë të përshtatur për biznesin tuaj?"
  },
  compliment_demo: {
    en: "Hi {contact_name}, I found {name} online and noticed your strong reviews{rating_phrase}.\n\nI build websites for local businesses, and I prepared a quick demo idea for you: {demo_url}\n\nNo pressure and no obligation. Want me to send a couple of suggestions with it?",
    sq: "Përshëndetje! E gjeta {name} online dhe pashë vlerësimet tuaja{rating_phrase}, shumë mbresëlënëse.\n\nUnë krijoj faqe interneti për biznese lokale dhe kam përgatitur një demo falas vetëm për ju: {demo_url}\n\nPa kosto dhe pa asnjë obligim. A dëshironi ta shihni?"
  },
  followup_1: {
    en: "Hi {contact_name}, just following up on my last message about {name}.\n\nI had a few ideas for how you could improve your online presence and get more {goal}.\n\nIf you want, I can send them in one short message. No pressure.",
    sq: "Përshëndetje! Po ju shkruaj shkurt si vazhdim i mesazhit tim të fundit për {name}.\n\nKam disa ide të thjeshta se si mund ta përmirësoni prezencën online dhe të merrni më shumë {goal}.\n\nNëse dëshironi, mund t'jua dërgoj në një mesazh të shkurtër. Pa obligim."
  },
  followup_2: {
    en: "Hi {contact_name}, one last message from me about {name}.\n\nI help local businesses get a professional website live in 5-7 days, and I think you would be a strong fit.\n\nIf now is not the right time, no problem. If you want, I can still send you a few free suggestions you can use anytime.",
    sq: "Përshëndetje! Edhe një mesazh i fundit nga ana ime për {name}.\n\nUnë ndihmoj bizneset lokale të dalin online me një website profesional në 5-7 ditë dhe mendoj se do t'ju përshtatej mirë.\n\nNëse tani nuk është momenti i duhur, nuk ka problem. Nëse dëshironi, mund t'ju dërgoj disa sugjerime falas që mund t'i përdorni kur të doni."
  },
  reply_positive: {
    en: "Perfect.\n\nI took a quick look and here are 3 improvements I would suggest for {name}:\n1. Stronger headline and call to action\n2. Cleaner mobile layout\n3. Better structure for trust and inquiries\n\nIf you want, I can send you the package I would recommend for your business.",
    sq: "Perfekt.\n\nI hodha një sy të shpejtë dhe këto janë 3 përmirësime që do t'i sugjeroja për {name}:\n1. Titull dhe thirrje më e fortë për veprim\n2. Pamje më e pastër në telefon\n3. Strukturë më e mirë për besim dhe kërkesa\n\nNëse dëshironi, mund t'ju dërgoj paketën që do t'ju rekomandoja për biznesin tuaj."
  }
};

export function buildMessage(lead: any, templateName: string, language: string) {
  const template = TEMPLATES[templateName]?.[language] || TEMPLATES.generic[language];
  let ratingPhrase = "";
  if (lead.rating && lead.reviews) {
    ratingPhrase = language === "sq" 
      ? ` (${lead.rating} yje me ${lead.reviews} vlerësime)`
      : ` (${lead.rating} stars with ${lead.reviews} reviews)`;
  } else if (lead.rating) {
    ratingPhrase = language === "sq" ? ` (${lead.rating} yje)` : ` (${lead.rating} stars)`;
  }

  return template
    .replace(/{contact_name}/g, lead.name)
    .replace(/{name}/g, lead.name)
    .replace(/{goal}/g, inferGoal(lead.category))
    .replace(/{rating_phrase}/g, ratingPhrase)
    .replace(/{demo_url}/g, lead.demo_url || "[demo link]");
}

function inferGoal(category: string) {
  const normalized = (category || "").toLowerCase();
  if (/dent|doctor|clinic|salon|barber|spa|gym/.test(normalized)) return "bookings";
  if (/restaurant|cafe|food/.test(normalized)) return "orders";
  return "inquiries";
}
