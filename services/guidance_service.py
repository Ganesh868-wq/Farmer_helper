from typing import Dict, Any, List, Optional

ORGANIC_FARMING_RECIPES = [
    {
        "id": "jeevamrutham",
        "name_en": "Jeevamrutham (జీవామృతం) — Soil Microbial Elixir",
        "name_te": "జీవామృతం తయారీ విధానం",
        "name_hi": "जीवामृत तैयार करने की विधि",
        "category": "soil",
        "type_label": "Microbial Biostimulant / జీవ రసాయనం",
        "purpose": "Multiplies billions of beneficial soil microorganisms, enhances earthworm activity, and unlocks insoluble nitrogen and phosphorus in soil.",
        "purpose_te": "నేలలో లాభదాయక సూక్ష్మజీవులను వృద్ధి చేసి, వానపాముల సంఖ్యను పెంచుతుంది. మొక్కలకు అవసరమైన పోషకాలను సహజంగా అందిస్తుంది.",
        "target_crops": "All crops: Paddy, Cotton, Chilli, Vegetables, Pulses, Horticulture",
        "target_crops_te": "అన్ని రకాల పంటలు: వరి, పత్తి, మిరప, కూరగాయలు, పండ్ల తోటలు",
        "ingredients": [
            "Fresh indigenous cow dung (దేశీ ఆవు పేడ): 10 kg",
            "Indigenous cow urine (దేశీ ఆవు మూత్రం): 5 to 10 liters",
            "Organic Jaggery / raw cane sugar (సేంద్రియ బెల్లం): 1 to 2 kg",
            "Pulse flour - Chickpea / Gram flour (శనగ లేదా ఉలవ పిండి): 1 to 2 kg",
            "Fertile native field bund soil (పొలం గట్టు జీవ మట్టి): Handful (200g)",
            "Clean water (నీరు): 200 liters"
        ],
        "preparation_steps": [
            "In a 200-liter plastic drum, thoroughly mix 10 kg cow dung and 5-10 liters cow urine with a wooden stick.",
            "Add crushed jaggery, pulse flour, and the handful of virgin bund soil.",
            "Fill the drum with 200 liters of clean water and stir clockwise for 2 minutes.",
            "Cover drum with a porous jute bag and keep under tree shade for 48 to 72 hours.",
            "Stir clockwise for 2 minutes morning and evening. Fermentation is complete when pleasant fermenting smell arises."
        ],
        "application_method": "Apply 200 liters per acre through irrigation water, venturi drip, or as a 10% foliar spray every 15 days.",
        "application_method_te": "ఎకరాకు 200 లీటర్లు నీటి తడులతో పాటు, డ్రిప్ ద్వారా లేదా 10% ద్రావణాన్ని పిచికారీ చేయవచ్చు.",
        "precautions": "Never use chemical drum containers. Do not boil or heat. Protect from direct harsh midday sunlight.",
        "precautions_te": "రసాయన డ్రమ్ములను వాడకూడదు. ద్రావణాన్ని వేడి చేయకూడదు. ఎండ తగలకుండా నీడలోనే ఉంచాలి."
    },
    {
        "id": "ghanajeevamrutham",
        "name_en": "Ghana Jeevamrutham (ఘనజీవామృతం) — Solid Soil Starter",
        "name_te": "ఘనజీవామృతం తయారీ విధానం",
        "name_hi": "घनजीवामृत - ठोस जैविक खाद",
        "category": "soil",
        "type_label": "Dry Microbial Manure / ఘన ఎరువు",
        "purpose": "A powerful dry organic basal starter that replaces synthetic chemical DAP and urea, providing continuous root-zone nutrition.",
        "purpose_te": "రసాయన డీఏపీ (DAP) ఎరువులకు ప్రత్యామ్నాయంగా విత్తే సమయంలో లేదా దుక్కిలో వేసే బలమైన ఘన సేంద్రియ ఎరువు.",
        "target_crops": "Paddy, Groundnut, Maize, Cotton, Pulses",
        "target_crops_te": "వరి, వేరుశనగ, మొక్కజొన్న, పత్తి మరియు పప్పుదినుసులు",
        "ingredients": [
            "Well-decomposed cow dung (బాగా చివికిన ఆవు పేడ): 100 kg",
            "Liquid Jeevamrutham (జీవామృతం ద్రావణం): 20 liters",
            "Crushed jaggery (బెల్లం): 1 kg",
            "Besan / Gram flour (శనగ పిండి): 1 kg"
        ],
        "preparation_steps": [
            "Spread 100 kg dried cow dung powder on a clean floor under shade.",
            "Sprinkle 20 liters of liquid Jeevamrutham evenly over the cow dung.",
            "Mix thoroughly with a spade to ensure uniform moisture without creating slush.",
            "Make a heap and cover with wet gunny bags for 48 hours to initiate warm microbial incubation.",
            "Spread thin, dry in shade, and pack in bags. Stores safely for up to 6 months."
        ],
        "application_method": "Broadcast 100 to 200 kg per acre as basal manure during last ploughing or sowing.",
        "application_method_te": "ఆఖరి దుక్కిలో ఎకరాకు 100 నుండి 200 కేజీలు చల్లుకోవాలి.",
        "precautions": "Do not dry under direct harsh sunlight; UV rays will kill beneficial bacteria.",
        "precautions_te": "ఎండలో ఆరబెట్టకూడదు; నీడలోనే ఆరబెట్టి నిల్వ చేసుకోవాలి."
    },
    {
        "id": "neemastra",
        "name_en": "Neemastra (నిమాస్త్రం) — Sucking Pest & Whitefly Repellent",
        "name_te": "నిమాస్త్రం తయారీ విధానం",
        "name_hi": "नीमास्त्र - रस चूसक कीट नियंत्रक",
        "category": "pest",
        "type_label": "Bio-Insecticide / కీటక నివారిణి",
        "purpose": "Controls sucking pests, early-stage borer larvae, whiteflies, jassids, and aphids within 48 hours of spraying.",
        "purpose_te": "రసం పీల్చే పురుగులు, తెల్లదోమ, పచ్చదోమ, పేనుబంక మరియు లేత దశలోని గొంగళి పురుగులను సమర్థవంతంగా అరికడుతుంది.",
        "target_crops": "Cotton, Chilli, Vegetables, Groundnut, Paddy",
        "target_crops_te": "పత్తి, మిరప, కూరగాయలు, వేరుశనగ, వరి",
        "ingredients": [
            "Fresh neem leaves & tender branches (వేప మండలు / ఆకులు): 5 kg",
            "Indigenous cow urine (ఆవు మూత్రం): 5 liters",
            "Fresh indigenous cow dung (ఆవు పేడ): 1 kg",
            "Clean water (నీరు): 100 liters"
        ],
        "preparation_steps": [
            "Pound 5 kg neem leaves into coarse paste and add to a drum containing 100 liters of water.",
            "Add 5 liters of cow urine and 1 kg fresh cow dung. Stir thoroughly with a wooden stick.",
            "Cover with cloth and let it ferment under shade for 48 hours, stirring twice daily.",
            "Filter through fine cotton khadi cloth to avoid clogging sprayer nozzles."
        ],
        "application_method": "Spray directly without dilution (100 liters/acre) in early morning or late afternoon.",
        "application_method_te": "నీరు కలపకుండా నేరుగా పంపుతో ఉదయం లేదా సాయంత్రం వేళల్లో పిచికారీ చేయాలి.",
        "precautions": "Use within 21 days of preparation. Do not mix with synthetic chemical pesticides.",
        "precautions_te": "తయారు చేసిన 21 రోజుల్లోగా వాడాలి. రసాయన మందులతో కలపకూడదు."
    },
    {
        "id": "brahmastra",
        "name_en": "Brahmastra (బ్రహ్మాస్త్రం) — Borer & Caterpillar Destroyer",
        "name_te": "బ్రహ్మాస్త్రం తయారీ విధానం",
        "name_hi": "ब्रह्मास्त्र - इल्ली और छेदक कीट नाशक",
        "category": "pest",
        "type_label": "Botanical Decoction / మూలికా కషాయం",
        "purpose": "Destroys tough pod borers, fruit borers, pink bollworms, Spodoptera, and leaf-eating caterpillars safely without synthetic poison.",
        "purpose_te": "కాయ తొలుచు పురుగులు, శనగపచ్చ పురుగు, గులాబీ రంగు పురుగు మరియు ఆకుతినే లద్దె పురుగులను నిర్మూలిస్తుంది.",
        "target_crops": "Cotton, Red Gram, Red Chilli, Tomato, Brinjal, Bengal Gram",
        "target_crops_te": "పత్తి, కందులు, మిరప, టమాటా, వంగ, శనగ",
        "ingredients": [
            "Neem leaves (వేప ఆకులు): 3 kg",
            "Custard apple leaves (సీతాఫలం ఆకులు): 2 kg",
            "Papaya leaves (బొప్పాయి ఆకులు): 2 kg",
            "Castor or Calotropis leaves (ఆముదం లేదా జిల్లేడు ఆకులు): 2 kg",
            "Pongamia / Karanj leaves (కానుగ ఆకులు): 2 kg",
            "Indigenous cow urine (ఆవు మూత్రం): 10 liters"
        ],
        "preparation_steps": [
            "Crush all 5 types of bitter and medicinal leaves together into a coarse paste.",
            "Mix the paste in 10 liters of cow urine in an earthen or stainless steel pot.",
            "Boil gently on slow fire for 15-20 minutes until the decoction reduces.",
            "Let it cool down for 48 hours in shade, then filter through cloth. Stores well for up to 6 months."
        ],
        "application_method": "Mix 250ml to 300ml of Brahmastra per 15-liter knapsack sprayer tank and spray thoroughly on foliage.",
        "application_method_te": "15 లీటర్ల స్ప్రేయర్ పంపునకు 250 నుండి 300 మి.లీ కలిపి పిచికారీ చేయాలి.",
        "precautions": "Keep out of reach of children. Wear protective gloves while handling bitter leaf extracts.",
        "precautions_te": "పిల్లలకు దూరంగా ఉంచాలి. తయారు చేసేటప్పుడు చేతులకు గ్లౌజులు ధరించడం మంచిది."
    },
    {
        "id": "agniastra",
        "name_en": "Agniastra (అగ్నియాస్త్రం) — High-Potency Leaf Miner & Borer Buster",
        "name_te": "అగ్నియాస్త్రం తయారీ విధానం",
        "name_hi": "अग्निअस्त्र - पत्ती सुरंगक और तना छेदक नाशक",
        "category": "pest",
        "type_label": "Hot Bio-Shield / తీక్షణ కీటక నాశిని",
        "purpose": "A spicy pungent bio-extract that repels leaf miners, stem borers, and heavy borer infestations where milder formulations fail.",
        "purpose_te": "ఆకుమచ్చ పురుగు, కాండం తొలిచే పురుగు మరియు తీవ్రమైన తెగుళ్లను నియంత్రించే ఘాటైన సేంద్రియ కషాయం.",
        "target_crops": "Chilli, Paddy, Maize, Cotton, Sugarcane",
        "target_crops_te": "మిరప, వరి, మొక్కజొన్న, పత్తి, చెరకు",
        "ingredients": [
            "Indigenous cow urine (ఆవు మూత్రం): 10 liters",
            "Hot green chilli paste (ఘాటైన పచ్చిమిర్చి గుజ్జు): 500 g",
            "Garlic paste (వెల్లుల్లి ముద్ద): 500 g",
            "Neem leaf pulp (వేప ఆకుల గుజ్జు): 2 kg",
            "Tobacco leaf powder (పొగాకు పొడి - Optional): 250 g"
        ],
        "preparation_steps": [
            "In an earthen pot, mix cow urine with neem pulp, chilli paste, and garlic paste.",
            "Boil gently on a slow flame for 10 minutes until aromatic vapors arise.",
            "Let it stand undisturbed for 48 hours to ferment thoroughly.",
            "Filter through fine cotton cloth and store in bottles."
        ],
        "application_method": "Dilute 200ml to 250ml in 15 liters of water and spray targeting infested stems and leaf undersides.",
        "application_method_te": "15 లీటర్ల నీటికి 200-250 మి.లీ కలిపి ఆకుల అడుగుభాగం తడిచేలా పిచికారీ చేయాలి.",
        "precautions": "Very pungent: Avoid touching eyes or face during spray. Do not spray during peak noon heat.",
        "precautions_te": "కళ్లలో పడకుండా జాగ్రత్త వహించాలి. ఎండ తీవ్రత ఎక్కువగా ఉన్నప్పుడు పిచికారీ చేయరాదు."
    },
    {
        "id": "sour_buttermilk",
        "name_en": "Sour Buttermilk & Hing Spray (పుల్లటి మజ్జిగ ద్రావణం) — Fungus Shield",
        "name_te": "పుల్లటి మజ్జిగ మరియు ఇంగువ ద్రావణం",
        "name_hi": "खट्टी छाछ और हींग फफूंदनाशक",
        "category": "disease",
        "type_label": "Bio-Fungicide / శిలీంద్ర నాశిని",
        "purpose": "Prevents and treats Powdery Mildew, Downy Mildew, Leaf Blight, and fungal rusts while stimulating vibrant flowering.",
        "purpose_te": "బూడిద తెగులు, ఆకుమచ్చ తెగులు మరియు కొమ్మ ఎండు తెగుళ్లను నివారించి, అధికంగా పూత పిందె పట్టడానికి సహాయపడుతుంది.",
        "target_crops": "Chilli, Vegetables, Mango, Tomato, Groundnut, Pulses",
        "target_crops_te": "మిరప, టమాటా, మామిడి, కూరగాయలు, వేరుశనగ",
        "ingredients": [
            "Sour cow curd or buttermilk fermented for 4-5 days (పుల్లటి మజ్జిగ): 5 liters",
            "Clean copper wire or plate (రాగి ముక్క లేదా తీగ): 1 piece",
            "Asafoetida / Hing (ఇంగువ): 100 grams",
            "Clean water (నీరు): 100 liters"
        ],
        "preparation_steps": [
            "Take fresh buttermilk in a plastic bucket and immerse a clean copper wire or plate in it.",
            "Keep covered for 4 to 5 days until the liquid turns pale greenish-blue due to beneficial copper lactates.",
            "Dissolve 100g asafoetida (hing) in warm water and blend into the fermented buttermilk.",
            "Filter through fine cloth and dilute with 100 liters of water."
        ],
        "application_method": "Spray every 10 to 15 days during vegetative, pre-flowering, and pod formation stages.",
        "application_method_te": "పూత మరియు కాయ దశల్లో ప్రతి 10-15 రోజులకు ఒకసారి మొక్కలు పూర్తిగా తడిసేలా పిచికారీ చేయాలి.",
        "precautions": "Ensure copper wire is thoroughly clean before dipping. Wash sprayer tank after use.",
        "precautions_te": "రాగి ముక్కపై దుమ్ము లేకుండా శుభ్రంగా ఉండాలి. పిచికారీ తర్వాత పంపును కడగాలి."
    },
    {
        "id": "panchagavya",
        "name_en": "Panchagavya (పంచగవ్య) — Organic Growth Elixir",
        "name_te": "పంచగవ్య తయారీ విధానం",
        "name_hi": "पंचगव्य - प्राकृतिक विकास वर्धक",
        "category": "soil",
        "type_label": "Growth Promoter / వృద్ధి ఉత్ప్రేరకం",
        "purpose": "Rich in natural auxins, gibberellins, and IAA that boost vegetative growth, root branching, and crop immunity.",
        "purpose_te": "మొక్కల్లో రోగనిరోధక శక్తిని పెంచి, కొమ్మలు మరియు పిలకలు ఎక్కువగా వచ్చేలా చేసి అధిక దిగుబడిని ఇస్తుంది.",
        "target_crops": "Paddy, Banana, Vegetables, Flowering Plants, Mango, Cotton",
        "target_crops_te": "వరి, అరటి, కూరగాయలు, పూల తోటలు, మామిడి, పత్తి",
        "ingredients": [
            "Fresh cow dung (ఆవు పేడ): 5 kg",
            "Fresh cow ghee (ఆవు నెయ్యి): 500 g",
            "Fresh cow urine (ఆవు మూత్రం): 3 liters",
            "Fresh cow milk (ఆవు పాలు): 2 liters",
            "Fresh cow curd (ఆవు పెరుగు): 2 liters",
            "Tender coconut water (లేత కొబ్బరి నీరు): 3 liters",
            "Jaggery / sugarcane juice (చెరకు రసం లేదా బెల్లం): 1 kg",
            "Ripe bananas (బాగా పండిన అరటి పండ్లు): 6 pieces"
        ],
        "preparation_steps": [
            "Day 1: Thoroughly mix cow dung and cow ghee in a wide-mouth container and keep for 3 days.",
            "Day 4: Add cow urine, cow milk, cow curd, coconut water, jaggery water, and mashed bananas.",
            "Stir clockwise twice daily for 15 days.",
            "On 18th day, the heavenly aromatic golden liquid is ready for application."
        ],
        "application_method": "Use 3% foliar spray (300ml per 10 liters water) or apply 10 liters/acre through drip irrigation.",
        "application_method_te": "10 లీటర్ల నీటికి 300 మి.లీ కలిపి ఆకులపై పిచికారీ చేయాలి.",
        "precautions": "Keep in shade. Do not close lid airtight during active fermentation.",
        "precautions_te": "నీడలోనే ఉంచాలి. గాలి ఆడేలా మూతను వదులుగా ఉంచాలి."
    },
    {
        "id": "ipm_pheromone_traps",
        "name_en": "Pheromone Traps (లింగాకర్షక బుట్టలు) — Borer Monitoring & Mating Disruption",
        "name_te": "లింగాకర్షక బుట్టల ఏర్పాటు (IPM)",
        "name_hi": "फेरोमोन ट्रैप - कीट निगरानी",
        "category": "ipm",
        "type_label": "Mechanical Pest Control / సస్యరక్షణ పరికరం",
        "purpose": "Lures and captures adult male moths using species-specific female sex pheromone lures, suppressing caterpillar breeding by over 70%.",
        "purpose_te": "ఆడ పురుగు వాసనతో మగ రెక్కల పురుగులను ఆకర్షించి బంధించడం ద్వారా పురుగుల సంతతిని 70% వరకు అరికడుతుంది.",
        "target_crops": "Cotton (Pink Bollworm), Gram (Pod Borer), Maize (Fall Armyworm), Brinjal",
        "target_crops_te": "పత్తి (గులాబీ రంగు పురుగు), శనగ (పచ్చ పురుగు), మొక్కజొన్న (కత్తెర పురుగు)",
        "ingredients": [
            "Funnel / Sleeve pheromone trap containers: 4 to 8 units per acre",
            "Species-specific pheromone septa lures (Helilure / Gossyplure / Spodolure)",
            "Supporting bamboo sticks (1.5 meters height)"
        ],
        "preparation_steps": [
            "Fix bamboo stick firmly in the field at crop canopy height (1 to 2 feet above crop level).",
            "Attach the funnel trap securely to the stick facing wind direction.",
            "Insert the specific pheromone lure inside the trap lid with clean hands (never touch with pesticide-stained fingers).",
            "Tie plastic sleeve tightly at bottom to collect captured moths."
        ],
        "application_method": "Install 4 to 5 traps per acre by 35-40 days after sowing. Replace lures every 25 to 30 days.",
        "application_method_te": "ఎకరాకు 4 నుండి 5 బుట్టలను పంట కంటే 1 అడుగు ఎత్తులో అమర్చాలి. ప్రతి 30 రోజులకు ల్యూర్ మార్చాలి.",
        "precautions": "Check traps daily morning. Empty trapped moths and record counts for economic threshold monitoring.",
        "precautions_te": "ప్రతిరోజూ బుట్టలను పరిశీలించి చనిపోయిన పురుగులను తొలగించాలి."
    },
    {
        "id": "ipm_sticky_traps",
        "name_en": "Yellow & Blue Sticky Sheets (పసుపు & నీలి జిగురు అట్టలు) — Sucking Pest Trap",
        "name_te": "పసుపు మరియు నీలి జిగురు అట్టలు",
        "name_hi": "पीले और नीले चिपचिपे ट्रैप",
        "category": "ipm",
        "type_label": "Visual Trap / ఆకర్షక అట్టలు",
        "purpose": "Exploits color phototaxis: Yellow attracts whiteflies and aphids; Blue attracts thrips. Traps pests naturally before they transmit viruses.",
        "purpose_te": "పసుపు రంగు తెల్లదోమ మరియు పేనుబంకను, నీలి రంగు తామర పురుగులను ఆకర్షించి వైరస్ తెగుళ్లు వ్యాపించకుండా అడ్డుకుంటుంది.",
        "target_crops": "Chilli, Cotton, Tomato, Cucurbits, Capsicum, Papaya",
        "target_crops_te": "మిరప, పత్తి, టమాటా, కూరగాయలు, బొప్పాయి",
        "ingredients": [
            "Yellow corrugated polypropylene sheets: 10 to 15 per acre",
            "Bright blue corrugated sheets: 6 to 10 per acre",
            "Non-drying transparent castor oil or sticky entomological glue",
            "Supporting wooden stakes and binding wire"
        ],
        "preparation_steps": [
            "Coat both sides of the yellow and blue plastic sheets with castor oil or sticky glue.",
            "Fix the sheets to wooden stakes placed along crop rows.",
            "Position sheets approximately 15 cm above the crop canopy.",
            "Inspect weekly and clean dust with a wet cloth, re-applying castor oil."
        ],
        "application_method": "Erect 15-20 traps per acre distributed evenly across field borders and interiors.",
        "application_method_te": "ఎకరాకు 15-20 అట్టలను పంట ఎత్తు కంటే కొద్దిగా పైన పొలంలో సమంగా అమర్చాలి.",
        "precautions": "Erect before flowering stage to curb initial pest colonization.",
        "precautions_te": "పంట నాటిన 15-20 రోజుల నుంచే అట్టలను అమర్చుకుంటే తామర పురుగులు రావు."
    },
    {
        "id": "ipm_bird_perches",
        "name_en": "Bird Perches (పక్షి స్థావరాలు — 'T' ఆకార కర్రలు) — Natural Bio-Predators",
        "name_te": "పక్షి స్థావరాల ఏర్పాటు ('T' ఆకార కర్రలు)",
        "name_hi": "पक्षी मचान - प्राकृतिक कीट भक्षक",
        "category": "ipm",
        "type_label": "Biological Control / పక్షి ఆవాసాలు",
        "purpose": "Encourages predatory insectivorous birds (Drongos, Egrets, Mynas) to perch and devour up to 200 caterpillars per bird per day for zero cost.",
        "purpose_te": "నల్ల జీటగాడు, పాలపిట్ట, గోరువంకలు వాలడానికి వీలుగా 'T' ఆకార కర్రలు నాటడం ద్వారా అవి రోజూ వందలాది గొంగళి పురుగులను తింటాయి.",
        "target_crops": "Paddy, Groundnut, Red Gram, Cotton, Bengal Gram",
        "target_crops_te": "వరి, వేరుశనగ, కందులు, పత్తి, శనగ",
        "ingredients": [
            "Bamboo poles (6 to 8 feet long): 10 to 15 per acre",
            "Cross-sticks (1.5 feet long) nailed in 'T' shape",
            "Binding wire and hammer"
        ],
        "preparation_steps": [
            "Nail the cross-piece horizontally across top of the long bamboo stick to create a stable 'T' perch.",
            "Install perches firmly inside the field standing 2 to 3 feet above crop canopy.",
            "Space perches 15 meters apart across the entire field.",
            "Birds use perches as vantage points to spot and dive on leaf-eating caterpillars."
        ],
        "application_method": "Install 10 to 15 'T' perches per acre 20 days after crop emergence.",
        "application_method_te": "ఎకరాకు 10 నుండి 15 'T' ఆకార కర్రలను పంట కంటే 2 అడుగుల ఎత్తులో అమర్చాలి.",
        "precautions": "Remove perches during grain filling or harvest stage in grain crops to avoid bird damage to grains.",
        "precautions_te": "గింజ పాలుపోసుకునే దశ వచ్చిన తర్వాత ధాన్యం తినకుండా వీటిని తొలగించాలి."
    }
]

class GuidanceService:
    """Farming guidance, organic formulations, and Integrated Pest Management manual."""

    def get_organic_recipes(
        self,
        category: Optional[str] = None,
        filter_query: Optional[str] = None
    ) -> Dict[str, Any]:
        recipes = list(ORGANIC_FARMING_RECIPES)

        # Category filtering
        if category and category.lower() != "all":
            cat = category.lower().strip()
            recipes = [r for r in recipes if r.get("category") == cat]

        # Search query filtering
        if filter_query:
            q = filter_query.lower().strip()
            recipes = [
                r for r in recipes
                if q in r["name_en"].lower()
                or q in r["name_te"].lower()
                or q in r.get("name_hi", "").lower()
                or q in r.get("purpose", "").lower()
                or q in r.get("purpose_te", "").lower()
                or q in r.get("target_crops", "").lower()
                or any(q in i.lower() for i in r.get("ingredients", []))
            ]

        return {
            "success": True,
            "recipes": recipes,
            "total_count": len(recipes)
        }

guidance_service = GuidanceService()
