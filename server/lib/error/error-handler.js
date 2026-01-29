import { AppError } from "./AppError.js";

export function handleError(error, req, res, next) {
  // Known / operational errors
  if (error instanceof AppError) {
    console.error("🟡 Operational error:", {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });

    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  // Unexpected errors
  console.error("🔴 Unexpected error:", error);

  return res.status(500).json({
    error: "Something went wrong",
  });
}
