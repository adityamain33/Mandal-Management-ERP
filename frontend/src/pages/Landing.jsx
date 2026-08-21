import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.jsx';
import {
  LayoutDashboard,
  Receipt,
  IndianRupee,
  Coins,
  Users,
  HeartHandshake,
  Calendar,
  FileBarChart2,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Send,
  ChevronDown,
  TrendingUp,
  Smartphone,
  BookOpen,
  Award,
  ShieldCheck
} from 'lucide-react';

const landingTranslations = {
  en: {
    nav: {
      features: "Features",
      demo: "Interactive Demo",
      faq: "FAQ",
      dashboard: "Go to Dashboard",
      login: "Login",
      register: "Register"
    },
    hero: {
      tag: "🎉 Ganesh Festival Management, Digitalized!",
      title: "Digitalize Your Mandal's Finances & Administration",
      subtitle: "The ultimate ERP platform designed specifically for Ganpati Mandals. Manage receipts, track donations, control expenses, delegate volunteer tasks, and get instant financial reports—all in one place.",
      ctaPrimary: "Register Your Mandal",
      ctaSecondary: "Login to ERP",
      ctaDashboard: "Go to Dashboard",
      activeMandals: "120+ Active Mandals",
      receiptsPrinted: "80,000+ Receipts Printed",
      totalCollected: "₹45L+ Collected Securely"
    },
    mockDashboard: {
      mandalName: "Shree Ganesh Mitra Mandal",
      year: "Ganeshotsav 2026",
      statCollection: "Total Collection",
      statExpenses: "Total Expenses",
      statBalance: "Available Balance",
      statToday: "Today's Collection",
      recentActivity: "Recent Activity",
      receiptNo: "Receipt No.",
      amount: "Amount",
      donor: "Donor",
      time: "Time"
    },
    interactiveDemo: {
      title: "Interactive Platform Preview",
      subtitle: "Click through different modules to see how MandalSetu streamlines your festival administration.",
      tabReceipts: "Digital Receipts",
      tabAccounting: "Cash Book & Expense",
      tabVolunteers: "Volunteers & Tasks",
      cardTitleReceipts: "Instant Digital Receipt Book",
      cardDescReceipts: "Generate receipts on your mobile phone instantly during collection. Send PDF receipts directly to donors via WhatsApp or SMS, eliminating physical paper costs and ledger entry delays.",
      cardTitleAccounting: "Real-time Expense & Ledger Tracking",
      cardDescAccounting: "Every rupee is tracked. Group expenses by categories (decorations, sound system, prasad, security), upload vendor bills directly, and generate automated balance sheets for auditing.",
      cardTitleVolunteers: "Volunteer Coordination & Assignment",
      cardDescVolunteers: "Assign duties like collection, prasad distribution, queue management, or security to volunteers. Track task completion status and coordinate with volunteers in real-time.",
      actionLabel: "Try it in the live app"
    },
    features: {
      title: "Everything your Mandal needs to grow",
      subtitle: "Replace old paper diaries and spreadsheet calculations with a professional and secure ERP management suite.",
      feat1Title: "Digital Receipt Book",
      feat1Desc: "Instantly create receipts with custom numbering. Print or share via WhatsApp with one click.",
      feat2Title: "Real-time Accounting",
      feat2Desc: "Digital cash book, category-wise expense tracking, and transparent vendor payment ledgers.",
      feat3Title: "Volunteer Management",
      feat3Desc: "Register volunteers, assign festival duties, and monitor completion status effortlessly.",
      feat4Title: "Smart AI Assistant",
      feat4Desc: "Ask questions in Marathi, English, or Hindi (e.g. 'What is our balance today?') and get answers.",
      feat5Title: "Instant PDF/Excel Reports",
      feat5Desc: "Generate audited reports, donation receipt summaries, and expense sheets in seconds.",
      feat6Title: "Secured Cloud Storage",
      feat6Desc: "Highly secure, daily backups, and role-based permissions (Admin, Treasurer, Volunteer)."
    },
    aiDemo: {
      title: "Meet the Mandal AI Assistant",
      subtitle: "Ask questions and retrieve accounting records instantly using voice or typing.",
      tryAsking: "Click a question to ask the AI:",
      q1: "What is our total collection for today?",
      q2: "Show me the top three donors this year.",
      q3: "Which expense category has the highest spend?",
      typing: "AI Assistant is typing...",
      response1: "Today's total collection is ₹85,500. A total of 42 receipts were generated, mostly via UPI (₹62,000) and Cash (₹23,500).",
      response2: "The top three donors for Ganeshotsav 2026 are:\n1. Vijay Salunkhe - ₹51,000\n2. Rekha Deshmukh - ₹25,000\n3. Landmark Developers - ₹21,000",
      response3: "The highest expense category is 'Decoration & Mandap' at ₹1,45,000 (52% of total expenses), followed by 'Sound & Lights' at ₹75,000 (27%)."
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Got questions? We've got answers. Here is everything you need to know about MandalSetu.",
      q1: "Is my Mandal's data secure?",
      a1: "Yes, absolutely. All financial data is encrypted and saved securely in cloud servers with daily automated backups. Only authorized users with OTP logins can access it.",
      q2: "Does it support offline collection?",
      a2: "MandalSetu requires an active internet connection to synchronize data and send WhatsApp receipts. However, the mobile layout is highly optimized to run smoothly even on slower 3G/4G networks.",
      q3: "Can we print receipts directly from mobile?",
      a3: "Yes, you can connect any standard portable thermal Bluetooth printer or desktop printer to print receipts directly from your smartphone or tablet.",
      q4: "Are regional languages like Marathi supported?",
      a4: "Yes, MandalSetu is fully bilingual and supports Marathi (मराठी), Hindi (हिंदी), and English (EN). You can toggle the interface language at any time with a single click.",
      q5: "How much does it cost?",
      a5: "We offer a free trial for small Mandals to experience the platform. For larger Mandals, we offer premium packages with advanced report exports, multi-year history, and dedicated WhatsApp API numbers."
    },
    ctaSection: {
      title: "Ready to digitalize Ganeshotsav management?",
      subtitle: "Join over 120+ Ganpati Mandals managing their collection transparently and efficiently.",
      button: "Create Your Mandal Account Now"
    },
    footer: {
      tagline: "Simplifying Ganesh Festival Management through smart digital solutions.",
      links: "Useful Links",
      contact: "Contact Us",
      copy: "© 2026 MandalSetu. All rights reserved. Made for Ganeshotsav."
    }
  },
  mr: {
    nav: {
      features: "वैशिष्ट्ये",
      demo: "प्लॅटफॉर्म डेमो",
      faq: "नेहमीचे प्रश्न",
      dashboard: "डॅशबोर्डवर जा",
      login: "लॉगिन करा",
      register: "नोंदणी करा"
    },
    hero: {
      tag: "🎉 गणेशोत्सव व्यवस्थापन, आता डिजिटल!",
      title: "तुमच्या मंडळाचे आर्थिक व प्रशासकीय काम करा सोपे",
      subtitle: "गणेश मंडळांसाठी खास बनवलेले एकमेव डिजिटल ईआरपी प्लॅटफॉर्म. वर्गणी पावत्या, देणगीदार, खर्च, स्वयंसेवक आणि आर्थिक अहवाल—सर्व काही एकाच ठिकाणी व्यवस्थापित करा.",
      ctaPrimary: "मंडळाची नोंदणी करा",
      ctaSecondary: "लॉगिन करा",
      ctaDashboard: "डॅशबोर्डवर जा",
      activeMandals: "१२०+ सक्रिय मंडळे",
      receiptsPrinted: "८०,०००+ पावत्या जनरेट",
      totalCollected: "₹४५ लाख+ सुरक्षित जमा"
    },
    mockDashboard: {
      mandalName: "श्री गणेश मित्र मंडळ",
      year: "गणेशोत्सव २०२६",
      statCollection: "एकूण जमा वर्गणी",
      statExpenses: "एकूण खर्च",
      statBalance: "शिल्लक निधी",
      statToday: "आजचे संकलन",
      recentActivity: "अलीकडील पावत्या",
      receiptNo: "पावती क्र.",
      amount: "रक्कम",
      donor: "देणगीदार",
      time: "वेळ"
    },
    interactiveDemo: {
      title: "प्लॅटफॉर्मचा एक आढावा",
      subtitle: "मंडळसेतू तुमचे काम कसे सोपे करते हे पाहण्यासाठी खालील टॅबवर क्लिक करा.",
      tabReceipts: "डिजिटल पावती",
      tabAccounting: "जमा-खर्च रजिस्टर",
      tabVolunteers: "स्वयंसेवक आणि कामे",
      cardTitleReceipts: "मोबाईलवर डिजिटल पावती पुस्तक",
      cardDescReceipts: "वर्गणी गोळा करताना तात्काळ मोबाईलवरून पावती बनवा. पावती थेट देणगीदाराला व्हॉट्सॲप किंवा SMS द्वारे पाठवा. छापील पुस्तकांचा खर्च आणि हिशेबातील चुका टाळा.",
      cardTitleAccounting: "लेखा आणि हिशेब व्यवस्थापन",
      cardDescAccounting: "प्रत्येक रुपयाचा हिशेब ठेवा. सजावट, मंडप, प्रसाद, सुरक्षा यासारख्या वेगवेगळ्या विभागांनुसार खर्चाची नोंद करा, दुकानदारांची बिले अपलोड करा आणि ऑडिटसाठी ताळेबंद थेट डाऊनलोड करा.",
      cardTitleVolunteers: "स्वयंसेवक कामे आणि नियंत्रण",
      cardDescVolunteers: "मंडळाच्या कार्यकर्त्यांना कामे वाटून द्या (उदा: वर्गणी संकलन, रांग व्यवस्थापन, प्रसाद वाटप). कोणते काम पूर्ण झाले आहे किंवा प्रलंबित आहे, यावर थेट नियंत्रण ठेवा.",
      actionLabel: "लेखा आणि हिशेब व्यवस्थापन"
    },
    features: {
      title: "तुमच्या मंडळाच्या विकासासाठी सर्व सोयी",
      subtitle: "जुनी कागदी डायरी आणि हिशेबाच्या वह्या बंद करा आणि वापरा सुरक्षित, पारदर्शक डिजिटल ईआरपी प्रणाली.",
      feat1Title: "डिजिटल पावती पुस्तक",
      feat1Desc: "तात्काळ पावती क्रमांक जनरेट करा. एका क्लिकवर पावती प्रिंट करा किंवा व्हॉट्सॲपवर पाठवा.",
      feat2Title: "रिअल-टाइम अकाऊंटिंग",
      feat2Desc: "डिजिटल कॅश बुक, श्रेणीनुसार खर्च नोंद आणि विक्रेत्यांचे प्रलंबित व्यवहार व्यवस्थापन.",
      feat3Title: "कार्यकर्ते व्यवस्थापन",
      feat3Desc: "नवीन कार्यकर्त्यांची नोंदणी करा, त्यांना कामे द्या आणि कामाच्या प्रगतीवर लक्ष ठेवा.",
      feat4Title: "मंडळ AI सहाय्यक",
      feat4Desc: "मराठी किंवा हिंदीमध्ये थेट प्रश्न विचारा (उदा: 'आज किती वर्गणी जमा झाली?') आणि उत्तर मिळवा.",
      feat5Title: "झटपट अहवाल निर्यात",
      feat5Desc: "ऑडिट रिपोर्ट, देणगीदारांची यादी आणि जमा-खर्चाचा हिशेब PDF किंवा Excel स्वरूपात डाऊनलोड करा.",
      feat6Title: "सुरक्षित डेटा आणि बॅकअप",
      feat6Desc: "सर्व डेटा क्लाउडवर सुरक्षित राहील. रोजचा ऑटोमॅटिक बॅकअप आणि महत्त्वाच्या युजर्ससाठीच ॲक्सेस."
    },
    aiDemo: {
      title: "भेटा आमच्या 'मंडळ AI सहाय्यक' ला",
      subtitle: "हिशेब आणि माहिती आता तोंडी विचारा किंवा टाईप करून मिळवा.",
      tryAsking: "प्रश्न विचारण्यासाठी खालीलपैकी एकावर क्लिक करा:",
      q1: "आज एकूण किती वर्गणी गोळा झाली?",
      q2: "या वर्षी सर्वात जास्त देणगी कोणी दिली?",
      q3: "सर्वात जास्त खर्च कोणत्या गोष्टीवर झाला आहे?",
      typing: "AI सहाय्यक टाईप करत आहे...",
      response1: "आज एकूण ₹८५,५०० वर्गणी जमा झाली आहे. एकूण ४२ पावत्या फाडल्या गेल्या, त्यापैकी UPI द्वारे ₹६२,००० आणि रोख (Cash) ₹२३,५०० जमा झाले.",
      response2: "गणेशोत्सव २०२६ मधील सर्वात जास्त देणगी देणारे ३ देणगीदार:\n१. विजय साळुंखे - ₹५१,०००\n२. रेखा देशमुख - ₹२५,०००\n३. लँडमार्क डेव्हलपर्स - ₹२१,०००",
      response3: "सर्वात जास्त खर्च 'सजावट आणि मंडप' या वर्गवारीमध्ये झाला आहे, जो एकूण खर्चाच्या ५२% म्हणजेच ₹१,४५,००० आहे. त्यानंतर 'ध्वनी आणि प्रकाश व्यवस्था' यावर ₹७५,००० (२७%) खर्च झाला."
    },
    faq: {
      title: "नेहमी विचारले जाणारे प्रश्न (FAQ)",
      subtitle: "काही शंका आहेत का? मंडळसेतूबद्दल सर्व प्रश्नांची उत्तरे येथे मिळवा.",
      q1: "आमच्या मंडळाचा हिशेब आणि डेटा सुरक्षित राहील का?",
      a1: "होय, नक्कीच! सर्व डेटा एनक्रिप्टेड असून सुरक्षित क्लाउड सर्व्हरवर सेव्ह केला जातो. त्याचा दररोज ऑटोमॅटिक बॅकअप घेतला जातो. केवळ मंडळाने नियुक्त केलेल्या सदस्यांनाच ओटीपी लॉगिनद्वारे ॲक्सेस मिळतो.",
      q2: "मोबाईल नेटवर्क कमी असल्यास हे ॲप चालेल का?",
      a2: "पावत्या पाठवण्यासाठी आणि डेटा सिंक्रोनाइझ करण्यासाठी इंटरनेट आवश्यक आहे. परंतु आमची सिस्टीम 3G/4G नेटवर्कवरही अतिशय जलद गतीने चालण्यासाठी डिझाइन केली गेली आहे.",
      q3: "मोबाईलवरून थेट पावती प्रिंट करता येते का?",
      a3: "होय, तुम्ही बाजारात मिळणारा कोणताही ब्लूटूथ थर्मल प्रिंटर तुमच्या मोबाईलला कनेक्ट करून देणगीदाराला जागेवरच प्रिंटेड पावती देऊ शकता.",
      q4: "मराठी भाषा पूर्णपणे उपलब्ध आहे का?",
      a4: "होय, मंडळसेतू पूर्णपणे मराठी, हिंदी आणि इंग्रजी या तीन भाषांमध्ये उपलब्ध आहे. तुम्ही एका क्लिकवर हवी ती भाषा बदलू शकता.",
      q5: "या सुविधेसाठी किती शुल्क आकारले जाते?",
      a5: "लहान मंडळांसाठी प्राथमिक सेवा मोफत आहे जेणेकरून ते अनुभव घेऊ शकतील. मोठ्या मंडळांसाठी प्रगत अहवाल, व्हॉट्सॲप मेसेज एपीआय आणि डेटा इतिहास जपण्यासाठी प्रिमियम प्लॅन उपलब्ध आहेत."
    },
    ctaSection: {
      title: "तुमच्या मंडळाला आजच डिजिटल बनवायचे आहे का?",
      subtitle: "१२० पेक्षा जास्त गणेश मंडळे आधीच त्यांचा कारभार पारदर्शक आणि गतिमान करत आहेत. आजच सामील व्हा!",
      button: "मंडळाचे मोफत खाते बनवा"
    },
    footer: {
      tagline: "गणेशोत्सव व्यवस्थापन सोपे, पारदर्शक आणि गतिमान करणारा डिजिटल सेतू.",
      links: "उपयुक्त लिंक्स",
      contact: "संपर्क साधा",
      copy: "© २०२६ मंडळसेतू. सर्व हक्क सुरक्षित. गणेशोत्सवासाठी सप्रेम समर्पित."
    }
  },
  hi: {
    nav: {
      features: "विशेषताएं",
      demo: "डेमो देखें",
      faq: "अक्सर पूछे जाने वाले प्रश्न",
      dashboard: "डैशबोर्ड पर जाएं",
      login: "लॉगिन करें",
      register: "पंजीकरण करें"
    },
    hero: {
      tag: "🎉 गणेश उत्सव प्रबंधन, अब हुआ डिजिटल!",
      title: "अपने मंडल का वित्तीय और प्रशासनिक प्रबंधन आसान बनाएं",
      subtitle: "गणेश मंडलों के लिए विशेष रूप से डिज़ाइन किया गया एकमात्र ईआरपी प्लेटफॉर्म। रसीदें, चंदा, खर्च, स्वयंसेवक और वित्तीय रिपोर्ट—सब कुछ एक ही स्थान पर प्रबंधित करें.",
      ctaPrimary: "मंडल का पंजीकरण करें",
      ctaSecondary: "लॉगिन करें",
      ctaDashboard: "डैशबोर्ड पर जाएं",
      activeMandals: "120+ सक्रिय मंडल",
      receiptsPrinted: "80,000+ रसीदें जनरेट",
      totalCollected: "₹45 लाख+ सुरक्षित जमा"
    },
    mockDashboard: {
      mandalName: "श्री गणेश मित्र मंडल",
      year: "गणेशोत्सव 2026",
      statCollection: "कुल जमा चंदा",
      statExpenses: "कुल खर्च",
      statBalance: "शेष राशि",
      statToday: "आज का संकलन",
      recentActivity: "हालिया रसीदें",
      receiptNo: "रसीद क्र.",
      amount: "राशि",
      donor: "दानदाता",
      time: "समय"
    },
    interactiveDemo: {
      title: "इंटरैक्टिव प्लेटफॉर्म डेमो",
      subtitle: "मंडळसेतू कैसे काम करता है, यह जानने के लिए नीचे दिए गए टैब पर क्लिक करें.",
      tabReceipts: "डिजिटल रसीद",
      tabAccounting: "जमा-खर्च रजिस्टर",
      tabVolunteers: "स्वयंसेवक और कार्य",
      cardTitleReceipts: "मोबाइल पर डिजिटल रसीद बुक",
      cardDescReceipts: "चंदा एकत्र करते समय तुरंत मोबाइल से रसीद बनाएं. रसीद सीधे दानदाता को व्हाट्सएप या एसएमएस द्वारा भेजें. छपाई के खर्च और मैन्युअल हिसाब से बचें.",
      cardTitleAccounting: "वास्तविक समय पर खर्च और बहीखाता ट्रैकिंग",
      cardDescAccounting: "एक-एक रुपये का हिसाब रखें. सजावट, मंडप, प्रसाद, सुरक्षा जैसे श्रेणियों के आधार पर खर्चों को दर्ज करें. दुकानदारों के बिल अपलोड करें और ऑडिट के लिए बैलेंस शीट डाउनलोड करें.",
      cardTitleVolunteers: "कार्यकर्ता समन्वय और कार्य आबंटन",
      cardDescVolunteers: "मंडल के कार्यकर्ताओं को काम सौंपें (जैसे: चंदा संग्रह, सुरक्षा, प्रसाद वितरण). कौन सा काम पूरा हो गया है, इसका लाइव स्टेटस देखें.",
      actionLabel: "लाइव ऐप में आज़माएं"
    },
    features: {
      title: "आपके मंडल के लिए सब कुछ एक जगह",
      subtitle: "पुरानी कागजी डायरी और मैन्युअल गणना को बंद करें और सुरक्षित, डिजिटल प्रबंधन प्रणाली का उपयोग करें.",
      feat1Title: "डिजिटल रसीद बुक",
      feat1Desc: "तुरंत रसीद नंबर जनरेट करें. एक क्लिक में रसीद प्रिंट करें या व्हाट्सएप पर भेजें.",
      feat2Title: "रीयल-टाइम अकाउंटिंग",
      feat2Desc: "डिजिटल कैश बुक, श्रेणीवार खर्च और विक्रेताओं के लंबित बिलों का आसान प्रबंधन.",
      feat3Title: "कार्यकर्ता प्रबंधन",
      feat3Desc: "नए कार्यकर्ताओं को जोड़ें, उन्हें काम सौंपें और उनके काम की प्रगति को ट्रैक करें.",
      feat4Title: "मंडल AI सहायक",
      feat4Desc: "हिंदी या अंग्रेजी में सीधे प्रश्न पूछें (जैसे: 'आज कितना संग्रह हुआ?') और तुरंत उत्तर पाएं.",
      feat5Title: "त्वरित रिपोर्ट निर्यात",
      feat5Desc: "ऑडिट रिपोर्ट, दानदाताओं की सूची और खर्च का ब्यौरा PDF या Excel प्रारूप में डाउनलोड करें.",
      feat6Title: "सुरक्षित डेटा बैकअप",
      feat6Desc: "सभी डेटा क्लाउड पर सुरक्षित रूप से संग्रहीत. दैनिक बैकअप और भूमिका-आधारित पहुंच (Access) नियंत्रण."
    },
    aiDemo: {
      title: "मिलिए 'मंडल AI सहायक' से",
      subtitle: "हिसाब और मंडल की जानकारी अब बोलकर या लिखकर तुरंत प्राप्त करें.",
      tryAsking: "प्रश्न पूछने के लिए नीचे दिए गए किसी एक प्रश्न पर क्लिक करें:",
      q1: "आज कुल कितना चंदा एकत्र हुआ?",
      q2: "इस वर्ष सबसे अधिक दान किसने दिया?",
      q3: "सबसे अधिक खर्च किस चीज पर हुआ है?",
      typing: "AI सहायक उत्तर लिख रहा है...",
      response1: "आज कुल ₹85,500 चंदा जमा हुआ है. कुल 42 रसीदें बनाई गईं, जिनमें से UPI द्वारा ₹62,000 और नकद (Cash) ₹23,500 प्राप्त हुए.",
      response2: "गणेशोत्सव 2026 के शीर्ष 3 दानदाता:\n1. विजय सालुंखे - ₹51,000\n2. रेखा देशमुख - ₹25,000\n3. लैंडमार्क डेवलपर्स - ₹21,000",
      response3: "सबसे अधिक खर्च 'सजावट और मंडप' श्रेणी में हुआ है, जो कुल खर्च का 52% यानी ₹1,45,000 है. इसके बाद 'ध्वनि और प्रकाश व्यवस्था' पर ₹75,000 (27%) खर्च हुआ."
    },
    faq: {
      title: "अक्सर पूछे जाने वाले प्रश्न",
      subtitle: "कोई सवाल है? मंडलसेतु के बारे में अक्सर पूछे जाने वाले प्रश्नों के उत्तर यहाँ पाएं.",
      q1: "क्या हमारे मंडल का डेटा सुरक्षित रहेगा?",
      a1: "जी हां, बिल्कुल! सभी वित्तीय डेटा एन्क्रिप्टेड हैं और दैनिक बैकअप के साथ क्लाउड सर्वर पर सुरक्षित सहेजे जाते हैं. केवल अधिकृत उपयोगकर्ता ही ओटीपी लॉगिन के साथ इसे देख सकते हैं.",
      q2: "क्या यह कम नेटवर्क में भी काम करेगा?",
      a2: "डेटा सिंक करने और रसीद भेजने के लिए इंटरनेट जरूरी है. हालांकि, हमारा सिस्टम 3G/4G नेटवर्क पर भी बेहतरीन और तेज़ गति से काम करने के लिए अनुकूलित किया गया है.",
      q3: "क्या मोबाइल से रसीद प्रिंट की जा सकती है?",
      a3: "हाँ, आप किसी भी ब्लूटूथ थर्मल प्रिंटर को अपने मोबाइल से कनेक्ट करके दानदाता को तुरंत प्रिंट की हुई रसीद दे सकते हैं.",
      q4: "क्या हिंदी और मराठी भाषाएं उपलब्ध हैं?",
      a4: "हाँ, मंडलसेतु पूरी तरह से हिंदी, मराठी और अंग्रेजी (EN) भाषाओं का समर्थन करता है. आप कभी भी भाषा बदल सकते हैं.",
      q5: "इसकी कीमत क्या है?",
      a5: "छोटे मंडलों के लिए बुनियादी सुविधाएं बिल्कुल मुफ्त हैं. बड़े मंडलों के लिए उन्नत रिपोर्ट निर्यात, व्हाट्सएप एपीआई एकीकरण जैसी प्रीमियम योजनाएं उपलब्ध हैं."
    },
    ctaSection: {
      title: "क्या आप अपने मंडल को आज ही डिजिटल बनाना चाहते हैं?",
      subtitle: "120 से अधिक गणेश मंडल पहले से ही अपना काम पारदर्शी और सुगम बना रहे हैं. आज ही शामिल हों!",
      button: "मंडल का निशुल्क खाता बनाएं"
    },
    footer: {
      tagline: "गणेश उत्सव प्रबंधन को सरल, पारदर्शी और कुशल बनाने वाला डिजिटल सेतु.",
      links: "उपयोगी लिंक्स",
      contact: "संपर्क करें",
      copy: "© 2026 मंडलसेतु. सभी अधिकार सुरक्षित. गणेशोत्सव के लिए सप्रेम समर्पित."
    }
  }
};

