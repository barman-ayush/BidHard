import Bid from "./bid.js"
import AuctionItem from "./auctionItem.js"
import User from "./user.js"

// Bid ↔ User
Bid.belongsTo(User, {
  foreignKey: "bidderId",
  as: "bidder",
})

User.hasMany(Bid, {
  foreignKey: "bidderId",
  as: "bids",
})

// Bid ↔ AuctionItem
Bid.belongsTo(AuctionItem, {
  foreignKey: "itemId",
})

AuctionItem.hasMany(Bid, {
  foreignKey: "itemId",
})

export {
  Bid,
  AuctionItem,
  User,
}
