// pages/api/check.js
export default function handler(req, res) {
  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  res.status(200).json({ envValue: process.env.NEXTAUTH_URL });
}
