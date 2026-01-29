import express from "express"
import { requireAuth } from "@clerk/express"
import { clerkClient } from "@clerk/clerk-sdk-node"
import User from "../../lib/schema/user.js"
import middleware from "../../middleware.js"

const router = express.Router()
console.log("auth loaded")

router.get("/register", middleware ,async (req, res, next) => {
  try {
    const { userId } = req.auth();
    console.log("Hit")

    let user = await User.findOne({
      where: { clerkUserId: userId },
    })

    if (user) {
      return res.status(200).json({
        success: true,
        user,
        created: false,
      })
    }

    const clerkUser = await clerkClient.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress

    user = await User.create({
      clerkUserId: userId,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    })

    return res.status(201).json({
      success: true,
      user,
      created: true,
    })
  } catch (err) {
    next(err)
  }
})

export default router
