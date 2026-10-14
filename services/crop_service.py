from typing import Dict, Any, List, Optional

# Comprehensive Crop Recommendations Database tailored for South Indian Agro-Climatic Zones
CROP_RECOMMENDATION_CATALOG = [
    {
        "id": "paddy_kharif",
        "name_en": "Paddy / Rice (BPT 5204 / RNR 15048 Telangana Sona)",
        "name_te": "వరి (తెలంగాణ సోనా / సాంబ మసూరి)",
        "name_hi": "धान (तेलंगाना सोना / सांबा मसूरी)",
        "suitable_soils": ["clay", "loam", "black"],
        "suitable_seasons": ["kharif", "rabi"],
        "water_need": "high",
        "duration_days": "125 - 145 days",
        "seed_rate_acre": "20 - 25 kg",
        "expected_yield_acre": "25 - 32 Quintals",
        "est_investment_acre": "₹28,000 - ₹34,000",
        "est_net_profit_acre": "₹32,000 - ₹45,000",
        "guidance_en": "RNR 15048 (Telangana Sona) has low glycemic index and resistance to blast disease. Best for canal and borewell irrigated tracts.",
        "guidance_te": "ఆర్.ఎన్.ఆర్ 15048 (తెలంగాణ సోనా) షుగర్ తక్కువ ఉన్న వరి రకం మరియు అగ్గి తెగులును తట్టుకుంటుంది. కాలువలు, బోరుబావుల కింద అధిక దిగుబడి ఇస్తుంది.",
        "guidance_hi": "तेलंगाना सोना कम ग्लाइसेमिक इंडेक्स वाली किस्म है जो ब्लास्ट रोग को सहन कर सकती है।"
    },
    {
        "id": "cotton_bt",
        "name_en": "Cotton (Bollgard II Hybrids)",
        "name_te": "పత్తి (బీటీ హైబ్రిడ్)",
        "name_hi": "कपास (बीटी संकर)",
        "suitable_soils": ["black", "loam"],
        "suitable_seasons": ["kharif"],
        "water_need": "medium",
        "duration_days": "150 - 165 days",
        "seed_rate_acre": "2 packets (900g)",
        "expected_yield_acre": "10 - 16 Quintals",
        "est_investment_acre": "₹30,000 - ₹38,000",
        "est_net_profit_acre": "₹45,000 - ₹75,000",
        "guidance_en": "Requires deep black cotton soils with good drainage. Install pheromone traps by 45th day to monitor pink bollworm.",
        "guidance_te": "లోతైన నల్లరేగడి నేలల్లో అద్భుతమైన దిగుబడి వస్తుంది. గులాబీ రంగు పురుగు నివారణకు 45వ రోజు నుండే లింగాకర్షక బుట్టలను అమర్చాలి.",
        "guidance_hi": "गहरी काली मिट्टी में अच्छी जल निकासी के साथ लगाएं। 45वें दिन फेरोमोन ट्रैप लगाएं।"
    },
    {
        "id": "red_chilli",
        "name_en": "Red Chilli (Teja / Armoor / US 341)",
        "name_te": "ఎర్ర మిరప (తేజ / ఆర్మోర్)",
        "name_hi": "लाल मिर्च (तेजा / आर्मूर)",
        "suitable_soils": ["black", "red", "loam"],
        "suitable_seasons": ["kharif", "rabi"],
        "water_need": "medium",
        "duration_days": "180 - 210 days",
        "seed_rate_acre": "80 - 100g (or 11,000 nursery seedlings)",
        "expected_yield_acre": "20 - 30 Quintals (Dry)",
        "est_investment_acre": "₹60,000 - ₹85,000",
        "est_net_profit_acre": "₹1,20,000 - ₹2,50,000",
        "guidance_en": "High-value commercial cash crop. Adopt drip irrigation and plastic mulching. Requires vigilant management of thrips and mites.",
        "guidance_te": "అధిక ఆదాయాన్నిచ్చే వాణిజ్య పంట. డ్రిప్ ఇరిగేషన్ మరియు మల్చింగ్ షీట్ ఉపయోగించడం ద్వారా తామర పురుగుల ఉధృతిని తగ్గించి రెట్టింపు లాభం పొందవచ్చు.",
        "guidance_hi": "उच्च मूल्य वाली नकदी फसल। ड्रिप सिंचाई और मल्चिंग अपनाएं।"
    },
    {
        "id": "maize_hybrid",
        "name_en": "Hybrid Maize / Corn (DKC 9108 / Pioneer)",
        "name_te": "హైబ్రిడ్ మొక్కజొన్న",
        "name_hi": "संकर मक्का",
        "suitable_soils": ["red", "black", "loam", "sandy"],
        "suitable_seasons": ["kharif", "rabi", "summer"],
        "water_need": "medium",
        "duration_days": "105 - 120 days",
        "seed_rate_acre": "7 - 8 kg",
        "expected_yield_acre": "28 - 36 Quintals",
        "est_investment_acre": "₹18,000 - ₹24,000",
        "est_net_profit_acre": "₹35,000 - ₹50,000",
        "guidance_en": "Fast-growing cereal with ready industrial poultry demand. Suitable for both Kharif and Rabi in red and light black soils.",
        "guidance_te": "తక్కువ కాలపరిమితితో నికర ఆదాయం ఇచ్చే పంట. ఎర్ర నేలలు, తేలికపాటి నల్లరేగడి నేలల్లో అద్భుతంగా పండుతుంది.",
        "guidance_hi": "कम समय में तैयार होने वाली फसल। पोल्ट्री उद्योगों में अच्छी मांग रहती है।"
    },
    {
        "id": "groundnut_rabi",
        "name_en": "Groundnut / Peanut (Kadiri 6 / TAG 24 / Dharani)",
        "name_te": "వేరుశనగ (కదిరి 6 / ధరణి)",
        "name_hi": "मूंगफली (कदिरी 6 / धरणी)",
        "suitable_soils": ["red", "sandy", "loam"],
        "suitable_seasons": ["rabi", "summer", "kharif"],
        "water_need": "low",
        "duration_days": "100 - 115 days",
        "seed_rate_acre": "40 - 50 kg kernels",
        "expected_yield_acre": "14 - 18 Quintals",
        "est_investment_acre": "₹22,000 - ₹26,000",
        "est_net_profit_acre": "₹45,000 - ₹65,000",
        "guidance_en": "Ideal for sandy loam and red chalka soils. Requires gypsum application @ 200kg/acre at pegging stage for bold pod filling.",
        "guidance_te": "ఎర్ర చెల్క నేలలు, ఇసుక రేగడి నేలలకు అత్యుత్తమ పంట. ఊడలు దిగే దశలో ఎకరాకు 200 కేజీల జిప్సం వేస్తే కాయలు లావుగా ఊరుతాయి.",
        "guidance_hi": "रेतीली और लाल मिट्टी के लिए उत्तम फसल। जिप्सम का प्रयोग अवश्य करें।"
    },
    {
        "id": "red_gram_pigeonpea",
        "name_en": "Red Gram / Toor (PRG 176 / Asha / WRG 65)",
        "name_te": "కందులు (పి.ఆర్.జి 176 / ఆశ)",
        "name_hi": "अरहर / तुअर (पीआरजी 176)",
        "suitable_soils": ["red", "black", "loam"],
        "suitable_seasons": ["kharif"],
        "water_need": "low",
        "duration_days": "140 - 160 days",
        "seed_rate_acre": "4 - 5 kg (sole crop) or 1.5kg (intercrop)",
        "expected_yield_acre": "8 - 12 Quintals",
        "est_investment_acre": "₹12,000 - ₹16,000",
        "est_net_profit_acre": "₹45,000 - ₹70,000",
        "guidance_en": "Drought-hardy pulse crop with excellent nitrogen fixation. Highly recommended as sole crop or 1:4 intercrop with cotton/maize.",
        "guidance_te": "వర్షాభావ పరిస్థితులను తట్టుకుని భూసారాన్ని పెంచే పప్పుదినుసుల పంట. పత్తి లేదా మొక్కజొన్నలో అంతరపంటగా లేదా ప్రధాన పంటగా సాగు చేయవచ్చు.",
        "guidance_hi": "सूखा रोधी दलहन फसल। कपास या मक्का के साथ अंतःफसल के रूप में भी बहुत लाभकारी।"
    },
    {
        "id": "millets_ragi",
        "name_en": "Finger Millet / Ragi (భారతి / Vakula)",
        "name_te": "రాగులు / తైదలు",
        "name_hi": "रागी / मडुआ",
        "suitable_soils": ["red", "sandy", "loam"],
        "suitable_seasons": ["kharif", "rabi", "summer"],
        "water_need": "low",
        "duration_days": "95 - 105 days",
        "seed_rate_acre": "4 - 5 kg",
        "expected_yield_acre": "10 - 14 Quintals",
        "est_investment_acre": "₹8,000 - ₹12,000",
        "est_net_profit_acre": "₹28,000 - ₹40,000",
        "guidance_en": "Climate-resilient superfood with minimal water and zero chemical pesticide needs. Guaranteed high domestic market prices.",
        "guidance_te": "తక్కువ నీటితో, రసాయన మందుల అవసరం లేకుండా పండే బలవర్ధకమైన చిరుధాన్యం. ఆరోగ్య స్పృహ పెరగడంతో నగరాల్లో మంచి డిమాండ్ ఉంది.",
        "guidance_hi": "कम पानी और बिना रसायनों के उगने वाला पौष्टिक मोटा अनाज।"
    }
]

