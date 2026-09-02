import User from "../db/User.js"
import { validateEmail } from "../../../shared/validation.js";

export async function checkUserExists(req, res) {
  const { email } = req.query;
  const emailError = validateEmail(email);

  if (emailError) {
    return res.status(400).json({
      message: emailError,
    });
  }

  try {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    res.status(200).json({
      exists: !!user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to check user",
    });
  }
}