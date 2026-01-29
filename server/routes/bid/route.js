// routes/items.js
import express from "express";
import AuctionItem from "../../lib/schema/auctionItem.js";
import sequelize from "../../lib/db/db.js";
import middleware from "../../middleware.js";
import Bid from "../../lib/schema/bid.js"
import User from "../../lib/schema/user.js"
const router = express.Router();

router.get("/items", async (req, res, next) => {
  try {
    const items = await AuctionItem.findAll({
      where: { status: "LIVE" },
      order: [["auctionEndTime", "ASC"]],
      attributes: [
        "id",
        "title",
        "startingPrice",
        "currentPrice",
        "currentBidderId",
        "auctionEndTime",
        "status",
      ],
    });

    res.json({
      serverTime: Date.now(), // 🔥 authoritative time
      items,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/items/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await AuctionItem.findOne({
      where: { id },
      attributes: [
        "id",
        "title",
        "startingPrice",
        "currentPrice",
        "currentBidderId",
        "auctionEndTime",
        "status",
      ],
    });

    // ❌ Not found
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Auction item not found",
      });
    }

    // ✅ Found
    return res.status(200).json({
      success: true,
      serverTime: Date.now(),
      item,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/items/:id/bid", middleware, async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    console.log(req.params , id);

    const { amount } = req.body
    const bidderId = req.user.id // 🔥 assumes auth middleware

    if (!amount || typeof amount !== "number" || amount <= 0) {
      await transaction.rollback()
      return res.status(400).json({ message: "Invalid bid amount" })
    }

    // 🔒 Lock row
    const item = await AuctionItem.findOne({
      where: { id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    })

    if (!item) {
      await transaction.rollback()
      return res.status(404).json({ message: "Auction item not found" })
    }

    // ⏱ Auction ended
    if (new Date() > item.auctionEndTime) {
      await transaction.rollback()
      return res.status(400).json({ message: "Auction ended" })
    }

    // 💰 Bid too low
    if (amount <= Number(item.currentPrice)) {
      await transaction.rollback()
      return res.status(409).json({ message: "Outbid" })
    }

    const oldVersion = item.version

    // 🧠 Optimistic concurrency check
    const [updatedRows] = await AuctionItem.update(
      {
        currentPrice: amount,
        currentBidderId: bidderId,
        version: oldVersion + 1,
      },
      {
        where: {
          id,
          version: oldVersion, // 🔥 version guard
        },
        transaction,
      }
    )

    // ❌ Someone else updated first
    if (updatedRows === 0) {
      await transaction.rollback()
      return res.status(409).json({
        message: "Outbid (race condition)",
      })
    }

    // 📝 Persist bid
    await Bid.create(
      {
        itemId : id,
        bidderId,
        amount,
      },
      { transaction }
    )

    await transaction.commit()

    return res.status(201).json({
      success: true,
      id,
      amount,
      serverTime: Date.now(),
    })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
})

router.get("/items/:id/leaderboard", async (req, res, next) => {
  try {
    const { id: itemId } = req.params

    const leaderboard = await Bid.findAll({
      where: { itemId },
      attributes: [
        "bidderId",
        [sequelize.fn("MAX", sequelize.col("amount")), "highestBid"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "email", "name"], // adjust fields
        },
      ],
      group: ["bidderId", "User.id"],
      order: [[sequelize.literal("highestBid"), "DESC"]],
      limit: 5,
    })

    res.json({
      success: true,
      itemId,
      leaderboard: leaderboard.map((row, index) => ({
        rank: index + 1,
        userId: row.User.id,
        name: row.User.name || row.User.email,
        highestBid: Number(row.get("highestBid")),
      })),
    })
  } catch (err) {
    next(err)
  }
})

export default router;
