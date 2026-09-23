export const translations = {
  en: {
    // Nav & General
    appTitle: "MediKiosk",
    appSubtitle: "AI-Assisted Pre-Consultation System",
    welcome: "Welcome",
    login: "Login",
    register: "Register",
    logout: "Logout",
    dashboard: "Dashboard",
    kioskMode: "Kiosk Mode",
    profile: "Medical Profile",
    history: "Consultation History",
    reports: "Medical Reports",
    safetyNotice: "Clinical Safety & AI Boundaries",
    switchLanguage: "Language",
    back: "Back",
    next: "Next",
    submit: "Submit",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    reviewed: "Reviewed",
    pending: "Pending Review",
    status: "Status",
    date: "Date",
    action: "Action",

    // Kiosk Steps
    step1: "Personal Information",
    step2: "Main Complaint",
    step3: "Medical History",
    step4: "Medications",
    step5: "Allergies",
    step6: "Lifestyle",
    step7: "Previous Reports",
    step8: "Review & Confirm",
    step9: "Handover",

    // Step 1: Personal Info
    step1_title: "Confirm Your Personal Information",
    step1_desc: "Please ensure your identity and emergency contact details are accurate before continuing.",
    fullName: "Full Name",
    age: "Age",
    gender: "Gender",
    phone: "Phone Number",
    emergencyContact: "Emergency Contact",

    // Step 2: Main Complaint
    step2_title: "What is your main problem today?",
    step2_placeholder: "Describe how you are feeling (e.g., fever, cough, joint pain, chest tightness)...",
    onsetQuestion: "When did it start?",
    onsetPlaceholder: "e.g., 3 days ago, 2 weeks ago, this morning",
    courseQuestion: "Has it become better, worse, or stayed the same?",
    courseBetter: "Better",
    courseWorse: "Worse",
    courseSame: "Stayed the same",
    severityQuestion: "How severe is your discomfort? (1 = Mild, 10 = Severe)",
    aggravatingQuestion: "Does anything make it worse?",
    aggravatingPlaceholder: "e.g., walking stairs, cold air, after eating",
    relievingQuestion: "Does anything make it better?",
    relievingPlaceholder: "e.g., resting, warm water, lying down",

    // Step 3: Medical History
    step3_title: "Do you have any of these conditions?",
    step3_desc: "Tap your answer for each condition. If Yes, share details if you know.",
    cond_diabetes: "Diabetes (High Blood Sugar)",
    cond_bp: "High Blood Pressure (Hypertension)",
    cond_heart: "Heart Disease",
    cond_asthma: "Asthma or Breathing Trouble",
    cond_kidney: "Kidney Problems",
    cond_liver: "Liver Problems",
    cond_thyroid: "Thyroid Disorder",
    cond_surgery: "Major Past Surgeries",
    cond_hospital: "Past Hospitalizations",
    yes: "Yes",
    no: "No",
    notSure: "Not sure",
    detailsIfYes: "Details (e.g. diagnosed 3 years ago, surgery name)",

    // Step 4: Medications
    step4_title: "Are you currently taking any medicines?",
    step4_desc: "Include regular prescription tablets, inhalers, or daily supplements.",
    medName: "Medicine Name",
    medDose: "Dose (e.g. 500mg)",
    medFreq: "Frequency (e.g. Once daily, Twice after meals)",
    medReason: "Reason for taking it",
    addMedicine: "+ Add Another Medicine",
    dontKnowMeds: "I don't know my medicine names",
    noMeds: "I am not taking any medicines",

    // Step 5: Allergies
    step5_title: "Do you have any known allergies?",
    step5_desc: "It is crucial to inform the doctor if any medicines or foods cause allergic reactions.",
    noAllergies: "I have NO known allergies",
    hasAllergies: "I have known allergies",
    allergenName: "Allergen (e.g. Penicillin, Sulfa, Peanuts, Dust)",
    allergyReaction: "Reaction (e.g. Skin rash, Facial swelling, Breathing difficulty)",
    allergyType: "Allergy Category",

    // Step 6: Lifestyle
    step6_title: "Lifestyle & Daily Routine",
    smokingQ: "Smoking / Tobacco",
    alcoholQ: "Alcohol Consumption",
    exerciseQ: "Physical Activity / Exercise",
    sleepQ: "Average Nightly Sleep",
    dietQ: "Dietary Preference",
    occupationQ: "Occupation / Daily Work",

    // Step 7: Reports
    step7_title: "Upload Previous Medical Reports",
    step7_desc: "Upload previous blood tests, prescriptions, or X-rays (PDF, JPG, PNG). Our system will automatically read key test values.",
    uploadPrompt: "Drag & drop or tap to select report file",
    ocrStatus: "Report Analysis Status",
    extractedValues: "Extracted Clinical Values",

    // Step 8: Review
    step8_title: "Review & Verify Your Information",
    step8_desc: "Please verify your answers and extracted lab numbers before sending to the doctor. You can edit any field.",

    // Step 9: Submission Handover
    step9_title: "Information Securely Transmitted",
    step9_desc: "Your pre-consultation medical summary has been prepared and sent directly to the doctor's workstation.",
    step9_instruction: "Please take a seat in the waiting lounge. The doctor will call your name shortly with your complete intake history already reviewed.",
    startNewKiosk: "Finish & Return to Start Screen",

    // Voice Interaction
    tapToSpeak: "Tap to Speak",
    listening: "Listening... speak clearly",
    stopListening: "Stop Listening",
    retryVoice: "Retry Voice",
    voiceUnavailable: "Voice input is not supported in this browser. Please type your answers.",

    // Safety Disclaimer
    medicalDisclaimer: "AI-Assisted Intake Tool: MediKiosk organizes and summarizes clinical information for clinician review. It does not diagnose diseases or prescribe medications. All clinical decisions remain with the registered doctor.",
  },

  hi: {
    // Nav & General
    appTitle: "मेडीकियोस्क",
    appSubtitle: "एआई-संवर्धित पूर्व-परामर्श प्रणाली",
    welcome: "स्वागत है",
    login: "लॉगिन करें",
    register: "पंजीकरण",
    logout: "लॉगआउट",
    dashboard: "डैशबोर्ड",
    kioskMode: "कियोस्क मोड",
    profile: "चिकित्सा प्रोफ़ाइल",
    history: "परामर्श इतिहास",
    reports: "मेडिकल रिपोर्ट्स",
    safetyNotice: "चिकित्सा सुरक्षा व एआई सीमाएं",
    switchLanguage: "भाषा",
    back: "पीछे",
    next: "आगे बढ़ें",
    submit: "जमा करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    reviewed: "समीक्षित",
    pending: "समीक्षा लंबित",
    status: "स्थिति",
    date: "दिनांक",
    action: "कार्रवाई",

    // Kiosk Steps
    step1: "व्यक्तिगत जानकारी",
    step2: "मुख्य समस्या",
    step3: "चिकित्सा इतिहास",
    step4: "दवाइयां",
    step5: "एलर्जी",
    step6: "जीवनशैली",
    step7: "पुरानी रिपोर्ट्स",
    step8: "समीक्षा व पुष्टि",
    step9: "समापन",

    // Step 1: Personal Info
    step1_title: "अपनी व्यक्तिगत जानकारी की पुष्टि करें",
    step1_desc: "आगे बढ़ने से पहले कृपया अपनी पहचान और आपातकालीन संपर्क विवरण की जांच करें।",
    fullName: "पूरा नाम",
    age: "आयु",
    gender: "लिंग",
    phone: "फ़ोन नंबर",
    emergencyContact: "आपातकालीन संपर्क",

    // Step 2: Main Complaint
    step2_title: "आज आपकी मुख्य समस्या क्या है?",
    step2_placeholder: "बताएं कि आप कैसा महसूस कर रहे हैं (जैसे बुखार, खांसी, जोड़ों का दर्द, सीने में भारीपन)...",
    onsetQuestion: "यह कब शुरू हुआ?",
    onsetPlaceholder: "जैसे 3 दिन पहले, 2 सप्ताह पहले, आज सुबह",
    courseQuestion: "क्या यह बेहतर हुआ है, बदतर हुआ है, या वैसा ही है?",
    courseBetter: "बेहतर हुआ है",
    courseWorse: "बदतर हुआ है",
    courseSame: "वैसा ही है",
    severityQuestion: "तकलीफ कितनी गंभीर है? (1 = हल्की, 10 = अत्यधिक)",
    aggravatingQuestion: "क्या किसी चीज से यह बढ़ जाता है?",
    aggravatingPlaceholder: "जैसे सीढ़ियां चढ़ना, ठंडी हवा, खाने के बाद",
    relievingQuestion: "क्या किसी चीज से आराम मिलता है?",
    relievingPlaceholder: "जैसे आराम करना, गर्म पानी, लेटना",

    // Step 3: Medical History
    step3_title: "क्या आपको इनमें से कोई बीमारी है?",
    step3_desc: "प्रत्येक स्थिति के लिए अपना उत्तर चुनें। यदि 'हाँ', तो विवरण लिखें।",
    cond_diabetes: "मधुमेह (शुगर / Diabetes)",
    cond_bp: "उच्च रक्तचाप (High BP)",
    cond_heart: "हृदय रोग (Heart Disease)",
    cond_asthma: "अस्थमा या सांस लेने में तकलीफ",
    cond_kidney: "गुर्दे (Kidney) की समस्या",
    cond_liver: "लिवर की समस्या",
    cond_thyroid: "थायराइड विकार",
    cond_surgery: "कोई पुरानी बड़ी सर्जरी",
    cond_hospital: "पहले अस्पताल में भर्ती होना पड़ा?",
    yes: "हाँ",
    no: "नहीं",
    notSure: "पक्का नहीं पता",
    detailsIfYes: "विवरण (जैसे 3 साल पहले पता चला, ऑपरेशन का नाम)",

    // Step 4: Medications
    step4_title: "क्या आप अभी कोई दवा ले रहे हैं?",
    step4_desc: "नियमित गोलियां, इन्हेलर या दैनिक सप्लीमेंट्स शामिल करें।",
    medName: "दवा का नाम",
    medDose: "खुराक (जैसे 500mg)",
    medFreq: "आवृत्ति (जैसे दिन में एक बार, खाने के बाद दो बार)",
    medReason: "दवा लेने का कारण",
    addMedicine: "+ अन्य दवा जोड़ें",
    dontKnowMeds: "मुझे अपनी दवाओं के नाम नहीं पता",
    noMeds: "मैं कोई दवा नहीं ले रहा हूँ",

    // Step 5: Allergies
    step5_title: "क्या आपको कोई ज्ञात एलर्जी है?",
    step5_desc: "यदि किसी दवा या भोजन से एलर्जी की प्रतिक्रिया होती है तो डॉक्टर को सूचित करना अत्यंत महत्वपूर्ण है।",
    noAllergies: "मुझे कोई ज्ञात एलर्जी नहीं है",
    hasAllergies: "मुझे एलर्जी है",
    allergenName: "एलर्जी का कारण (जैसे पेनिसिलिन, सल्फा, मूंगफली, धूल)",
    allergyReaction: "प्रतिक्रिया (जैसे चकत्ते, चेहरे पर सूजन, सांस फूलना)",
    allergyType: "एलर्जी की श्रेणी",

    // Step 6: Lifestyle
    step6_title: "जीवनशैली और दिनचर्या",
    smokingQ: "धूम्रपान / तंबाकू",
    alcoholQ: "शराब का सेवन",
    exerciseQ: "व्यायाम / शारीरिक गतिविधि",
    sleepQ: "रात की नींद (घंटे)",
    dietQ: "आहार प्राथमिकता",
    occupationQ: "व्यवसाय / काम",

    // Step 7: Reports
    step7_title: "पिछली मेडिकल रिपोर्ट्स अपलोड करें",
    step7_desc: "पिछली खून की जांच, पर्ची या एक्स-रे अपलोड करें (PDF, JPG, PNG)। प्रणाली मुख्य जांच परिणाम स्वचालित रूप से पढ़ लेगी।",
    uploadPrompt: "फाइल यहां खींचें या चुनने के लिए टैप करें",
    ocrStatus: "रिपोर्ट विश्लेषण स्थिति",
    extractedValues: "निकाले गए नैदानिक मान",

    // Step 8: Review
    step8_title: "अपनी जानकारी की समीक्षा और पुष्टि करें",
    step8_desc: "डॉक्टर को भेजने से पहले कृपया अपने उत्तरों और निकाली गई जांच रिपोर्ट की जांच करें। आप किसी भी जानकारी को बदल सकते हैं।",

    // Step 9: Submission Handover
    step9_title: "जानकारी सुरक्षित रूप से भेज दी गई है",
    step9_desc: "आपका पूर्व-परामर्श मेडिकल सारांश तैयार कर डॉक्टर के कंप्यूटर पर भेज दिया गया है।",
    step9_instruction: "कृपया प्रतीक्षा कक्ष में बैठें। डॉक्टर जल्द ही आपका नाम पुकारेंगे।",
    startNewKiosk: "समाप्त करें और मुख्य स्क्रीन पर लौटें",

    // Voice Interaction
    tapToSpeak: "बोलने के लिए टैप करें",
    listening: "सुन रहे हैं... कृपया स्पष्ट बोलें",
    stopListening: "बोलना बंद करें",
    retryVoice: "पुनः प्रयास करें",
    voiceUnavailable: "इस ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है। कृपया लिखकर जवाब दें।",

    // Safety Disclaimer
    medicalDisclaimer: "चिकित्सा सुरक्षा सूचना: मेडीकियोस्क डॉक्टर के अवलोकन के लिए जानकारी को व्यवस्थित करता है। यह स्वयं रोग का निदान नहीं करता और न ही दवा लिखता है। सभी निर्णय पंजीकृत डॉक्टर द्वारा लिए जाते हैं।",
  },

  mr: {
    // Nav & General
    appTitle: "मेडीकियोस्क",
    appSubtitle: "एआय-संवर्धित पूर्व-सल्ला प्रणाली",
    welcome: "स्वागत आहे",
    login: "लॉगिन करा",
    register: "नोंदणी",
    logout: "लॉगआउट",
    dashboard: "डॅशबोर्ड",
    kioskMode: "कियोस्क मोड",
    profile: "वैद्यकीय प्रोफाईल",
    history: "सल्ला इतिहास",
    reports: "वैद्यकीय अहवाल",
    safetyNotice: "वैद्यकीय सुरक्षा व एआय मर्यादा",
    switchLanguage: "भाषा",
    back: "मागे",
    next: "पुढे जा",
    submit: "सादर करा",
    save: "जतन करा",
    cancel: "रद्द करा",
    edit: "संपादित करा",
    delete: "हटवा",
    reviewed: "तपासले",
    pending: "तपासणी बाकी",
    status: "स्थिती",
    date: "तारीख",
    action: "कृती",

    // Kiosk Steps
    step1: "वैयक्तिक माहिती",
    step2: "मुख्य समस्या",
    step3: "वैद्यकीय इतिहास",
    step4: "औषधे",
    step5: "अ‍ॅलर्जी",
    step6: "जीवनशैली",
    step7: "मागील अहवाल",
    step8: "तपासणी व खात्री",
    step9: "समाप्ती",

    // Step 1: Personal Info
    step1_title: "आपल्या वैयक्तिक माहितीची खात्री करा",
    step1_desc: "पुढे जाण्यापूर्वी कृपया आपली ओळख आणि आपत्कालीन संपर्क तपशील तपासा.",
    fullName: "पूर्ण नाव",
    age: "वय",
    gender: "लिंग",
    phone: "फोन नंबर",
    emergencyContact: "आपत्कालीन संपर्क",

    // Step 2: Main Complaint
    step2_title: "आज तुमची मुख्य समस्या काय आहे?",
    step2_placeholder: "तुम्हाला काय त्रास होत आहे ते सांगा (उदा. ताप, खोकला, सांधेदुखी, छातीत अस्वस्थता)...",
    onsetQuestion: "हा त्रास कधी सुरू झाला?",
    onsetPlaceholder: "उदा. ३ दिवसांपूर्वी, २ आठवड्यांपूर्वी, आज सकाळी",
    courseQuestion: "त्रास कमी झाला आहे, वाढला आहे की तसाच आहे?",
    courseBetter: "कमी झाला आहे",
    courseWorse: "वाढला आहे",
    courseSame: "तसाच आहे",
    severityQuestion: "त्रास किती तीव्र आहे? (१ = सौम्य, १० = अत्यंत तीव्र)",
    aggravatingQuestion: "कशाने त्रास वाढतो का?",
    aggravatingPlaceholder: "उदा. पायऱ्या चढणे, थंड हवा, जेवणानंतर",
    relievingQuestion: "कशाने आराम मिळतो का?",
    relievingPlaceholder: "उदा. विश्रांती, कोमट पाणी, झोपणे",

    // Step 3: Medical History
    step3_title: "तुम्हाला यापैकी कोणताही आजार आहे का?",
    step3_desc: "प्रत्येक आजारासाठी उत्तर निवडा. 'होय' असल्यास तपशील द्या.",
    cond_diabetes: "मधुमेह (शुगर / Diabetes)",
    cond_bp: "उच्च रक्तदाब (High BP)",
    cond_heart: "हृदयरोग (Heart Disease)",
    cond_asthma: "दमा किंवा श्वास घेण्यास त्रास",
    cond_kidney: "मूत्रपिंड (Kidney) समस्या",
    cond_liver: "यकृत (Liver) समस्या",
    cond_thyroid: "थायरॉईड विकार",
    cond_surgery: "मागील मोठी शस्त्रक्रिया",
    cond_hospital: "यापूर्वी रुग्णालयात दाखल व्हावे लागले का?",
    yes: "होय",
    no: "नाही",
    notSure: "माहित नाही",
    detailsIfYes: "तपशील (उदा. ३ वर्षांपूर्वी निदान, शस्त्रक्रियेचे नाव)",

    // Step 4: Medications
    step4_title: "तुम्ही सध्या कोणती औषधे घेत आहात का?",
    step4_desc: "नियमित गोळ्या, इनहेलर किंवा दैनंदिन जीवनसत्त्वे नमूद करा.",
    medName: "औषधाचे नाव",
    medDose: "डोस (उदा. 500mg)",
    medFreq: "कधी घेता (उदा. दिवसातून एकदा, जेवणानंतर दोनदा)",
    medReason: "औषध घेण्याचे कारण",
    addMedicine: "+ दुसरे औषध जोडा",
    dontKnowMeds: "मला माझ्या औषधांची नावे माहित नाहीत",
    noMeds: "मी कोणतीही औषधे घेत नाही",

    // Step 5: Allergies
    step5_title: "तुम्हाला कोणतीही ज्ञात अ‍ॅलर्जी आहे का?",
    step5_desc: "कोणत्याही औषधामुळे किंवा अन्नामुळे अ‍ॅलर्जीचा त्रास होत असल्यास डॉक्टरांना कळवणे अत्यंत महत्त्वाचे आहे.",
    noAllergies: "मला कोणतीही ज्ञात अ‍ॅलर्जी नाही",
    hasAllergies: "मला अ‍ॅलर्जी आहे",
    allergenName: "अ‍ॅलर्जी कशाची आहे (उदा. पेनिसिलिन, सल्फा, शेंगदाणे, धूळ)",
    allergyReaction: "काय त्रास होतो (उदा. पुरळ, चेहऱ्यावर सूज, श्वास लागणे)",
    allergyType: "अ‍ॅलर्जीचा प्रकार",

    // Step 6: Lifestyle
    step6_title: "जीवनशैली व दैनंदिन दिनचर्या",
    smokingQ: "धूम्रपान / तंबाखू",
    alcoholQ: "मद्यपान",
    exerciseQ: "व्यायाम / शारीरिक हालचाल",
    sleepQ: "रात्रीची झोप (तास)",
    dietQ: "आहार प्रकार",
    occupationQ: "व्यवसाय / काम",

    // Step 7: Reports
    step7_title: "मागील वैद्यकीय अहवाल (Reports) अपलोड करा",
    step7_desc: "मागील रक्त तपासणी, प्रिस्क्रिप्शन किंवा एक्स-रे अपलोड करा (PDF, JPG, PNG). प्रणाली आपोआप तपासणी निकाल वाचेल.",
    uploadPrompt: "फाइल येथे ड्रॅग करा किंवा निवडण्यासाठी टॅप करा",
    ocrStatus: "अहवाल विश्लेषण स्थिती",
    extractedValues: "वाचलेले वैद्यकीय निष्कर्ष",

    // Step 8: Review
    step8_title: "माहिती तपासा आणि खात्री करा",
    step8_desc: "डॉक्टरांकडे पाठवण्यापूर्वी कृपया आपली उत्तरे व अहवाल तपासा. आपण कोणतीही माहिती बदलू शकता.",

    // Step 9: Submission Handover
    step9_title: "माहिती सुरक्षितपणे पाठवली गेली आहे",
    step9_desc: "आपला पूर्व-सल्ला सारांश तयार करून डॉक्टरांच्या कॉम्प्युटरवर पाठवण्यात आला आहे.",
    step9_instruction: "कृपया प्रतीक्षालयात बसावे. डॉक्टर लवकरच आपले नाव पुकारतील.",
    startNewKiosk: "पूर्ण करा आणि मुख्य स्क्रीनवर जा",

    // Voice Interaction
    tapToSpeak: "बोलण्यासाठी टॅप करा",
    listening: "ऐकत आहे... कृपया स्पष्ट बोला",
    stopListening: "बोलणे थांबवा",
    retryVoice: "पुन्हा प्रयत्न करा",
    voiceUnavailable: "या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया टाइप करून उत्तरे द्या.",

    // Safety Disclaimer
    medicalDisclaimer: "वैद्यकीय सुरक्षा सूचना: मेडीकियोस्क डॉक्टरांच्या तपासणीसाठी माहिती व्यवस्थित करतो. ही प्रणाली स्वतः आजाराचे निदान करत नाही किंवा औषध देत नाही. सर्व निर्णय नोंदणीकृत डॉक्टर घेतात.",
  },
};
