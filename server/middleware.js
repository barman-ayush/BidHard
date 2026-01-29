import { UnauthorizedError } from "./lib/error/http-errors.js";
import User  from "./lib/schema/user.js"; // adjust path if needed

export default async function middleware(req, res, next) {
  try {
    let clerkUserId = null;

    // 1️⃣ Browser request (Clerk)
    if (typeof req.auth === "function") {
      const auth = await req.auth();

      if (auth?.isAuthenticated && auth?.userId) {
        clerkUserId = auth.userId;
      }
    }

    // 2️⃣ Socket / internal request
    if (!clerkUserId && req.body?.bidderId) {
      clerkUserId = req.body.bidderId;
    }

    if (!clerkUserId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // 3️⃣ Fetch user from DB
    const user = await User.findOne({
      where: { clerkUserId },
    });

    if (!user) {
      throw new UnauthorizedError("User not found in database");
    }

    // 🔥 Normalize to DB user
    req.user = {
      id: user.id,                 // DB ID (IMPORTANT)
      clerkUserId: user.clerkUserId,
      email: user.email,
    };

    next();
  } catch (err) {
    next(err);
  }
}
