import { getCompatibilityMatrix, getCropSelectionData } from "../services/cropCompatibilityService.js";

export const getCropCompatibilityMatrixController = async (req, res, next) => {
  try {
    const matrix = await getCompatibilityMatrix();

    res.json({
      success: true,
      data: matrix,
    });
  } catch (error) {
    next(error);
  }
};

export const getCropSelection = async (req, res, next) => {
  try {
    const data = await getCropSelectionData(
      req.params.fieldId,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
