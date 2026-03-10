import { getCompatibilityMatrix } from "../services/cropCompatibilityService.js";

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