import jwt from "jsonwebtoken";

export const createToken = (id, role, expiresIn) => {
  const payload = { id, role };
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn,
  });
  return token;
};
