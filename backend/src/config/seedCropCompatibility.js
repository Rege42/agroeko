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
  try {

    await CropCompatibilityRule.deleteMany({});
    await CropRotationGroup.deleteMany({});

    console.log("Old data cleared");

    const groupsData = [
      { code: "winter_rye", name: "Озимая рожь", displayOrderRow: 1, displayOrderColumn: 1 },
      { code: "winter_wheat", name: "Озимая пшеница", displayOrderRow: 2, displayOrderColumn: 2 },
      { code: "spring_wheat", name: "Яровая пшеница", displayOrderRow: 3, displayOrderColumn: 3 },
      { code: "barley", name: "Ячмень", displayOrderRow: 4, displayOrderColumn: 4 },
      { code: "oats", name: "Овес", displayOrderRow: 5, displayOrderColumn: 5 },
      { code: "corn", name: "Кукуруза на зерно", displayOrderRow: 6, displayOrderColumn: 6 },
      { code: "potato", name: "Картофель", displayOrderRow: 7, displayOrderColumn: 7 },
      { code: "legumes", name: "Бобовые", displayOrderRow: 8, displayOrderColumn: 8 },
      { code: "grass", name: "Многолетние травы", displayOrderRow: 9, displayOrderColumn: 9 },
      { code: "fallow", name: "Пар", displayOrderRow: 10, displayOrderColumn: 10 },
    ];

    const groups = await CropRotationGroup.insertMany(groupsData);

    console.log("Groups created");

    const groupMap = {};

    groups.forEach((g) => {
      groupMap[g.code] = g._id;
    });

    const rulesData = [
      {
        targetGroup: groupMap.winter_rye,
        predecessorGroup: groupMap.legumes,
        compatibilityLevel: COMPATIBILITY.EXCELLENT,
      },
      {
        targetGroup: groupMap.winter_rye,
        predecessorGroup: groupMap.grass,
        compatibilityLevel: COMPATIBILITY.GOOD,
      },
      {
        targetGroup: groupMap.winter_rye,
        predecessorGroup: groupMap.winter_wheat,
        compatibilityLevel: COMPATIBILITY.ACCEPTABLE,
      },

      {
        targetGroup: groupMap.winter_wheat,
        predecessorGroup: groupMap.legumes,
        compatibilityLevel: COMPATIBILITY.EXCELLENT,
      },
      {
        targetGroup: groupMap.winter_wheat,
        predecessorGroup: groupMap.potato,
        compatibilityLevel: COMPATIBILITY.GOOD,
      },
      {
        targetGroup: groupMap.winter_wheat,
        predecessorGroup: groupMap.barley,
        compatibilityLevel: COMPATIBILITY.RISKY,
      },

      {
        targetGroup: groupMap.corn,
        predecessorGroup: groupMap.winter_wheat,
        compatibilityLevel: COMPATIBILITY.GOOD,
      },
      {
        targetGroup: groupMap.corn,
        predecessorGroup: groupMap.grass,
        compatibilityLevel: COMPATIBILITY.GOOD,
      },

      {
        targetGroup: groupMap.potato,
        predecessorGroup: groupMap.grass,
        compatibilityLevel: COMPATIBILITY.EXCELLENT,
      },
      {
        targetGroup: groupMap.potato,
        predecessorGroup: groupMap.corn,
        compatibilityLevel: COMPATIBILITY.ACCEPTABLE,
      },

      {
        targetGroup: groupMap.winter_wheat,
        predecessorGroup: groupMap.winter_wheat,
        compatibilityLevel: COMPATIBILITY.FORBIDDEN,
        note: "Повторный посев озимой пшеницы недопустим",
      },
    ];

    await CropCompatibilityRule.insertMany(rulesData);

    console.log("Compatibility rules created");
    console.log("SEED COMPLETED");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}