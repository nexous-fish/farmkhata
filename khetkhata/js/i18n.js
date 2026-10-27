/* KhetKhata — i18n: English, हिंदी, Hinglish, मराठी */
"use strict";

const I18N = {
  en: {
    navHome: "Overview", navLedger: "Ledger", navCrops: "Crops & Profit", navCash: "Cash Flow",
    navCoach: "Profit Coach", navReminders: "Reminders", navPeople: "Labour & Family",
    navUdhaar: "Udhaar / Credit", navReports: "Credit Report", navSettings: "Settings",
    navFarm: "My Farm", navMoney: "Money", navGrow: "Guidance", navShare: "Sharing",
    today: "Today", thisWeek: "This week", spent: "Spent", received: "Received",
    pending: "Pending", profit: "Profit", viewAll: "View all", addExpense: "Add expense",
    addSale: "Add sale", save: "Save", cancel: "Cancel", edit: "Edit", done: "Done",
    postponed: "Postponed", notApplicable: "Not applicable"
  },
  hi: {
    navHome: "सारांश", navLedger: "खाता-बही", navCrops: "फ़सल व मुनाफ़ा", navCash: "नकद बहाव",
    navCoach: "मुनाफ़ा सलाहकार", navReminders: "अनुस्मारक", navPeople: "मज़दूर व परिवार",
    navUdhaar: "उधार खाता", navReports: "क्रेडिट रिपोर्ट", navSettings: "सेटिंग्स",
    navFarm: "मेरा खेत", navMoney: "पैसा", navGrow: "सलाह", navShare: "शेयरिंग",
    today: "आज", thisWeek: "इस हफ़्ते", spent: "खर्च", received: "आया",
    pending: "बाकी", profit: "मुनाफ़ा", viewAll: "सब देखें", addExpense: "खर्च जोड़ें",
    addSale: "बिक्री जोड़ें", save: "सेव करें", cancel: "रद्द", edit: "बदलें", done: "हो गया",
    postponed: "बाद में", notApplicable: "लागू नहीं"
  },
  hinglish: {
    navHome: "Overview", navLedger: "Khata-book", navCrops: "Fasal & Profit", navCash: "Cash Flow",
    navCoach: "Profit Coach", navReminders: "Reminders", navPeople: "Majdoor & Family",
    navUdhaar: "Udhaar khata", navReports: "Credit Report", navSettings: "Settings",
    navFarm: "Mera khet", navMoney: "Paisa", navGrow: "Salah", navShare: "Sharing",
    today: "Aaj", thisWeek: "Is hafte", spent: "Kharch", received: "Aaya",
    pending: "Baki", profit: "Profit", viewAll: "Sab dekho", addExpense: "Kharch add karo",
    addSale: "Bikri add karo", save: "Save", cancel: "Cancel", edit: "Badlo", done: "Done",
    postponed: "Baad me", notApplicable: "Lagu nahi"
  },
  mr: {
    navHome: "एकूण आढावा", navLedger: "खाती-वही", navCrops: "पीक व नफा", navCash: "रोख प्रवाह",
    navCoach: "नफा सल्लागार", navReminders: "स्मरणपत्रे", navPeople: "मजूर व कुटुंब",
    navUdhaar: "उधारी खाते", navReports: "क्रेडिट अहवाल", navSettings: "सेटिंग्ज",
    navFarm: "माझे शेत", navMoney: "पैसे", navGrow: "सल्ला", navShare: "शेअरिंग",
    today: "आज", thisWeek: "या आठवड्यात", spent: "खर्च", received: "आले",
    pending: "बाकी", profit: "नफा", viewAll: "सर्व पहा", addExpense: "खर्च जोडा",
    addSale: "विक्री जोडा", save: "जतन करा", cancel: "रद्द", edit: "बदल", done: "झाले",
    postponed: "पुढे ढकलले", notApplicable: "लागू नाही"
  }
};

const LANGS = [
  { id: "hi",    name: "हिंदी",     en: "Hindi" },
  { id: "hinglish", name: "Hinglish", en: "Hindi in English letters" },
  { id: "mr",    name: "मराठी",     en: "Marathi" },
  { id: "en",    name: "English",  en: "" }
];

function t(key) {
  const lang = (typeof DB !== "undefined" && DB.farmer && DB.farmer.language) || "en";
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}
