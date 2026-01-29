import express from "express";
import AuctionItem from "../../lib/schema/auctionItem.js";

const router = express.Router();

router.post("/items", async (req, res, next) => {
  try {
    const { title, startingPrice, durationSeconds } = req.body;

    // ---- Validation ----
    if (
      !title ||
      typeof startingPrice !== "number" ||
      startingPrice <= 0 ||
      typeof durationSeconds !== "number" ||
      durationSeconds <= 0
    ) {
      return res.status(400).json({
        message: "Invalid request payload",
      });
    }

    // ---- Server authoritative time ----
    const now = new Date();
    const auctionEndTime = new Date(
      now.getTime() + durationSeconds * 1000
    );

    // ---- Create item ----
    const item = await AuctionItem.create({
      title,
      startingPrice,
      currentPrice: startingPrice,
      currentBidderId: null,
      auctionEndTime,
      status: "LIVE",
      version: 0,
    });

    return res.status(201).json({
      id: item.id,
      title: item.title,
      startingPrice: item.startingPrice,
      currentPrice: item.currentPrice,
      auctionEndTime: item.auctionEndTime,
      status: item.status,
      serverTime: Date.now(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
