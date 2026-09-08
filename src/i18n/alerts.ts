export type AlertLanguage = 'en' | 'hi' | 'ne' | 'te' | 'kn' | 'ta' | 'ml' | 'mr' | 'bn';

export interface AlertMessageTemplate {
  id: string;
  templates: Record<AlertLanguage, string>;
}

export const ALERT_TEMPLATES: AlertMessageTemplate[] = [
  {
    id: 'flash_flood_warning',
    templates: {
      en: 'Flash flood warning. {area} is currently at {risk}% flood risk. Move to a safe elevated area and follow evacuation instructions.',
      hi: 'अचानक बाढ़ की चेतावनी। {area} में बाढ़ का जोखिम वर्तमान में {risk}% है। सुरक्षित ऊंचे स्थान पर जाएं और निकासी निर्देशों का पालन करें।',
      ne: 'अचानक बाढीको चेतावनी। {area} मा हालै {risk}% बाढीको जोखिम छ। सुरक्षित अग्लो स्थानमा जानुहोस् र उद्धार तथा निकासी निर्देशन पालना गर्नुहोस्।',
      te: 'అతి హెచ్చరిక — ఫ్లాష్ ఫ్లడ్. {area} ప్రస్తుతం {risk}% వరకూ వరద ప్రమాదంలో ఉంది. ఎత్తైన, సురక్షిత ప్రాంతంలోని వెళ్లండి మరియు ఎవాక్యూఎషన్ సూచనలు అనుసరించండి.',
      kn: 'ಆಕಸ್ಮಿಕ ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ. {area} ಪ್ರಸ್ತುತ {risk}% ಪ್ರವಾಹದ ಅಪಾಯದಲ್ಲಿದೆ. ಸುರಕ್ಷಿತ ಎತ್ತರದ ಪ್ರದೇಶಕ್ಕೆ ಹೋಗಿ ಮತ್ತು ನಿರ್ಗಮನ ಸೂಚನೆಗಳನ್ನು ಅನುಸರಿಸಿ.',
      ta: 'அதிக எச்சரிக்கை — வெடிகுணம் வெள்ளம். {area} இல் தற்போதைய வெள்ள அபாயம் {risk}% உள்ளது. பாதுகாப்பான உயரமான பகுதியில் செல்லவும் மற்றும் வெளியேற்ற வழிமுறைகளை பின்பற்றவும்.',
      ml: 'തുരന്തപ്രവാഹ മുന്നറിയിപ്പ്. {area} ഇപ്പോൾ {risk}% വെള്ളപ്പൊക്കം അപകടത്തിൽ ആണ്. സുരക്ഷിതമായ ഉയർന്ന സ്ഥലത്തേക്ക് പോകുകയും ഒഴിവാക്കൽ നിർദ്ദേശങ്ങൾ പാലിക്കുകയും ചെയ്യുക.',
      mr: 'अकस्मात पूरची इश्वा. {area} सध्या {risk}% पूर धोका आहे. कृपया सुरक्षित उंच ठिकाणी चला आणि बाहेर निघण्याच्या सूचना पाळा.',
      bn: 'হঠাৎ বন্যার সতর্কবার্তা। {area} বর্তমানে {risk}% বন্যার ঝুঁকিতে আছে। একটি নিরাপদ উচ্চতায় যান এবং উদ্ধার ও নির্গমন নির্দেশাবলী অনুসরণ করুন।'
    }
  }
];

export function formatAlertMessage(templateId: string, lang: AlertLanguage, vars: Record<string, any>) {
  const t = ALERT_TEMPLATES.find(x => x.id === templateId);
  if (!t) return '';
  let s = t.templates[lang] || t.templates['en'];
  Object.keys(vars || {}).forEach(k => {
    s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k] ?? ''));
  });
  return s;
}

export const SUPPORTED_LANGUAGES: { code: AlertLanguage; label: string; emoji?: string }[] = [
  { code: 'en', label: 'English', emoji: '🌐' },
  { code: 'hi', label: 'Hindi', emoji: '🇮🇳' },
  { code: 'ne', label: 'Nepali', emoji: '🇳🇵' },
  { code: 'te', label: 'Telugu', emoji: '🇮🇳' },
  { code: 'kn', label: 'Kannada', emoji: '🇮🇳' },
  { code: 'ta', label: 'Tamil', emoji: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', emoji: '🇮🇳' },
  { code: 'mr', label: 'Marathi', emoji: '🇮🇳' },
  { code: 'bn', label: 'Bengali', emoji: '🇮🇳' }
];

export const VOICE_TEST_SENTENCES: Record<AlertLanguage, string> = {
  en: 'This is a JalDrishti voice alert test.',
  hi: 'यह जलदृष्टि वॉइस अलर्ट परीक्षण है।',
  ne: 'यो जलदृष्टि आवाज चेतावनी परीक्षण हो।',
  te: 'ఇది జలదృష్టి వాయిస్ అలర్ట్ పరీక్ష.',
  kn: 'ಇದು ಜಲದೃಷ್ಟಿ ಧ್ವನಿ ಎಚ್ಚರಿಕೆ ಪರೀಕ್ಷೆ.',
  ta: 'இது ஜல்த்ருஷ்டி குரல் எச்சரிக்கை சோதனை.',
  ml: 'ഇത് ജലദൃഷ്ടി വോയ്സ് അലർട്ട് പരിശോധനയാണ്.',
  mr: 'ही जलदृष्टी व्हॉइस अलर्ट चाचणी आहे.',
  bn: 'এটি জলদৃষ্টি ভয়েস অ্যালার্ট পরীক্ষা।'
};
