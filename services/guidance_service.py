from typing import Dict, Any, List

ORGANIC_FARMING_RECIPES = [
    {
        "id": "jeevamrutham",
        "name_en": "Jeevamrutham (జీవామృతం) - Soil Microbial Elixir",
        "name_te": "జీవామృతం తయారీ విధానం",
        "name_hi": "जीवामृत तैयार करने की विधि",
        "purpose": "Multiplies billions of beneficial soil microorganisms, enhances earthworm activity, and unlocks insoluble nutrients in soil.",
        "ingredients": [
            "Fresh indigenous cow dung (దేశీ ఆవు పేడ): 10 kg",
            "Indigenous cow urine (దేశీ ఆవు మూత్రం): 5 to 10 liters",
            "Jaggery / organic raw sugar (బెల్లం): 1 to 2 kg",
            "Pulse flour - Besan / Chickpea flour (శనగ పిండి / ఉలవ పిండి): 1 to 2 kg",
            "Fertile native field bund soil (పొలం గట్టు మట్టి): Handful (200g)",
            "Clean water (నీరు): 200 liters"
        ],
        "preparation_steps": [
            "In a 200-liter plastic drum, mix cow dung and cow urine thoroughly using a wooden stick.",
            "Add crushed jaggery, pulse flour, and the handful of virgin forest or bund soil.",
            "Fill drum with 200 liters of water and stir clockwise for 2 minutes.",
            "Cover drum with jute bag and keep under tree shade for 48 to 72 hours.",
            "Stir clockwise for 2 minutes morning and evening. Fermentation is complete when a pleasant fermenting smell arises."
        ],
        "application_method": "Apply 200 liters per acre through irrigation water, venturi drip, or 10% foliar spray every 15 days."
    },
    {
        "id": "neemastra",
        "name_en": "Neemastra (నిమాస్త్రం) - Sucking Pest Repellent",
        "name_te": "నిమాస్త్రం తయారీ విధానం",
        "name_hi": "नीमास्त्र - रस चूसक कीट नियंत्रक",
        "purpose": "Controls sucking pests, early-stage borer larvae, whiteflies, and aphids within 48 hours of spraying.",
        "ingredients": [
            "Crushed fresh neem leaves & tender branches (వేప మండలు / ఆకులు): 5 kg",
            "Indigenous cow urine (ఆవు మూత్రం): 5 liters",
            "Fresh cow dung (ఆవు పేడ): 1 kg",
            "Clean water (నీరు): 100 liters"
        ],
        "preparation_steps": [
            "Pound neem leaves into a paste and add to a drum containing 100 liters of water.",
            "Add cow urine and cow dung. Stir thoroughly with a wooden stick.",
            "Cover with cloth and let it ferment under shade for 48 hours, stirring twice daily.",
            "Filter through fine cotton khadi cloth to avoid clogging sprayer nozzles."
        ],
        "application_method": "Spray directly without dilution on crops in early morning or late evening."
    },
    {
        "id": "brahmastra",
        "name_en": "Brahmastra (బ్రహ్మాస్త్రం) - Hard-to-Kill Borer Destroyer",
        "name_te": "బ్రహ్మాస్త్రం తయారీ విధానం",
        "name_hi": "ब्रह्मास्त्र - इल्ली और छेदक कीट नाशक",
        "purpose": "Destroys pod borers, fruit borers, pink bollworms, and leaf-eating caterpillars safely without synthetic poison.",
        "ingredients": [
            "Crushed neem leaves (వేప ఆకులు): 3 kg",
            "Custard apple leaves (సీతాఫలం ఆకులు): 2 kg",
            "Papaya leaves (బొప్పాయి ఆకులు): 2 kg",
            "White leadwort or Castor leaves (ఆముదం / జిల్లేడు ఆకులు): 2 kg",
            "Pongamia / Karanj leaves (కానుగ ఆకులు): 2 kg",
            "Indigenous cow urine: 10 liters"
        ],
        "preparation_steps": [
            "Crush all 5 types of bitter/medicinal leaves together into a coarse paste.",
            "Mix in 10 liters of cow urine in an earthen or steel pot.",
            "Boil gently on slow fire for 15-20 minutes until half the liquid reduces.",
            "Let it cool down for 48 hours, then filter through cloth. Stores well for up to 6 months."
        ],
        "application_method": "Mix 250ml of Brahmastra per 15-liter knapsack sprayer and spray on affected foliage."
    },
    {
        "id": "sour_buttermilk",
        "name_en": "Sour Buttermilk Spray (పుల్లటి మజ్జిగ ద్రావణం) - Fungus Shield",
        "name_te": "పుల్లటి మజ్జిగ ద్రావణం",
        "name_hi": "खट्टी छाछ फफूंदनाशक",
        "purpose": "Prevents and treats Powdery Mildew, Downy Mildew, Leaf Spots, and stimulates abundant flowering.",
        "ingredients": [
            "Sour cow curd/buttermilk (4-5 days fermented): 5 liters",
            "Asafoetida / Hing (హింగు): 100 grams",
            "Water: 100 liters"
        ],
        "preparation_steps": [
            "Take fresh buttermilk and allow it to ferment in a container with a copper wire or plate dipped in it for 4 days.",
            "The liquid turns greenish-blue due to copper lactates.",
            "Dissolve 100g hing in warm water and mix into the sour buttermilk.",
            "Filter and dilute with 100 liters of water."
        ],
        "application_method": "Spray every 10-15 days during vegetative and flowering stage. Imparts vibrant luster to foliage."
    }
]

class GuidanceService:
    """Farming guidance and organic formulation manual."""

    def get_organic_recipes(self) -> Dict[str, Any]:
        return {
            "success": True,
            "recipes": ORGANIC_FARMING_RECIPES,
            "total_count": len(ORGANIC_FARMING_RECIPES)
        }

guidance_service = GuidanceService()
