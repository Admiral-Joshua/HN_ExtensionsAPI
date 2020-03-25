CREATE TABLE "users" (
  "userId" SERIAL PRIMARY KEY,
  "username" text,
  "email" text,
  "phone" text,
  "password" varchar,
  "salt" text
);

CREATE TABLE "user_images" (
  "userId" int,
  "imgId" int
);

CREATE TABLE "images" (
  "imgId" SERIAL PRIMARY KEY,
  "imgUrl" varchar
);

ALTER TABLE "user_images" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "user_images" ADD FOREIGN KEY ("imgId") REFERENCES "images" ("imgId");
