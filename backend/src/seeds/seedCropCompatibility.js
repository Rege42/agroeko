import CropRotationGroup from "../models/CropRotationGroup.js";
import CropCompatibilityRule from "../models/CropCompatibilityRule.js";

const COMPATIBILITY = {
  EXCELLENT: "EXCELLENT",
  GOOD: "GOOD",
  ACCEPTABLE: "ACCEPTABLE",
  RISKY: "RISKY",
  FORBIDDEN: "FORBIDDEN",
};

export async function seedCropCompability() {
  await CropCompatibilityRule.deleteMany({});

  const groups = await CropRotationGroup.find({
    code: { $in: ["cereals", "legumes", "technical", "oilseeds"] },
  });

  
  const groupMap = {};
  for (const group of groups) {
    groupMap[group.code] = group._id;
  }

  const requiredCodes = ["cereals", "legumes", "technical", "oilseeds"];
  const missingCodes = requiredCodes.filter((code) => !groupMap[code]);

  if (missingCodes.length > 0) {
    throw new Error(
      `Не найдены группы севооборота: ${missingCodes.join(", ")}. Сначала выполните seedData().`
    );
  }

  const rules = [
    // target = cereals
    {
      targetGroup: groupMap.cereals,
      predecessorGroup: groupMap.cereals,
      compatibilityLevel: COMPATIBILITY.RISKY,
      note: "Повторный посев зерновых нежелателен",
    },
    {
      targetGroup: groupMap.cereals,
      predecessorGroup: groupMap.legumes,
      compatibilityLevel: COMPATIBILITY.EXCELLENT,
    },
    {
      targetGroup: groupMap.cereals,
      predecessorGroup: groupMap.technical,
      compatibilityLevel: COMPATIBILITY.GOOD,
    },
    {
      targetGroup: groupMap.cereals,
      predecessorGroup: groupMap.oilseeds,
      compatibilityLevel: COMPATIBILITY.EXCELLENT,
    },

    // target = legumes
    {
      targetGroup: groupMap.legumes,
      predecessorGroup: groupMap.cereals,
      compatibilityLevel: COMPATIBILITY.GOOD,
    },
    {
      targetGroup: groupMap.legumes,
      predecessorGroup: groupMap.legumes,
      compatibilityLevel: COMPATIBILITY.RISKY,
      note: "Повторный посев бобовых повышает фитосанитарные риски",
    },
    {
      targetGroup: groupMap.legumes,
      predecessorGroup: groupMap.technical,
      compatibilityLevel: COMPATIBILITY.ACCEPTABLE,
    },
    {
      targetGroup: groupMap.legumes,
      predecessorGroup: groupMap.oilseeds,
      compatibilityLevel: COMPATIBILITY.EXCELLENT,
    },

    // target = technical
    {
      targetGroup: groupMap.technical,
      predecessorGroup: groupMap.cereals,
      compatibilityLevel: COMPATIBILITY.GOOD,
    },
    {
      targetGroup: groupMap.technical,
      predecessorGroup: groupMap.legumes,
      compatibilityLevel: COMPATIBILITY.EXCELLENT,
    },
    {
      targetGroup: groupMap.technical,
      predecessorGroup: groupMap.technical,
      compatibilityLevel: COMPATIBILITY.FORBIDDEN,
      note: "Повторное размещение технических культур недопустимо",
    },
    {
      targetGroup: groupMap.technical,
      predecessorGroup: groupMap.oilseeds,
      compatibilityLevel: COMPATIBILITY.GOOD,
    },

    // target = oilseeds
    {
      targetGroup: groupMap.oilseeds,
      predecessorGroup: groupMap.cereals,
      compatibilityLevel: COMPATIBILITY.GOOD,
    },
    {
      targetGroup: groupMap.oilseeds,
      predecessorGroup: groupMap.legumes,
      compatibilityLevel: COMPATIBILITY.GOOD,
    },
    {
      targetGroup: groupMap.oilseeds,
      predecessorGroup: groupMap.technical,
      compatibilityLevel: COMPATIBILITY.GOOD,
    },
    {
      targetGroup: groupMap.oilseeds,
      predecessorGroup: groupMap.oilseeds,
      compatibilityLevel: COMPATIBILITY.ACCEPTABLE,
    },
  ];
  await CropCompatibilityRule.insertMany(rules);

  console.log("Seed: CropCompatibilityRules");
}