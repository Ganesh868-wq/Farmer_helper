from typing import Dict, Any, List, Optional

GOVERNMENT_SCHEMES_DIRECTORY = [
    {
        "id": "pm_kisan",
        "name_en": "PM-KISAN Samman Nidhi Yojana",
        "name_te": "పీఎం కిసాన్ సమ్మాన్ నిధి యోజన",
        "name_hi": "पीएम-किसान सम्मान निधि योजना",
        "type": "Central Government",
        "benefit_amount": "₹6,000 / year",
        "benefit_frequency": "₹2,000 in 3 installments every 4 months directly into Bank DBT account",
        "eligibility_en": "All landholding farmer families having cultivable agricultural land registered in their name.",
        "eligibility_te": "పట్టాదారు పాస్ పుస్తకం కలిగి, స్వంత వ్యవసాయ భూమి ఉన్న రైతులందరికీ వర్తిస్తుంది.",
        "eligibility_hi": "जिनके नाम पर कृषि योग्य भूमि है, वे सभी किसान परिवार पात्र हैं।",
        "documents_required": [
            "Aadhaar Card linked with active Mobile Number",
            "Pattadar Passbook / Land Record (ROR 1-B / Pahani / Khatauni)",
            "Bank Passbook with active NPCI/Aadhaar DBT seeding",
            "e-KYC biometric or OTP verification"
        ],
        "application_mode": "Online portal or nearby CSC / MeeSeva center",
        "official_url": "https://pmkisan.gov.in/",
        "status": "Active & Ongoing",
        "helpline": "155261 / 1800-115-526"
    },
    {
        "id": "rythu_bharosa",
        "name_en": "Rythu Bharosa / Investment Support Scheme",
        "name_te": "రైతు భరోసా / రైతు బంధు పెట్టుబడి సహాయం",
        "name_hi": "रैतु भरोसा / किसान निवेश सहायता",
        "type": "State Government (AP / Telangana)",
        "benefit_amount": "Up to ₹15,000 / acre / year",
        "benefit_frequency": "Transferred before Kharif and Rabi sowing seasons",
        "eligibility_en": "Farmer landholders and eligible tenant farmers holding genuine cultivation permits.",
        "eligibility_te": "వ్యవసాయ భూమి ఉన్న రైతులు మరియు అర్హత కలిగిన కౌలు రైతులకు పంట పెట్టుబడి కొరకు నేరుగా ఖాతాలో జమ చేయబడుతుంది.",
        "eligibility_hi": "राज्य के भूस्वामी और पात्र पट्टाधारक किसान।"
    },
    {
        "id": "pmfby_crop_insurance",
        "name_en": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "name_te": "ప్రధాన మంత్రి ఫసల్ బీమా యోజన (పంటల బీమా)",
        "name_hi": "प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)",
        "type": "Central & State Joint",
        "benefit_amount": "Up to 100% sum insured on crop loss",
        "benefit_frequency": "Paid on localized calamities, drought, pest attacks, or post-harvest cyclone damage",
        "eligibility_en": "All farmers growing notified crops (Paddy, Cotton, Chilli, Groundnut, Maize, Pulses). Nominal premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticulture.",
        "eligibility_te": "ఖరీఫ్ పంటలకు కేవలం 2%, రబీ పంటలకు 1.5% నామమాత్రపు ప్రీమియంతో ప్రకృతి వైపరీత్యాలు, తెగుళ్లు వచ్చినప్పుడు పూర్తి పంట నష్టపరిహారం అందుతుంది.",
        "eligibility_hi": "प्राकृतिक आपदाओं और कीटों से फसल नष्ट होने पर शत-प्रतिशत तक मुआवजा।"
    },
    {
        "id": "pm_kusum_solar",
        "name_en": "PM-KUSUM Solar Agricultural Pumps Scheme",
        "name_te": "పీఎం-కుసుమ్ సోలార్ వ్యవసాయ పంపుల పథకం",
        "name_hi": "पीएम-कुसुम सौर कृषि पंप योजना",
        "type": "Renewable Energy & Agriculture",
        "benefit_amount": "Up to 60% - 80% Subsidy",
        "benefit_frequency": "One-time capital subsidy for installing 3HP to 7.5HP solar DC/AC submersible pumps",
        "eligibility_en": "Farmers without electricity grid connection or seeking to replace diesel pump sets.",
        "eligibility_te": "కరెంట్ సరఫరా లేని లేదా డీజిల్ ఇంజన్లపై ఆధారపడే రైతులకు 60% నుండి 80% వరకు రాయితీతో సోలార్ పంపుసెట్లు అమర్చబడతాయి.",
        "eligibility_hi": "डीजल पंपों को सौर ऊर्जा पंपों में बदलने के लिए भारी सब्सिडी।"
    },
    {
        "id": "micro_irrigation_drip",
        "name_en": "Micro-Irrigation (Drip & Sprinkler) Subsidy",
        "name_te": "బిందు మరియు తుంపర సేద్యం రాయితీ (డ్రిప్ & స్ప్రింక్లర్)",
        "name_hi": "सूक्ष्म सिंचाई (ड्रिप और स्प्रिंकलर) सब्सिडी",
        "type": "Centrally Sponsored (PMKSY)",
        "benefit_amount": "70% to 90% Subsidy for Small/Marginal Farmers",
        "benefit_frequency": "Installed directly on farmland through state micro-irrigation project (APMIP / TSMIP)",
        "eligibility_en": "Small and marginal farmers owning up to 5 acres get up to 90% subsidy for drip units.",
        "eligibility_te": "చిన్న, సన్నకారు రైతులకు డ్రిప్ యూనిట్లపై 90% వరకు ప్రభుత్వ రాయితీ లభిస్తుంది. 50% వరకు నీరు ఆదా అవుతుంది.",
        "eligibility_hi": "छोटे और सीमांत किसानों के लिए ड्रिप उपकरण पर 90% तक की छूट।"
    },
    {
        "id": "kisan_credit_card",
        "name_en": "Kisan Credit Card (KCC) Low-Interest Crop Loan",
        "name_te": "కిసాన్ క్రెడిట్ కార్డు (కె.సి.సి) తక్కువ వడ్డీ రుణాలు",
        "name_hi": "किसान क्रेडिट कार्ड (केसीसी) रियायती ऋण",
        "type": "Institutional Credit",
        "benefit_amount": "Collateral-free loan up to ₹1,60,000 (total limit up to ₹3,00,000)",
        "benefit_frequency": "Effective 4% interest per annum with prompt 3% prompt repayment incentive",
        "eligibility_en": "All farmers, tenant cultivators, and self-help groups engaged in agriculture and animal husbandry.",
        "eligibility_te": "సకాలంలో చెల్లిస్తే కేవలం 4 శాతం వడ్డీకే బ్యాంకుల ద్వారా పంట రుణాలు లభిస్తాయి. ఎలాంటి తనఖా లేకుండా ₹1.60 లక్షల వరకు పొందవచ్చు.",
        "eligibility_hi": "समय पर भुगतान करने पर मात्र 4% ब्याज पर संस्थागत बैंक ऋण।"
    }
]

class SchemesService:
    """Directory and eligibility guidance for Government Agricultural Schemes."""

    def get_all_schemes(self, filter_query: Optional[str] = None) -> Dict[str, Any]:
        """Returns all agricultural welfare schemes with optional search filtering."""
        schemes = list(GOVERNMENT_SCHEMES_DIRECTORY)

        if filter_query:
            q = filter_query.lower().strip()
            schemes = [
                s for s in schemes
                if q in s["name_en"].lower()
                or q in s["name_te"].lower()
                or q in s["name_hi"].lower()
                or q in s["benefit_amount"].lower()
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