class CropRecommendationService:
    """Intelligent agronomical crop recommendation engine."""

    def get_recommendations(
        self,
        soil_type: str = "black",
        season: str = "kharif",
        water_source: str = "medium",
        land_acres: float = 2.0
    ) -> Dict[str, Any]:
        """Calculates tailored crop suggestions based on farm agro-ecological parameters."""
        soil = (soil_type or "black").lower().strip()
        season = (season or "kharif").lower().strip()
        water = (water_source or "medium").lower().strip()

        ranked = []
        for crop in CROP_RECOMMENDATION_CATALOG:
            score = 60  # baseline compatibility
            
            # Soil compatibility
            if any(s in soil for s in crop["suitable_soils"]):
                score += 20
            
            # Season compatibility
            if season in crop["suitable_seasons"]:
                score += 15
            
            # Water availability matching
            if water == "low" and crop["water_need"] == "low":
                score += 10
            elif water in ["high", "canal", "borewell"] and crop["water_need"] in ["high", "medium"]:
                score += 10
            elif water == "rainfed" and crop["water_need"] == "high":
                score -= 25

            score = min(98, max(45, score))

            ranked.append({
                **crop,
                "match_score": score,
                "projected_total_profit": f"₹{int(float(land_acres) * 45000):,} - ₹{int(float(land_acres) * 70000):,}"
            })

        # Sort descending by match score
        ranked.sort(key=lambda x: x["match_score"], reverse=True)

        return {
            "success": True,
            "soil_type": soil_type,
            "season": season,
            "water_source": water_source,
            "land_acres": land_acres,
            "recommendations": ranked,
            "total_matches": len(ranked)
        }

crop_service = CropRecommendationService()
