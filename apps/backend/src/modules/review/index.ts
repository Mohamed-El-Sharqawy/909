import { Elysia } from "elysia";
import { ReviewService } from "./service";
import { ReviewModel } from "./model";
import { authPlugin } from "../../plugins/auth";

export const reviewController = new Elysia({ prefix: "/reviews" })
  .use(authPlugin)
  // Public: Get approved reviews for homepage
  .get("/homepage", async () => {
    const reviews = await ReviewService.listForHomepage(6);
    return reviews;
  })
  // Public: Get reviews for a product
  .get("/product/:productId", async ({ params }) => {
    const reviews = await ReviewService.getByProductId(params.productId);
    return reviews;
  })
  // Admin: Get all reviews
  .get("/", async ({ isAdmin }) => {
    if (!isAdmin) {
      return { error: "Unauthorized" };
    }
    const reviews = await ReviewService.list();
    return reviews;
  }, { isAdmin: true })
  // Admin: Get single review
  .get("/:id", async ({ params, isAdmin }) => {
    if (!isAdmin) {
      return { error: "Unauthorized" };
    }
    const review = await ReviewService.getById(params.id);
    if (!review) {
      return { error: "Review not found" };
    }
    return review;
  }, { isAdmin: true })
  // Authenticated: Create review
  .post("/", async ({ body, user, isSignIn }) => {
    const customerName = isSignIn && user
      ? `${user.firstName} ${user.lastName}`
      : body.customerName || "Anonymous";

    const review = await ReviewService.create({
      productId: body.productId,
      userId: user?.id,
      customerName,
      title: body.title,
      content: body.content,
      rating: body.rating,
    });
    return review;
  }, {
    body: ReviewModel.create,
    optionalAuth: true,
  })
  // Admin: Update review
  .patch("/:id", async ({ params, body, isAdmin }) => {
    if (!isAdmin) {
      return { error: "Unauthorized" };
    }
    const review = await ReviewService.update(params.id, body);
    return review;
  }, {
    body: ReviewModel.update,
    isAdmin: true,
  })
  // Admin: Approve review
  .post("/:id/approve", async ({ params, isAdmin }) => {
    if (!isAdmin) {
      return { error: "Unauthorized" };
    }
    const review = await ReviewService.approve(params.id);
    return review;
  }, { isAdmin: true })
  // Admin: Delete review
  .delete("/:id", async ({ params, isAdmin }) => {
    if (!isAdmin) {
      return { error: "Unauthorized" };
    }
    await ReviewService.delete(params.id);
    return { success: true };
  }, { isAdmin: true });
