// ==============================================================
// RYTHU MITRA AI (రైతు మిత్ర AI) — MULTILINGUAL TRANSLATIONS
// English, Telugu (తెలుగు), Hindi (हिंदी)
// ==============================================================

const TRANSLATIONS = {
  en: {
    app_title: "RYTHU MITRA AI",
    app_subtitle: "3D Smart Farming & AI Agronomist",
    nav_farm3d: "3D Farm Visualizer",
    nav_doctor: "AI Crop Doctor",
    nav_weather: "Live Weather & Advisory",
    nav_mandi: "Mandi Prices & MSP",
    nav_crops: "Crop Recommendations",
    nav_schemes: "Government Schemes",
    nav_guidance: "Organic Recipes & IPM",
    nav_profile: "Farmer Profile",
    btn_login: "Login / Register",
    btn_logout: "Logout",
    contrast_toggle: "High Contrast (Sunlight Mode)",
    select_language: "Language",
    
    // 3D Farm
    farm_title: "3D Digital Twin Farm Visualizer",
    farm_desc: "Interactive 3D field monitoring with IoT soil sensors, drone survey mode, and smart irrigation.",
    btn_day_night: "Toggle Day/Night",
    btn_rain: "Simulate Rain",
    btn_drone: "Drone Survey Mode",
    btn_irrigate: "Trigger Smart Drip",
    soil_moisture: "Soil Moisture",
    soil_temp: "Soil Temp",
    soil_ph: "Soil pH",
    npk_levels: "NPK (Nitrogen-Phosphorus-Potash)",
    
    // Crop Doctor
    doctor_title: "AI Crop Disease Diagnostic Doctor",
    doctor_desc: "Upload a leaf photo, capture via live camera, or simply speak your crop symptoms in your language.",
    tab_photo: "Photo / Camera Scan",
    tab_voice: "Voice / Speech Input",
    select_crop_label: "Select Crop",
    upload_photo_prompt: "Click to upload leaf photo or drag & drop image here",
    btn_open_camera: "Open Live Camera",
    btn_capture: "Capture Snapshot",
    btn_cancel_cam: "Cancel Camera",
    mic_prompt: "Click Microphone & Speak Symptoms",
    mic_recording: "Listening... Speak now",
    describe_placeholder: "Describe leaf discoloration, insects, wilting, or drying symptoms...",
    btn_diagnose: "Analyze Disease with AI Doctor",
    btn_listen_result: "Listen to Diagnosis",
    possible_causes: "Possible Causes",
    symptoms_observed: "Observable Symptoms",
    organic_treatment: "Organic & Bio-Control Remedies",
    chemical_treatment: "Scientific Chemical Treatments (Dosage/Liter)",
    preventive_measures: "Agronomic Preventive Measures",
    
    // Weather
    weather_title: "Live Hyperlocal Weather & Spray Advisory",
    weather_desc: "Real-time satellite & radar forecasts to protect crops from sudden rain and optimize spray windows.",
    select_district: "Select Agri-District",
    btn_locate_me: "Use My Exact Farm Location",
    spray_window: "Spraying Condition Window",
    rainfall_forecast: "Rainfall & Precipitation Probability",
    humidity: "Humidity",
    wind_speed: "Wind Speed",
    btn_listen_weather: "Listen to Weather Advisory",
    
    // Mandi
    mandi_title: "Live Mandi Commodity Prices & MSP Trends",
    mandi_desc: "Daily APMC market rates, Government MSP comparison, and AI Best-Time-To-Sell advisory.",
    search_commodity: "Search commodity (e.g. Paddy, Cotton, Chilli)...",
    modal_price: "Modal Rate",
    msp_rate: "Govt MSP",
    selling_advice: "Best Time to Sell Advisory",
    
    // Crop Rec
    crop_rec_title: "Intelligent Crop Planning Engine",
    crop_rec_desc: "Select your farm's soil type, season, and irrigation to discover highest-yielding crops.",
    soil_type: "Soil Type",
    season: "Crop Season",
    water_source: "Water / Irrigation Source",
    land_acres: "Land Size (Acres)",
    btn_calculate_crops: "Find Best Crops",
    expected_yield: "Expected Yield",
    projected_profit: "Estimated Net Profit",
    
    // Schemes
    schemes_title: "Government Agricultural Schemes & Subsidies",
    schemes_desc: "Central and State welfare programs, direct DBT transfers, crop insurance, and solar pump subsidies.",
    benefit: "Financial Benefit",
    eligibility: "Eligibility Criteria",
    apply_now: "Official Portal Link",
    
    // Organic
    organic_title: "Organic Formulations & Integrated Pest Management",
    organic_desc: "Traditional proven natural pest repellents, biostimulants, and soil enrichment recipes.",
    
    // Auth Modal
    modal_login_title: "Farmer Login",
    modal_register_title: "New Farmer Registration",
    label_phone: "10-Digit Mobile Number",
    label_password: "Password",
    label_name: "Farmer Full Name",
    label_village: "Village / Gramam",
    label_district: "District",
    label_primary_crop: "Primary Crop Grown",
    btn_submit_login: "Log In",
    btn_submit_register: "Register Farmer Account",
    switch_to_register: "New farmer? Click here to register",
    switch_to_login: "Already registered? Click here to log in"
  },

  te: {
    app_title: "రైతు మిత్ర AI",
    app_subtitle: "3D స్మార్ట్ ఫార్మింగ్ & AI వ్యవసాయ సలహాదారు",
    nav_farm3d: "3D డిజిటల్ ఫారమ్",
    nav_doctor: "AI పంట వైద్యుడు",
    nav_weather: "వాతావరణం & సలహాలు",
    nav_mandi: "మార్కెట్ ధరలు & MSP",
    nav_crops: "లాభసాటి పంటలు",
    nav_schemes: "ప్రభుత్వ పథకాలు",
    nav_guidance: "సేంద్రీయ కషాయాలు",
    nav_profile: "రైతు ప్రొఫైల్",
    btn_login: "లాగిన్ / నమోదు",
    btn_logout: "లాగౌట్",
    contrast_toggle: "ఎండ వెలుతురు మోడ్ (హై కాంట్రాస్ట్)",
    select_language: "భాష",
    
    // 3D Farm
    farm_title: "3D వ్యవసాయ క్షేత్ర దృశ్యం (డిజిటల్ ట్విన్)",
    farm_desc: "భూసార సెన్సార్లు, డ్రోన్ సర్వే మరియు స్మార్ట్ బిందు సేద్యంతో 3D లో మీ పొలాన్ని పర్యవేక్షించండి.",
    btn_day_night: "పగలు / రాత్రి మార్చండి",
    btn_rain: "వర్షం దృశ్యం",
    btn_drone: "డ్రోన్ సర్వే మోడ్",
    btn_irrigate: "డ్రిప్ నీటి తడులు ఇవ్వండి",
    soil_moisture: "నేలలో తేమ శాతం",
    soil_temp: "నేల ఉష్ణోగ్రత",
    soil_ph: "నేల పి.హెచ్ (pH)",
    npk_levels: "ఎరువుల మోతాదు (NPK)",
    
    // Crop Doctor
    doctor_title: "AI పంట రోగ నిర్ధారణ వైద్యుడు",
    doctor_desc: "ఆకు ఫోటో తీసి అప్‌లోడ్ చేయండి లేదా మీ పంట సమస్యను తెలుగులో మాట్లాడి వివరించండి.",
    tab_photo: "ఫోటో / కెమెరా స్కాన్",
    tab_voice: "వాయిస్ / తెలుగులో మాట్లాడండి",
    select_crop_label: "పంటను ఎంచుకోండి",
    upload_photo_prompt: "ఆకు ఫోటోను అప్‌లోడ్ చేయడానికి ఇక్కడ తాకండి",
    btn_open_camera: "లైవ్ కెమెరా తెరవండి",
    btn_capture: "ఫోటో తీయండి",
    btn_cancel_cam: "కెమెరా మూసివేయండి",
    mic_prompt: "మైక్రోఫోన్ నొక్కి సమస్యను చెప్పండి",
    mic_recording: "వింటున్నాము... మాట్లాడండి",
    describe_placeholder: "ఆకులు ఎండిపోవడం, ముడత, పురుగులు లేదా మచ్చల సమస్యను చెప్పండి...",
    btn_diagnose: "AI డాక్టర్‌తో రోగ నిర్ధారణ చేయండి",
    btn_listen_result: "సలహాను వినండి (ఆడియో)",
    possible_causes: "తెగులు రావడానికి కారణాలు",
    symptoms_observed: "పంటలో కనిపించే లక్షణాలు",
    organic_treatment: "సేంద్రీయ & జీవ నియంత్రణ మందులు",
    chemical_treatment: "రసాయన నివారణ చర్యలు (లీటరు నీటికి మోతాదు)",
    preventive_measures: "ముందస్తు జాగ్రత్తలు",
    
    // Weather
    weather_title: "లైవ్ వాతావరణం & పిచికారీ సలహాలు",
    weather_desc: "వర్షం సూచనలు, గాలి వేగం మరియు మందుల పిచికారీకి అనువైన సమయం తెలుసుకోండి.",
    select_district: "వ్యవసాయ జిల్లాను ఎంచుకోండి",
    btn_locate_me: "నా పొలం లొకేషన్ గుర్తించు",
    spray_window: "పిచికారీ అనుకూలత",
    rainfall_forecast: "వర్షపాత సూచన",
    humidity: "గాలిలో తేమ",
    wind_speed: "గాలి వేగం",
    btn_listen_weather: "వాతావరణ సలహాను వినండి",
    
    // Mandi
    mandi_title: "లైవ్ మార్కెట్ యార్డ్ ధరలు & మద్దతు ధర (MSP)",
    mandi_desc: "వరంగల్, గుంటూరు మార్కెట్లలో తాజా క్వింటాల్ ధరలు మరియు ఎప్పుడు అమ్మాలో AI సలహా.",
    search_commodity: "పంట పేరును శోధించండి (ఉదా: వరి, పత్తి, మిరప)...",
    modal_price: "సగటు ధర (క్వింటాలుకు)",
    msp_rate: "కనీస మద్దతు ధర (MSP)",
    selling_advice: "అమ్మకపు AI సలహా",
    
    // Crop Rec
    crop_rec_title: "భూసార ఆధారిత పంట ప్రణాళిక",
    crop_rec_desc: "మీ నేల స్వభావం, కాలం మరియు నీటి వసతిని బట్టి అత్యధిక లాభాలనిచ్చే పంటలు.",
    soil_type: "నేల స్వభావం",
    season: "పంట కాలం",
    water_source: "నీటి వనరు",
    land_acres: "భూమి విస్తీర్ణం (ఎకరాలు)",
    btn_calculate_crops: "అనువైన పంటలను కనుగొనండి",
    expected_yield: "ఆశించే దిగుబడి",
    projected_profit: "అంచనా నికర లాభం",
    
    // Schemes
    schemes_title: "ప్రభుత్వ వ్యవసాయ పథకాలు & రాయితీలు",
    schemes_desc: "పీఎం కిసాన్, రైతు భరోసా, పంటల బీమా మరియు సోలార్ పంపుసెట్ల పూర్తి వివరాలు.",
    benefit: "లభించే ఆర్థిక ప్రయోజనం",
    eligibility: "అర్హత నిబంధనలు",
    apply_now: "అధికారిక వెబ్‌సైట్ లింక్",
    
    // Organic
    organic_title: "సేంద్రీయ కషాయాలు & జీవామృతం తయారీ",
    organic_desc: "రసాయనాలు లేకుండా ఇంట్లోనే జీవామృతం, నిమాస్త్రం మరియు బ్రహ్మాస్త్రం తయారు చేసుకోండి.",
    
    // Auth Modal
    modal_login_title: "రైతు లాగిన్",
    modal_register_title: "నూతన రైతు నమోదు",
    label_phone: "10 అంకెల మొబైల్ నంబర్",
    label_password: "పాస్‌వర్డ్",
    label_name: "రైతు పూర్తి పేరు",
    label_village: "గ్రామం",
    label_district: "జిల్లా",
    label_primary_crop: "ప్రధాన పంట",
    btn_submit_login: "లాగిన్ అవ్వండి",
    btn_submit_register: "ఖాతా నమోదు చేయండి",
    switch_to_register: "కొత్త రైతా? నమోదు కోసం ఇక్కడ నొక్కండి",
    switch_to_login: "ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి"
  },

  hi: {
    app_title: "रैतु मित्रा AI",
    app_subtitle: "3D स्मार्ट फार्मिंग और AI कृषि सलाहकार",
    nav_farm3d: "3D फार्म दृश्य",
    nav_doctor: "AI फसल डॉक्टर",
    nav_weather: "मौसम और सलाह",
    nav_mandi: "मंडी भाव और MSP",
    nav_crops: "उपयुक्त फसलें",
    nav_schemes: "सरकारी योजनाएं",
    nav_guidance: "जैविक कीटनाशक",
    nav_profile: "किसान प्रोफाइल",
    btn_login: "लॉग इन / पंजीकरण",
    btn_logout: "लॉग आउट",
    contrast_toggle: "धूप मोड (हाई कंट्रास्ट)",
    select_language: "भाषा",
    
    // 3D Farm
    farm_title: "3D डिजिटल ट्विन फार्म दृश्य",
    farm_desc: "इंटरैक्टिव 3D निगरानी, आईओटी सेंसर और स्मार्ट ड्रिप सिंचाई प्रणाली।",
    btn_day_night: "दिन / रात बदलें",
    btn_rain: "बारिश सिमुलेशन",
    btn_drone: "ड्रोन सर्वे मोड",
    btn_irrigate: "ड्रिप सिंचाई शुरू करें",
    soil_moisture: "मिट्टी में नमी",
    soil_temp: "मिट्टी का तापमान",
    soil_ph: "मिट्टी का पीएच",
    npk_levels: "एनपीके (नाइट्रोजन-फास्फोरस-पोटाश)",
    
    // Crop Doctor
    doctor_title: "AI फसल रोग निदान डॉक्टर",
    doctor_desc: "पत्ती की फोटो अपलोड करें, लाइव कैमरा से स्कैन करें या बोलकर लक्षण बताएं।",
    tab_photo: "फोटो / कैमरा स्कैन",
    tab_voice: "बोलकर बताएं",
    select_crop_label: "फसल चुनें",
    upload_photo_prompt: "पत्ती की फोटो अपलोड करने के लिए क्लिक करें",
    btn_open_camera: "लाइव कैमरा खोलें",
    btn_capture: "फोटो लें",
    btn_cancel_cam: "कैमरा बंद करें",
    mic_prompt: "माइक दबाकर फसल की समस्या बताएं",
    mic_recording: "सुन रहे हैं... बोलिए",
    describe_placeholder: "पत्तियों का पीला पड़ना, कीड़े, धब्बे या सूखने के लक्षण बताएं...",
    btn_diagnose: "AI डॉक्टर से जांच करवाएं",
    btn_listen_result: "निदान सुनें (ऑडियो)",
    possible_causes: "रोग के संभावित कारण",
    symptoms_observed: "दिखने वाले लक्षण",
    organic_treatment: "जैविक और प्राकृतिक उपचार",
    chemical_treatment: "वैज्ञानिक रासायनिक उपचार (प्रति लीटर मात्रा)",
    preventive_measures: "बचाव के उपाय",
    
    // Weather
    weather_title: "लाइव मौसम और छिड़काव सलाह",
    weather_desc: "सटीक मौसम पूर्वानुमान और फसलों पर कीटनाशक छिड़काव का सही समय।",
    select_district: "कृषि जिला चुनें",
    btn_locate_me: "मेरे खेत का स्थान चुनें",
    spray_window: "छिड़काव अनुकूलता",
    rainfall_forecast: "बारिश की संभावना",
    humidity: "हवा में नमी",
    wind_speed: "हवा की गति",
    btn_listen_weather: "मौसम सलाह सुनें",
    
    // Mandi
    mandi_title: "लाइव मंडी भाव और न्यूनतम समर्थन मूल्य (MSP)",
    mandi_desc: "प्रमुख मंडियों के दैनिक भाव और कब बेचने में सबसे ज्यादा फायदा होगा।",
    search_commodity: "फसल का नाम खोजें (जैसे धान, कपास, मिर्च)...",
    modal_price: "औसत भाव (प्रति क्विंटल)",
    msp_rate: "सरकारी एमएसपी",
    selling_advice: "बेचने की AI सलाह",
    
    // Crop Rec
    crop_rec_title: "मिट्टी अनुसार फसल चयन",
    crop_rec_desc: "अपनी मिट्टी और मौसम के आधार पर सबसे ज्यादा मुनाफा देने वाली फसलें चुनें।",
    soil_type: "मिट्टी का प्रकार",
    season: "फसल का मौसम",
    water_source: "सिंचाई का साधन",
    land_acres: "जमीन (एकड़)",
    btn_calculate_crops: "सही फसलें खोजें",
    expected_yield: "संभावित पैदावार",
    projected_profit: "अनुमानित शुद्ध मुनाफा",
    
    // Schemes
    schemes_title: "सरकारी कृषि योजनाएं और अनुदान",
    schemes_desc: "पीएम किसान, फसल बीमा, सोलर पंप और ड्रिप सब्सिडी की पूरी जानकारी।",
    benefit: "वित्तीय लाभ",
    eligibility: "पात्रता",
    apply_now: "आधिकारिक वेबसाइट लिंक",
    
    // Organic
    organic_title: "जीवामृत और प्राकृतिक कीटनाशक",
    organic_desc: "बिना जहरीले रसायनों के घर पर जीवामृत और नीमास्त्र बनाने की प्रामाणिक विधि।",
    
    // Auth Modal
    modal_login_title: "किसान लॉगिन",
    modal_register_title: "नया किसान पंजीकरण",
    label_phone: "10 अंकों का मोबाइल नंबर",
    label_password: "पासवर्ड",
    label_name: "किसान का पूरा नाम",
    label_village: "गांव",
    label_district: "जिला",
    label_primary_crop: "मुख्य फसल",
    btn_submit_login: "लॉग इन करें",
    btn_submit_register: "पंजीकरण करें",
    switch_to_register: "नए किसान हैं? यहां पंजीकरण करें",
    switch_to_login: "पहले से खाता है? लॉग इन करें"
  }
};
