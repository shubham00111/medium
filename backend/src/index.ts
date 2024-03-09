import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
const secretPasscode = "shubham858@";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

app.use("/api/v1/blog/*", async (c, next) => {
  const header = c.req.header("authorization")?.split(" ")[1] || "";
  const response = await verify(header, secretPasscode);
  if (response.email) {
    next();
  } else {
    return c.json({
      msg: "invalid token",
    });
  }
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/v1/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
      name: body.name,
    },
  });
  const token = await sign(user, secretPasscode);
  return c.json({
    token,
  });
});

app.post("/api/v1/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { email, password } = body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
      password: password,
    },
  });

  if (!user) {
    return c.json({
      msg: "invalid credentials",
    });
  }

  const token = await sign(user, secretPasscode);
  return c.json({
    token,
  });
});

app.post("/api/vi/blog", (c) => {
  return c.text("create a blog");
});

app.put("/api/v1/blog", (c) => {
  return c.text("update a blog");
});

app.get("/api/v1/blog/:id", (c) => {
  return c.text("get a blgo");
});

export default app;
