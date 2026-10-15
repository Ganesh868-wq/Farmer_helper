from typing import Dict, Any, List, Optional

GOVERNMENT_SCHEMES_DIRECTORY = [
    {
        "id": "pm_kisan",
        "name_en": "PM-KISAN Samman Nidhi Yojana",
        "name_te": "పీఎం కిసాన్ సమ్మాన్ నిధి యోజన",
        "name_hi": "पीएम-किसान सम्मान निधि योजना",
        "category": "central",
        "type": "Central Government",
        "purpose_en": "Direct income support to landholding farmer families across India to meet financial needs for farm inputs and household expenses.",
        "purpose_te": "రైతుల ఖాతాల్లో నేరుగా పంట పెట్టుబడి సహాయం జమ చేసి వ్యవసాయ ఖర్చులకు మరియు కుటుంబ అవసరాలకు అండగా నిలవడం.",
        "benefit_amount": "₹6,000 / year",
        "benefit_frequency": "₹2,000 every 4 months in 3 installments directly via DBT",
        "eligibility_en": "All landholding farmer families having cultivable agricultural land registered in their name.",
        "eligibility_te": "పట్టాదారు పాస్ పుస్తకం కలిగి, స్వంత వ్యవసాయ భూమి ఉన్న రైతులందరికీ వర్తిస్తుంది.",
        "eligibility_hi": "जिनके नाम पर कृषि योग्य भूमि है, वे सभी किसान परिवार पात्र हैं।",
        "documents_required": [
            "Aadhaar Card linked with active Mobile Number",
            "Pattadar Passbook / Land Record (ROR 1-B / Pahani / Khatauni)",
            "Bank Passbook with active NPCI/Aadhaar DBT seeding",
            "e-KYC biometric or OTP verification"
        ],
        "application_steps_en": "1. Visit pmkisan.gov.in or CSC/MeeSeva centre. 2. Click 'New Farmer Registration'. 3. Enter Aadhaar & land details. 4. Complete mandatory e-KYC.",
        "application_steps_te": "1. pmkisan.gov.in వెబ్‌సైట్ లేదా మీసేవ కేంద్రాన్ని సందర్శించండి. 2. ఆధార్ మరియు భూమి వివరాలు నమోదు చేయండి. 3. తప్పనిసరిగా ఇ-కెవైసి (e-KYC) పూర్తి చేయండి.",
        "application_mode": "Online portal or nearby CSC / MeeSeva center",
        "official_url": "https://pmkisan.gov.in/",
        "status": "Active & Ongoing",
        "helpline": "155261 / 1800-115-526"
    },
    {
        "id": "rythu_bharosa",
        "name_en": "Rythu Bharosa / Rythu Bandhu Investment Support",
        "name_te": "రైతు భరోసా / రైతు బంధు పెట్టుబడి సహాయం",
        "name_hi": "रैतु भरोसा / किसान निवेश सहायता",
        "category": "state",
        "type": "State Government (AP / Telangana)",
        "purpose_en": "Timely financial investment assistance before Kharif and Rabi sowing seasons to prevent rural indebtedness and purchase quality seeds/fertilizers.",
        "purpose_te": "ఖరీఫ్ మరియు రబీ విత్తనాలు వేసే సమయానికి ముందే రైతులకు పంట పెట్టుబడి అందించి అప్పులపాలు కాకుండా కాపాడటం.",
        "benefit_amount": "Up to ₹13,500 - ₹15,000 / year",
        "benefit_frequency": "Transferred in seasonal installments before sowing starts",
        "eligibility_en": "Farmer landholders (including SC, ST, BC, Minority categories) and eligible tenant farmers holding genuine cultivation permits (CCRC).",
        "eligibility_te": "వ్యవసాయ భూమి ఉన్న రైతులు మరియు CCRC అనుమతి పత్రం కలిగిన కౌలు రైతులకు నేరుగా బ్యాంకు ఖాతాలో జమ చేయబడుతుంది.",
        "eligibility_hi": "राज्य के भूस्वामी और पात्र पट्टाधारक किसान।",
        "documents_required": [
            "Pattadar Passbook / 1B Namoona / Webland record",
            "Aadhaar Card of head of family",
            "Active Bank Account seeded with Aadhaar",
            "Crop Cultivator Rights Card (CCRC) for tenant farmers"
        ],
        "application_steps_en": "1. Village Agricultural Assistant (VAA) verifies Webland patta. 2. Social audit list published in Rythu Bharosa Kendram (RBK). 3. Funds credited automatically.",
        "application_steps_te": "1. రైతు భరోసా కేంద్రం (RBK) లో గ్రామ వ్యవసాయ సహాయకుడు ధ్రువీకరిస్తారు. 2. అర్హుల జాబితా ఆడిట్. 3. నేరుగా ఖాతాలో జమ.",
        "application_mode": "Through Village Agricultural Assistant / Rythu Bharosa Kendram (RBK)",
        "official_url": "https://apagrisnet.gov.in/",
        "status": "Active & Ongoing",
        "helpline": "1902 (Toll Free)"
    },
    {
        "id": "pmfby_crop_insurance",
        "name_en": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "name_te": "ప్రధాన మంత్రి ఫసల్ బీమా యోజన (సమగ్ర పంటల బీమా)",
        "name_hi": "प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)",
        "category": "credit",
        "type": "Central & State Joint Insurance",
        "purpose_en": "Comprehensive financial shield covering yield losses caused by non-preventable natural risks, droughts, floods, pest epidemics, and unseasonal cyclones.",
        "purpose_te": "తుఫానులు, వరదలు, అకాల వర్షాలు మరియు తెగుళ్ల వల్ల పంట నష్టపోయినప్పుడు రైతులకు పూర్తి ఆర్థిక పరిహారం అందించడం.",
        "benefit_amount": "Up to 100% sum insured on crop yield loss",
        "benefit_frequency": "Claims settled directly into bank accounts following crop cutting experiments (CCE) or localized claim intimation within 72 hours",
        "eligibility_en": "All farmers growing notified crops (Paddy, Cotton, Chilli, Groundnut, Maize, Pulses). Nominal premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticulture.",
        "eligibility_te": "ఖరీఫ్ పంటలకు కేవలం 2%, రబీ పంటలకు 1.5% నామమాత్రపు ప్రీమియంతో పూర్తి పంట నష్టపరిహార రక్షణ లభిస్తుంది.",
        "eligibility_hi": "प्राकृतिक आपदाओं और कीटों से फसल नष्ट होने पर शत-प्रतिशत तक मुआवजा।",
        "documents_required": [
            "Crop Sowing Certificate (Vithana Dhruveekarana) / e-Crop booking receipt",
            "Pattadar Passbook or CCRC agreement for tenant farmers",
            "Bank Passbook copy and linked Aadhaar card"
        ],
        "application_steps_en": "1. Complete mandatory e-Crop registration with local agriculture assistant. 2. Premium auto-deducted through KCC bank or CSC portal. 3. Report localized calamity within 72 hours via Crop Insurance App.",
        "application_steps_te": "1. ఈ-పంట (e-Crop) నమోదు చేయించండి. 2. బ్యాంక్ లేదా CSC ద్వారా ప్రీమియం చెల్లింపు. 3. నష్టం జరిగితే 72 గంటల్లోగా టోల్ ఫ్రీ నంబర్‌కు తెలియజేయాలి.",
        "application_mode": "Online at pmfby.gov.in, Commercial/Cooperative Banks, or RBK Centers",
        "official_url": "https://pmfby.gov.in/",
        "status": "Active & Ongoing",
        "helpline": "14447 (Farmer Crop Insurance Helpline)"
    },
    {
        "id": "pm_kusum_solar",
        "name_en": "PM-KUSUM Solar Agricultural Pumps Scheme",
        "name_te": "పీఎం-కుసుమ్ సోలార్ వ్యవసాయ పంపుల పథకం",
        "name_hi": "पीएम-कुसुम सौर कृषि पंप योजना",
        "category": "subsidy",
        "type": "Renewable Energy & Agriculture",
        "purpose_en": "Solarizing agricultural irrigation by installing standalone off-grid solar water pump sets to eliminate diesel costs and daytime power issues.",
        "purpose_te": "కరెంట్ కోతలు మరియు డీజిల్ ఖర్చుల భారం లేకుండా పట్టపగలే సోలార్ శక్తితో ఉచితంగా పొలాలకు నీరందించడం.",
        "benefit_amount": "60% to 80% Capital Subsidy",
        "benefit_frequency": "One-time capital subsidy for installing 3HP, 5HP, or 7.5HP solar DC/AC submersible/surface pumps",
        "eligibility_en": "Farmers without electricity grid connection or seeking to replace high-cost diesel pump sets. Land must have verified water source (borewell/open well).",
        "eligibility_te": "కరెంట్ లేని లేదా డీజిల్ ఇంజన్లపై ఆధారపడే రైతులకు వర్తిస్తుంది. బోరుబావి లేదా బావిలో నీటి వసతి ఉండాలి.",
        "eligibility_hi": "डीजल पंपों को सौर ऊर्जा पंपों में बदलने के लिए भारी सब्सिडी।",
        "documents_required": [
            "Aadhaar Card and Passport Photo",
            "Land Pattadar Passbook with revenue sketch",
            "Water Source Certificate / Borewell yield certificate",
            "Bank Account Details and Farmer Contribution Share"
        ],
        "application_steps_en": "1. Register on state renewable energy agency portal (NREDCAP / TSREDCO). 2. Submit pump capacity requirement. 3. Pay farmer share (10-20%). 4. Authorized vendor installs solar panel array.",
        "application_steps_te": "1. రెన్యూవబుల్ ఎనర్జీ పోర్టల్ (NREDCAP/REDCO) లో దరఖాస్తు. 2. పంపు కెపాసిటీ ఎంపిక. 3. రైతు వాటా చెల్లింపు. 4. క్షేత్రస్థాయిలో సోలార్ పంపు అమరిక.",
        "application_mode": "State Renewable Energy Agency Portal / MeeSeva",
        "official_url": "https://pmkusum.mnre.gov.in/",
        "status": "Active & Ongoing",
        "helpline": "1800-180-3333"
    },
    {
        "id": "micro_irrigation_drip",
        "name_en": "Micro-Irrigation (Drip & Sprinkler) Subsidy (PMKSY)",
        "name_te": "బిందు మరియు తుంపర సేద్యం రాయితీ (డ్రిప్ & స్ప్రింక్లర్)",
        "name_hi": "सूक्ष्म सिंचाई (ड्रिप और स्प्रिंकलर) सब्सिडी",
        "category": "subsidy",
        "type": "Centrally Sponsored (APMIP / TSMIP)",
        "purpose_en": "Maximizing crop yield per drop of water through advanced drip and micro-sprinkler installations, conserving up to 50% water and 30% electricity.",
        "purpose_te": "ప్రతి నీటి చుక్కతో అధిక దిగుబడి సాధించడం. బిందు సేద్యంతో 50% నీరు మరియు 30% ఎరువులు ఆదా అవుతాయి.",
        "benefit_amount": "70% to 90% Subsidy for Small/Marginal Farmers",
        "benefit_frequency": "Unit installed directly on field; 90% subsidy for SC/ST and small farmers (up to 5 acres), 70% for medium farmers",
        "eligibility_en": "Small and marginal farmers owning cultivable land with a perennial irrigation source (borewell, well, or canal).",
        "eligibility_te": "బోరుబావి లేదా శాశ్వత నీటి వనరు కలిగిన చిన్న, సన్నకారు రైతులకు (5 ఎకరాల లోపు) 90% వరకు రాయితీ లభిస్తుంది.",
        "eligibility_hi": "छोटे और सीमांत किसानों के लिए ड्रिप उपकरण पर 90% तक की छूट।",
        "documents_required": [
            "Pattadar Passbook / 1B Pahani copy",
            "Aadhaar Card and Caste Certificate (for SC/ST subsidy benefits)",
            "Soil & Water Testing Report",
            "Electricity connection / Borewell GPS geotag photo"
        ],
        "application_steps_en": "1. Apply online via APMIP / TSMIP or through local Horticulture Officer. 2. Field inspection by engineering team. 3. Farmer pays nominal contribution (10%). 4. Certified drip company installs equipment with 5-year warranty.",
        "application_steps_te": "1. APMIP/హార్టికల్చర్ కార్యాలయంలో దరఖాస్తు. 2. క్షేత్రస్థాయి సర్వే. 3. రైతు నామమాత్రపు వాటా డీడీ చెల్లింపు. 4. 5 సంవత్సరాల వారంటీతో డ్రిప్ ఫిట్టింగ్.",
        "application_mode": "District Horticulture Office / APMIP / TSMIP Online Portal",
        "official_url": "https://apmip.ap.gov.in/",
        "status": "Active & Ongoing",
        "helpline": "0863-2345678 / 1800-425-4440"
    },
    {
        "id": "kisan_credit_card",
        "name_en": "Kisan Credit Card (KCC) Low-Interest Crop Loan",
        "name_te": "కిసాన్ క్రెడిట్ కార్డు (కె.సి.సి) తక్కువ వడ్డీ పంట రుణాలు",
        "name_hi": "किसान क्रेडिट कार्ड (केसीसी) रियायती ऋण",
        "category": "credit",
        "type": "Institutional Credit",
        "purpose_en": "Affordable institutional short-term credit to purchase seeds, fertilizers, pesticides, and hire farm machinery without falling prey to private moneylenders.",
        "purpose_te": "వడ్డీ వ్యాపారుల చక్రవడ్డీల బారిన పడకుండా రైతులకు సకాలంలో నామమాత్రపు వడ్డీకే బ్యాంకు పంట రుణాలు అందించడం.",
        "benefit_amount": "Collateral-free loan up to ₹1,60,000 (Limit up to ₹3,00,000)",
        "benefit_frequency": "Subsidized 7% interest rate with 3% prompt repayment subvention (Effective 4% annual interest)",
        "eligibility_en": "All farmers, tenant cultivators, oral lessees, sharecroppers, and self-help groups engaged in agriculture, dairy, or fisheries.",
        "eligibility_te": "సొంత భూమి ఉన్న రైతులు, కౌలుదారులు, పశుపోషణ లేదా మత్స్య సాగు చేసే రైతులందరికీ వర్తిస్తుంది.",
        "eligibility_hi": "समय पर भुगतान करने पर मात्र 4% ब्याज पर संस्थागत बैंक ऋण।",
        "documents_required": [
            "Duly filled KCC application form",
            "Identity Proof (Aadhaar Card / Voter ID)",
            "Land ownership record (Pattadar passbook / CCRC permit)",
            "Cropping pattern declaration from Village Revenue Officer (VRO)"
        ],
        "application_steps_en": "1. Download KCC form from myscheme.gov.in or obtain from local bank. 2. Attach land passbook and VRO crop certificate. 3. Submit to public sector or cooperative bank. 4. Sanction within 14 days.",
        "application_steps_te": "1. సమీప గ్రామీణ లేదా జాతీయ బ్యాంకులో KCC ఫారం తీసుకోండి. 2. పట్టాదారు పాస్ పుస్తకం మరియు ఆధార్ జతచేయండి. 3. 14 రోజుల్లోగా రుణం మంజూరు.",
        "application_mode": "Public Sector Banks, Regional Rural Banks (RRBs), or PACS Societies",
        "official_url": "https://www.myscheme.gov.in/schemes/kcc",
        "status": "Active & Ongoing",
        "helpline": "1800-11-5526 / 011-23381012"
    }
]

