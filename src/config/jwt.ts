import jwt from "jsonwebtoken";

export const generateToken = (userId: number) =>
  jwt.sign({ uid: userId }, "SECRET", { expiresIn: "7d" });