const Landing = () => {
  const { lang, token, user, changeLanguage } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('receipts');
  
  // FAQ accordion state
  const [faqOpen, setFaqOpen] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false
  });

  // AI Mock Chat state
  const [aiSelectedQuery, setAiSelectedQuery] = useState(null);
  const [aiChatText, setAiChatText] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Get current translated texts
  const tText = landingTranslations[lang] || landingTranslations['mr'];

  // Handle mock AI interaction
  const triggerAiResponse = (queryId) => {
    if (aiTyping) return;
    setAiSelectedQuery(queryId);
    setAiChatText('');
    setAiTyping(true);

    const fullResponse = queryId === 1 
      ? tText.aiDemo.response1 
      : queryId === 2 
        ? tText.aiDemo.response2 
        : tText.aiDemo.response3;

    // Simulate typing effect
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < fullResponse.length) {
        setAiChatText((prev) => prev + fullResponse.charAt(currentIdx));
        currentIdx++;
      } else {
        clearInterval(interval);
        setAiTyping(false);
      }
    }, 15);
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Scroll to section smoothly
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-600 selection:text-white antialiased overflow-x-hidden">
      
      {/* BACKGROUND GRADIENT DECORATION */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-orange-400 to-amber-300 blur-[120px] animate-pulse duration-[10000ms]"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[45%] aspect-square rounded-full bg-gradient-to-br from-indigo-400 to-purple-300 blur-[120px]"></div>
      </div>

      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-slate-100/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 shadow-md shadow-orange-600/20 text-white font-extrabold text-lg transition-transform group-hover:scale-105 duration-200">
              म
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                मंडळ<span className="text-orange-600">सेतू</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block leading-none">
                MandalSetu ERP
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-orange-600 font-medium text-sm transition-colors cursor-pointer">
              {tText.nav.features}
            </button>
            <button onClick={() => scrollToSection('demo')} className="text-slate-600 hover:text-orange-600 font-medium text-sm transition-colors cursor-pointer">
              {tText.nav.demo}
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-slate-600 hover:text-orange-600 font-medium text-sm transition-colors cursor-pointer">
              {tText.nav.faq}
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs shadow-inner">
              <button
                onClick={() => changeLanguage('mr')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  lang === 'mr' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  lang === 'hi' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Auth CTAs */}
            {token && user ? (
              <Link to="/dashboard" className="btn-indigo text-sm py-2 px-4 shadow-indigo-600/10">
                <LayoutDashboard size={16} />
                {tText.nav.dashboard}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-700 hover:text-orange-600 font-medium text-sm px-3 py-2 transition-colors">
                  {tText.nav.login}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4 shadow-orange-600/10">
                  {tText.nav.register}
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3 shadow-xl transition-all duration-300">
            <div className="flex flex-col gap-2">
              <button onClick={() => scrollToSection('features')} className="text-left py-2.5 px-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-orange-600 font-medium text-sm">
                {tText.nav.features}
              </button>
              <button onClick={() => scrollToSection('demo')} className="text-left py-2.5 px-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-orange-600 font-medium text-sm">
                {tText.nav.demo}
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-left py-2.5 px-3 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-orange-600 font-medium text-sm">
                {tText.nav.faq}
              </button>
            </div>
            
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
              {/* Language switcher mobile */}
              <div className="flex justify-between items-center px-3">
                <span className="text-xs text-slate-400 font-semibold uppercase">Language</span>
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
                  <button onClick={() => changeLanguage('mr')} className={`px-2.5 py-1 rounded-md font-semibold ${lang === 'mr' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>मराठी</button>
                  <button onClick={() => changeLanguage('en')} className={`px-2.5 py-1 rounded-md font-semibold ${lang === 'en' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>EN</button>
                  <button onClick={() => changeLanguage('hi')} className={`px-2.5 py-1 rounded-md font-semibold ${lang === 'hi' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>हिंदी</button>
                </div>
              </div>

              {token && user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-indigo py-2.5 w-full">
                  <LayoutDashboard size={18} />
                  {tText.nav.dashboard}
                </Link>
              ) : (
                <div className="flex flex-col gap-2 pt-1 px-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-slate-700 hover:text-orange-600 font-semibold text-sm py-2">
                    {tText.nav.login}
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary py-2.5 w-full">
                    {tText.nav.register}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 self-center lg:self-start px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 font-semibold text-xs tracking-wide">
              {tText.hero.tag}
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-800 leading-[1.15]">
              {tText.hero.title.split(' ').map((word, i) => {
                // Highlight last 2 words with gradient
                const words = tText.hero.title.split(' ');
                if (i >= words.length - 2) {
                  return <span key={i} className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-500 font-black"> {word}</span>;
                }
                return <span key={i}> {word}</span>;
              })}
            </h1>

            <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              {tText.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              {token && user ? (
                <Link to="/dashboard" className="btn-indigo text-base px-6 py-3 shadow-lg shadow-indigo-600/20 active:scale-95 duration-150">
                  <LayoutDashboard size={20} />
                  {tText.hero.ctaDashboard}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-base px-6 py-3 shadow-lg shadow-orange-600/20 active:scale-95 duration-150">
                    {tText.hero.ctaPrimary}
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn-secondary text-base px-6 py-3 hover:border-slate-300">
                    {tText.hero.ctaSecondary}
                  </Link>
                </>
              )}
            </div>

            {/* Live Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-200/60 pt-6 mt-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{tText.hero.activeMandals}</div>
                <div className="text-xs text-slate-400 font-medium mt-1">Ganesh Mandals Trust Us</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{tText.hero.receiptsPrinted}</div>
                <div className="text-xs text-slate-400 font-medium mt-1">Fast & Paperless</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{tText.hero.totalCollected}</div>
                <div className="text-xs text-slate-400 font-medium mt-1">Secured Ledger Transactions</div>
              </div>
            </div>
          </div>

          {/* Hero Graphic / Interactive Dashboard Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-orange-500/10 rounded-3xl blur-2xl transform rotate-3 scale-95 pointer-events-none"></div>
            
            {/* Interactive Simulated Dashboard Glass Card */}
            <div className="relative border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 rounded-2xl overflow-hidden p-6 hover:shadow-indigo-500/5 transition-all duration-500">
              
              {/* Header inside mockup */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-orange-600 text-white font-extrabold flex items-center justify-center text-sm">म</div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{tText.mockDashboard.mandalName}</h3>
                    <p className="text-[9px] text-slate-400 font-semibold">{tText.mockDashboard.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] text-slate-500 font-bold">Online</span>
                </div>
              </div>

              {/* Grid elements inside mockup */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {/* Stats 1 */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[9px] font-semibold text-slate-400 block">{tText.mockDashboard.statCollection}</span>
                  <span className="text-sm font-bold text-indigo-600 mt-1 block">₹5,42,800</span>
                  <div className="flex items-center gap-0.5 text-[8px] text-green-600 font-medium mt-1">
                    <TrendingUp size={10} /> +12%
                  </div>
                </div>

                {/* Stats 2 */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[9px] font-semibold text-slate-400 block">{tText.mockDashboard.statExpenses}</span>
                  <span className="text-sm font-bold text-orange-600 mt-1 block">₹1,84,200</span>
                  <span className="text-[8px] text-slate-400 font-medium mt-1 block">34 Payments</span>
                </div>

                {/* Stats 3 */}
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100/30">
                  <span className="text-[9px] font-semibold text-indigo-600 block">{tText.mockDashboard.statBalance}</span>
                  <span className="text-sm font-bold text-indigo-700 mt-1 block">₹3,58,600</span>
                  <div className="h-1 w-full bg-indigo-200 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-600 h-full w-[66%]"></div>
                  </div>
                </div>
              </div>

              {/* Table activity mock */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 mb-3 flex items-center gap-1">
                  <Receipt size={12} className="text-orange-600" />
                  {tText.mockDashboard.recentActivity}
                </h4>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[8px]">UPI</div>
                      <div>
                        <span className="font-semibold text-slate-700 block">Amit S. Kadam</span>
                        <span className="text-[8px] text-slate-400 font-semibold">{tText.mockDashboard.receiptNo} MS-2026-1025</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 block">₹5,000</span>
                      <span className="text-[8px] text-slate-400">2 mins ago</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[8px]">CASH</div>
                      <div>
                        <span className="font-semibold text-slate-700 block">Prakash Shinde</span>
                        <span className="text-[8px] text-slate-400 font-semibold">{tText.mockDashboard.receiptNo} MS-2026-1024</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 block">₹1,100</span>
                      <span className="text-[8px] text-slate-400">10 mins ago</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] bg-indigo-50/20 p-2.5 rounded-lg border border-indigo-100/10">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[8px]">EXP</div>
                      <div>
                        <span className="font-semibold text-slate-700 block">Satyam Sounds (Pooja)</span>
                        <span className="text-[8px] text-slate-400 font-semibold">Sound System Advance</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600 block">-₹15,000</span>
                      <span className="text-[8px] text-slate-400">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements inside hero mockup for WOW factor */}
              <div className="absolute -right-4 -bottom-4 bg-orange-600 text-white rounded-xl shadow-lg p-3 flex items-center gap-2 animate-bounce duration-[3000ms] pointer-events-none scale-90 sm:scale-100">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-bold">WhatsApp Receipt Sent!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED INTERACTIVE PLATFORM DEMO SECTION */}
      <section id="demo" className="bg-white border-y border-slate-100 py-16 lg:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              {tText.interactiveDemo.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-normal mt-2">
              {tText.interactiveDemo.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column - Tab togglers */}
            <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
              <button
                onClick={() => setActiveTab('receipts')}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activeTab === 'receipts'
                    ? 'border-indigo-100 bg-indigo-50/50 shadow-sm text-indigo-900 font-semibold'
                    : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${activeTab === 'receipts' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Receipt size={18} />
                  </div>
                  <div>
                    <span className="text-sm block font-semibold">{tText.interactiveDemo.tabReceipts}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('accounting')}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activeTab === 'accounting'
                    ? 'border-orange-100 bg-orange-50/40 shadow-sm text-orange-950 font-semibold'
                    : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${activeTab === 'accounting' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Coins size={18} />
                  </div>
                  <div>
                    <span className="text-sm block font-semibold">{tText.interactiveDemo.tabAccounting}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('volunteers')}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activeTab === 'volunteers'
                    ? 'border-green-100 bg-green-50/40 shadow-sm text-green-950 font-semibold'
                    : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${activeTab === 'volunteers' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <HeartHandshake size={18} />
                  </div>
                  <div>
                    <span className="text-sm block font-semibold">{tText.interactiveDemo.tabVolunteers}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Right Column - Tab content */}
            <div className="lg:col-span-8 bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-inner">
              <div className="flex flex-col gap-4">
                {activeTab === 'receipts' && (
                  <div className="animate-fadeIn">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full inline-block mb-2">Module 1</span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">{tText.interactiveDemo.cardTitleReceipts}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2">{tText.interactiveDemo.cardDescReceipts}</p>
                    
                    {/* Visual demo for Receipts */}
                    <div className="mt-6 border border-slate-200 rounded-xl bg-white p-4 shadow-sm max-w-md">
                      <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-3 mb-3">
                        <div className="text-[10px] font-bold text-slate-400">DONATION RECEIPT / वर्गणी पावती</div>
                        <div className="text-[10px] font-mono text-slate-800">No. MS-2026-1025</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-semibold">Received From / देणगीदाराचे नाव:</span>
                          <span className="font-bold text-slate-700">Amit S. Kadam</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-semibold">Amount / देणगी रक्कम:</span>
                          <span className="font-black text-orange-600">₹5,000.00</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-semibold">Purpose / हेतू:</span>
                          <span className="font-bold text-slate-700">Ganesh Festival Subscription</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-semibold">Payment Mode / प्रकार:</span>
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded text-[10px] font-bold inline-block mt-0.5">UPI (Google Pay)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'accounting' && (
                  <div className="animate-fadeIn">
                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full inline-block mb-2">Module 2</span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">{tText.interactiveDemo.cardTitleAccounting}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2">{tText.interactiveDemo.cardDescAccounting}</p>

                    {/* Visual demo for Accounting */}
                    <div className="mt-6 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm max-w-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                            <th className="p-3">Category</th>
                            <th className="p-3">Reference / Vendor</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          <tr>
                            <td className="p-3 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>Decoration</td>
                            <td className="p-3 text-slate-500">Satyam Mandap Decorators</td>
                            <td className="p-3 text-right text-red-600 font-bold">-₹40,000</td>
                            <td className="p-3 text-center"><span className="badge-success text-[10px]">Paid</span></td>
                          </tr>
                          <tr>
                            <td className="p-3 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>Sound & Lights</td>
                            <td className="p-3 text-slate-500">Karan Sound Service</td>
                            <td className="p-3 text-right text-red-600 font-bold">-₹15,000</td>
                            <td className="p-3 text-center"><span className="badge-warning text-[10px]">Advance</span></td>
                          </tr>
                          <tr>
                            <td className="p-3 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>Prasad Box</td>
                            <td className="p-3 text-slate-500">Donation Box Collection</td>
                            <td className="p-3 text-right text-green-600 font-bold">+₹18,400</td>
                            <td className="p-3 text-center"><span className="badge-success text-[10px]">Received</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'volunteers' && (
                  <div className="animate-fadeIn">
                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider bg-green-50 border border-green-100 px-2 py-0.5 rounded-full inline-block mb-2">Module 3</span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">{tText.interactiveDemo.cardTitleVolunteers}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2">{tText.interactiveDemo.cardDescVolunteers}</p>

                    {/* Visual demo for Volunteers */}
                    <div className="mt-6 space-y-2.5 max-w-md">
                      <div className="border border-slate-200 rounded-xl bg-white p-3.5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">RK</div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Rahul K. Shinde</span>
                            <span className="text-[9px] text-slate-400 font-semibold">Ganesh Aarti Management</span>
                          </div>
                        </div>
                        <span className="badge-success text-[10px]">Completed</span>
                      </div>

                      <div className="border border-slate-200 rounded-xl bg-white p-3.5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">PM</div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Prathamesh Mane</span>
                            <span className="text-[9px] text-slate-400 font-semibold">Evening Collection Drive</span>
                          </div>
                        </div>
                        <span className="badge-warning text-[10px]">In Progress</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200/60 pt-4 mt-6 flex justify-between items-center">
                {/* <span className="text-xs text-slate-400 font-semibold">Built with React, Vite & Tailwind CSS</span> */}
                <Link to="/register" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  {lang === 'en' ? 'Try it in the live app' : lang === 'hi' ? 'लाइव ऐप में आज़माएं' : 'लाईव्ह ॲपमध्ये वापरून पहा'}
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES LISTING SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
            {tText.features.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
            {tText.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200">
              <Receipt size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">{tText.features.feat1Title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 font-medium">{tText.features.feat1Desc}</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200">
              <Coins size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">{tText.features.feat2Title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 font-medium">{tText.features.feat2Desc}</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200">
              <HeartHandshake size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">{tText.features.feat3Title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 font-medium">{tText.features.feat3Desc}</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">{tText.features.feat4Title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 font-medium">{tText.features.feat4Desc}</p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200">
              <FileBarChart2 size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">{tText.features.feat5Title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 font-medium">{tText.features.feat5Desc}</p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">{tText.features.feat6Title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 font-medium">{tText.features.feat6Desc}</p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE AI ASSISTANT CHAT SCREEN */}
      <section className="bg-white border-y border-slate-100 py-16 lg:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* AI Assistant Description */}
            <div className="lg:col-span-5 flex flex-col gap-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 self-center lg:self-start px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs tracking-wide">
                <Sparkles size={12} className="animate-spin duration-[4000ms]" />
                Mandal AI Assistant
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                {tText.aiDemo.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
                {tText.aiDemo.subtitle}
              </p>

              <div className="flex flex-col gap-2 mt-2">
                <span className="text-xs font-bold text-slate-400 self-center lg:self-start">{tText.aiDemo.tryAsking}</span>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => triggerAiResponse(1)}
                    className={`text-left text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      aiSelectedQuery === 1 ? 'border-orange-200 bg-orange-50 text-orange-950' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    💬 {tText.aiDemo.q1}
                  </button>
                  <button
                    onClick={() => triggerAiResponse(2)}
                    className={`text-left text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      aiSelectedQuery === 2 ? 'border-orange-200 bg-orange-50 text-orange-950' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    💬 {tText.aiDemo.q2}
                  </button>
                  <button
                    onClick={() => triggerAiResponse(3)}
                    className={`text-left text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      aiSelectedQuery === 3 ? 'border-orange-200 bg-orange-50 text-orange-950' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    💬 {tText.aiDemo.q3}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Assistant Chat Console Mockup */}
            <div className="lg:col-span-7">
              <div className="border border-slate-200 bg-slate-50 rounded-2xl shadow-xl overflow-hidden max-w-xl mx-auto flex flex-col h-[400px]">
                
                {/* Console header */}
                <div className="bg-slate-800 text-white px-4 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wide">Mandal AI Bot</h3>
                    <p className="text-[8px] text-indigo-200 font-bold uppercase tracking-widest">Active & Ready</p>
                  </div>
                </div>

                {/* Console Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[11px] sm:text-xs">
                  {/* Default welcome message */}
                  <div className="flex gap-2.5 max-w-[85%]">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[8px] flex-shrink-0">AI</div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 shadow-sm leading-normal font-semibold">
                      नमस्कार / Hello! I am the Mandal AI Assistant. You can ask me to fetch accounts summaries, identify donors, check pending duties, or track expense status. Try selecting one of the questions on the left.
                    </div>
                  </div>

                  {/* User query if selected */}
                  {aiSelectedQuery && (
                    <div className="flex gap-2.5 max-w-[85%] ml-auto justify-end">
                      <div className="bg-indigo-600 text-white rounded-xl p-3 shadow-sm leading-normal font-semibold">
                        {aiSelectedQuery === 1 ? tText.aiDemo.q1 : aiSelectedQuery === 2 ? tText.aiDemo.q2 : tText.aiDemo.q3}
                      </div>
                      <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0">YOU</div>
                    </div>
                  )}

                  {/* AI response typing or result */}
                  {aiTyping && (
                    <div className="flex gap-2.5 max-w-[85%] items-center">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[8px] flex-shrink-0">AI</div>
                      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-500 shadow-sm italic flex items-center gap-1.5 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce delay-100"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce delay-200"></span>
                        {tText.aiDemo.typing}
                      </div>
                    </div>
                  )}

                  {aiChatText && (
                    <div className="flex gap-2.5 max-w-[85%]">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[8px] flex-shrink-0">AI</div>
                      <div className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 shadow-sm leading-normal whitespace-pre-line border-l-4 border-l-indigo-600 font-semibold">
                        {aiChatText}
                      </div>
                    </div>
                  )}
                </div>

                {/* Console Chat Footer */}
                <div className="bg-white border-t border-slate-100 p-3 flex gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Type question (locked in demo)..."
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-400 cursor-not-allowed focus:outline-none font-semibold"
                  />
                  <button disabled className="bg-indigo-600/50 text-white rounded-xl p-2.5 cursor-not-allowed flex items-center justify-center">
                    <Send size={14} />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 z-10 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 font-semibold text-xs tracking-wide mb-3">
            <HelpCircle size={12} />
            FAQ
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {tText.faq.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {tText.faq.subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {/* FAQ 1 */}
          <div className="border border-slate-200/80 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            <button
              onClick={() => toggleFaq(0)}
              className="w-full flex justify-between items-center p-5 text-left font-bold text-sm sm:text-base text-slate-700 hover:text-orange-600 cursor-pointer"
            >
              <span>{tText.faq.q1}</span>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${faqOpen[0] ? 'rotate-180 text-orange-600' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${faqOpen[0] ? 'max-h-40 border-t border-slate-100' : 'max-h-0'}`}>
              <div className="p-5 text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold bg-slate-50/50">
                {tText.faq.a1}
              </div>
            </div>
          </div>

          {/* FAQ 2 */}
          <div className="border border-slate-200/80 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            <button
              onClick={() => toggleFaq(1)}
              className="w-full flex justify-between items-center p-5 text-left font-bold text-sm sm:text-base text-slate-700 hover:text-orange-600 cursor-pointer"
            >
              <span>{tText.faq.q2}</span>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${faqOpen[1] ? 'rotate-180 text-orange-600' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${faqOpen[1] ? 'max-h-40 border-t border-slate-100' : 'max-h-0'}`}>
              <div className="p-5 text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold bg-slate-50/50">
                {tText.faq.a2}
              </div>
            </div>
          </div>

          {/* FAQ 3 */}
          <div className="border border-slate-200/80 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            <button
              onClick={() => toggleFaq(2)}
              className="w-full flex justify-between items-center p-5 text-left font-bold text-sm sm:text-base text-slate-700 hover:text-orange-600 cursor-pointer"
            >
              <span>{tText.faq.q3}</span>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${faqOpen[2] ? 'rotate-180 text-orange-600' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${faqOpen[2] ? 'max-h-40 border-t border-slate-100' : 'max-h-0'}`}>
              <div className="p-5 text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold bg-slate-50/50">
                {tText.faq.a3}
              </div>
            </div>
          </div>

          {/* FAQ 4 */}
          <div className="border border-slate-200/80 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            <button
              onClick={() => toggleFaq(3)}
              className="w-full flex justify-between items-center p-5 text-left font-bold text-sm sm:text-base text-slate-700 hover:text-orange-600 cursor-pointer"
            >
              <span>{tText.faq.q4}</span>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${faqOpen[3] ? 'rotate-180 text-orange-600' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${faqOpen[3] ? 'max-h-40 border-t border-slate-100' : 'max-h-0'}`}>
              <div className="p-5 text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold bg-slate-50/50">
                {tText.faq.a4}
              </div>
            </div>
          </div>

          {/* FAQ 5 */}
          <div className="border border-slate-200/80 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            <button
              onClick={() => toggleFaq(4)}
              className="w-full flex justify-between items-center p-5 text-left font-bold text-sm sm:text-base text-slate-700 hover:text-orange-600 cursor-pointer"
            >
              <span>{tText.faq.q5}</span>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${faqOpen[4] ? 'rotate-180 text-orange-600' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${faqOpen[4] ? 'max-h-40 border-t border-slate-100' : 'max-h-0'}`}>
              <div className="p-5 text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold bg-slate-50/50">
                {tText.faq.a5}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA REGISTER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 z-10 relative">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-600 via-orange-600 to-rose-500 text-white p-8 sm:p-12 lg:p-16 shadow-xl shadow-orange-600/10 animate-pulse duration-[10000ms]">
          {/* Back grid overlay for high quality styling */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl flex flex-col gap-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {tText.ctaSection.title}
            </h2>
            <p className="text-sm sm:text-base text-orange-50 font-semibold leading-relaxed">
              {tText.ctaSection.subtitle}
            </p>
            <div className="pt-2">
              <Link
                to={token && user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 bg-white text-orange-700 hover:bg-slate-50 font-bold text-sm sm:text-base px-6 py-3 rounded-xl shadow-md transition-colors active:scale-95 duration-150 cursor-pointer"
              >
                {token && user ? tText.hero.ctaDashboard : tText.ctaSection.button}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 lg:py-16 border-t border-slate-800 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-slate-800">
          
          {/* Footer branding */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white font-extrabold text-base">
                म
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                मंडळ<span className="text-orange-500">सेतू</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed font-semibold">
              {tText.footer.tagline}
            </p>
          </div>

          {/* Footer links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-bold tracking-wider text-slate-200 uppercase">{tText.footer.links}</h4>
            <div className="flex flex-col gap-2 text-xs font-semibold">
              <button onClick={() => scrollToSection('features')} className="text-left hover:text-white transition-colors cursor-pointer">{tText.nav.features}</button>
              <button onClick={() => scrollToSection('demo')} className="text-left hover:text-white transition-colors cursor-pointer">{tText.nav.demo}</button>
              <button onClick={() => scrollToSection('faq')} className="text-left hover:text-white transition-colors cursor-pointer">{tText.nav.faq}</button>
              <Link to="/login" className="hover:text-white transition-colors">{tText.nav.login}</Link>
              <Link to="/register" className="hover:text-white transition-colors">{tText.nav.register}</Link>
            </div>
          </div>

          {/* Footer contacts */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-bold tracking-wider text-slate-200 uppercase">{tText.footer.contact}</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-500 font-semibold">
              <p>Email: adityamain33@gmail.com</p>
              <p>Mobile: +91 9422494398</p>
              <p>Address: Ratnagiri, Maharashtra, India</p>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs">
          <p className="text-slate-600 font-bold">{tText.footer.copy}</p>
          <div className="flex gap-4 font-bold text-slate-600">
            <span className="hover:text-slate-500 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-500 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
