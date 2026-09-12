export type Language = 'kg' | 'kz';

export interface Translations {
  envelopeHint: string;
  soundAria: string;
  soundLabel: [string, string];
  greetingIntro: [string, string, string];
  and: string;
  invitationBody: [string, string, string, string];
  calendarMonth: string;
  calendarWeekdays: [string, string, string, string, string, string, string];
  programTitle: string;
  timeline: {
    t16: [string, string];
    t17: [string, string];
    t19_30: [string, string];
    t21: [string, string];
    t22: [string, string];
  };
  venueName: string;
  venueType: string;
  venueAddress: [string, string];
  mapButton: string;
  hostsIntro: [string, string];
  hostsNames: string;
  bridePossessive: string;
  rsvpTitle: string;
  rsvpNotice: [string, string];
  rsvpLastNamePlaceholder: string;
  rsvpFirstNamePlaceholder: string;
  rsvpPartnerPlaceholder: string;
  rsvpQuestion: string;
  rsvpOptions: [string, string, string];
  rsvpSubmit: string;
  rsvpSubmitting: string;
  rsvpSuccess: string;
  rsvpError: string;
  countdownTitle: string;
  countdownUnits: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  srOnly: string;
}

export const translations: Record<Language, Translations> = {
  kg: {
    envelopeHint: "Ачуу үчүн басыңыз",
    soundAria: "музыканы күйгүзүү / өчүрүү",
    soundLabel: ["музыканы", "күйгүзүү / өчүрүү"],
    greetingIntro: ["Урматтуу биздин сыйлуу", "коногубуз!", "Сиздерди балдарыбыз"],
    and: "менен",
    invitationBody: [
      "бактысына күбө болуп,",
      "тоюбузга каалоо айтып,",
      "кадырлуу коногубуз болуп кетүүгө",
      "чакырабыз!"
    ],
    calendarMonth: "ОКТЯБРЬ",
    calendarWeekdays: ["дүй", "шей", "шар", "бей", "жум", "иш", "жек"],
    programTitle: "Тойдун жүрүшү:",
    timeline: {
      t16: ["Конокторду", "тосуп алуу"],
      t17: ["Тойдун", "башталышы"],
      t19_30: ["Жаш жубайлардын", "алгачкы бийи"],
      t21: ["Той тортун", "кесүү"],
      t22: ["Тойдун", "аякташы"]
    },
    venueName: "Арна",
    venueType: "ресторан",
    venueAddress: ["Курманжан Датка көчөсү, 152", "Бишкек шаары"],
    mapButton: "Картадан көрүү",
    hostsIntro: ["Сиздерди чыдамсыздык менен күтөбүз!", "Той ээлери:"],
    hostsNames: "Болот — Чынар",
    bridePossessive: "Алуанын",
    rsvpTitle: "Сурамжылоо",
    rsvpNotice: ["Тойго катышарыңызды", "билдирип коюңуз:"],
    rsvpLastNamePlaceholder: "Фамилияңыз *",
    rsvpFirstNamePlaceholder: "Атыңыз *",
    rsvpPartnerPlaceholder: "Жубайыңыздын / өнөктөшүңүздүн аты-жөнү *",
    rsvpQuestion: "Тойго келесизби?",
    rsvpOptions: [
      "Жалгыз келем",
      "Жубайым менен келем",
      "Келе албайм"
    ],
    rsvpSubmit: "Жоопту жөнөтүү",
    rsvpSubmitting: "Жөнөтүлүүдө...",
    rsvpSuccess: "Жообуңуз кабыл алынды! Чоң рахмат!",
    rsvpError: "Ката кетти, кайрадан аракет кылып көрүңүз",
    countdownTitle: "Тойго чейин:",
    countdownUnits: {
      days: "күн",
      hours: "саат",
      minutes: "мүнөт",
      seconds: "секунд"
    },
    srOnly: "Байэл менен Алуа — 21.10.2026, Арна, Курманжан Датка көчөсү, 152, Бишкек"
  },
  kz: {
    envelopeHint: "Ашу үшін басыңыз",
    soundAria: "музыканы қосу / өшіру",
    soundLabel: ["музыканы", "қосу / өшіру"],
    greetingIntro: ["Құрметті қадірлі", "қонағымыз!", "Сіздерді балаларымыз"],
    and: "мен",
    invitationBody: [
      "бақытына куә болып,",
      "ақ тілектеріңізді арнап,",
      "тойымыздың қадірлі қонағы болуға",
      "шақырамыз!"
    ],
    calendarMonth: "ОКТЯБРЬ",
    calendarWeekdays: ["дүй", "сей", "сәр", "бей", "жұм", "сен", "жек"],
    programTitle: "Тойдың бағдарламасы:",
    timeline: {
      t16: ["Қонақтарды", "қарсы алу"],
      t17: ["Тойдың", "басталуы"],
      t19_30: ["Жас жұбайлардың", "алғашқы биі"],
      t21: ["Той тортын", "кесу"],
      t22: ["Тойдың", "аяқталуы"]
    },
    venueName: "Арна",
    venueType: "мейрамханасы",
    venueAddress: ["Құрманжан Датқа көшесі, 152", "Бішкек қаласы"],
    mapButton: "Картадан көру",
    hostsIntro: ["Сіздерді асыға күтеміз!", "Той иелері:"],
    hostsNames: "Болот — Чынар",
    bridePossessive: "Алуаның",
    rsvpTitle: "Сауалнама",
    rsvpNotice: ["Тойға қатысатыныңызды", "растауыңызды сұраймыз:"],
    rsvpLastNamePlaceholder: "Тегіңіз (фамилияңыз) *",
    rsvpFirstNamePlaceholder: "Атыңыз *",
    rsvpPartnerPlaceholder: "Жұбайыңыздың / серігіңіздің аты-жөні *",
    rsvpQuestion: "Тойға келесіз бе?",
    rsvpOptions: [
      "Жалғыз келемін",
      "Жұбайыммен келемін",
      "Келе алмаймын"
    ],
    rsvpSubmit: "Жауапты жіберу",
    rsvpSubmitting: "Жіберілуде...",
    rsvpSuccess: "Жауабыңыз қабылданды! Үлкен рахмет!",
    rsvpError: "Қате кетті, қайтадан байқап көріңіз",
    countdownTitle: "Тойға дейін:",
    countdownUnits: {
      days: "күн",
      hours: "сағат",
      minutes: "минут",
      seconds: "секунд"
    },
    srOnly: "Байэл мен Алуа — 21.10.2026, Арна, Құрманжан Датқа көшесі, 152, Бішкек"
  }
};
