import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { auth } from "./modules/auth";
import { user } from "./modules/user";
import { product } from "./modules/product";
import { collection } from "./modules/collection";
import { order } from "./modules/order";
import { cart } from "./modules/cart";
import { favourite } from "./modules/favourite";
import { wishlist } from "./modules/wishlist";
import { image } from "./modules/image";
import { color } from "./modules/color";
import { size } from "./modules/size";
import { couponRoutes } from "./modules/coupon";
import { shoppableVideoController } from "./modules/shoppable-video";
import { instagramPostController } from "./modules/instagram-post";
import { reviewController } from "./modules/review";
import { banner } from "./modules/banner";

const port = process.env.PORT || 3001;
const corsOrigins = process.env.CORS_ORIGIN?.split(",") || [
  "http://localhost:3000",
  "http://localhost:5173",
];

const app = new Elysia()
  .use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "E-Commerce API",
          version: "2.0.0",
          description: "API for the e-commerce platform",
        },
      },
    })
  )
  .get("/", () => ({
    name: "E-Commerce API",
    version: "2.0.0",
    status: "running",
  }))
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .group("/api", (app) =>
    app
      .use(auth)
      .use(user)
      .use(product)
      .use(collection)
      .use(order)
      .use(cart)
      .use(favourite)
      .use(wishlist)
      .use(image)
      .use(color)
      .use(size)
      .use(couponRoutes)
      .use(shoppableVideoController)
      .use(instagramPostController)
      .use(reviewController)
      .use(banner)
  )
  .listen(port);

console.log(`E-Commerce API is running at http://localhost:${port}`);
console.log(`Swagger docs at http://localhost:${port}/swagger`);

export type App = typeof app;