class SchemesService:
    """Directory and eligibility guidance for Government Agricultural Schemes."""

    def get_all_schemes(self, filter_query: Optional[str] = None, category: Optional[str] = None) -> Dict[str, Any]:
        """Returns all agricultural welfare schemes with search and category filtering."""
        schemes = list(GOVERNMENT_SCHEMES_DIRECTORY)

        # Filter by category if requested
        if category and category.lower() != "all":
            c = category.lower().strip()
            schemes = [s for s in schemes if s.get("category") == c]

        # Filter by search query
        if filter_query:
            q = filter_query.lower().strip()
            schemes = [
                s for s in schemes
                if q in s["name_en"].lower()
                or q in s["name_te"].lower()
                or q in s.get("name_hi", "").lower()
                or q in s.get("benefit_amount", "").lower()
                or q in s.get("eligibility_en", "").lower()
                or q in s.get("eligibility_te", "").lower()
                or q in s.get("purpose_en", "").lower()
                or q in s.get("purpose_te", "").lower()
            ]

        audio_te = (
            f"ప్రస్తుతం రైతులకు అందుబాటులో ఉన్న ముఖ్య పథకాలు: "
            f"పీఎం కిసాన్ ద్వారా సంవత్సరానికి ₹6,000, రైతు భరోసా పెట్టుబడి సాయం, "
            f"మరియు 90 శాతం రాయితీతో డ్రిప్ ఇరిగేషన్ యూనిట్లు అందుబాటులో ఉన్నాయి."
        )

        return {
            "success": True,
            "schemes": schemes,
            "total_count": len(schemes),
            "audio_summary_te": audio_te
        }

schemes_service = SchemesService()
