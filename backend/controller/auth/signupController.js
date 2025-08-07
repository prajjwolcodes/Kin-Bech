import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/userModel.js";

export async function signupController(req, res) {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({
        message: "Provide all the data",
      });

    const userExistsWithUsername = await User.findOne({ username });
    if (userExistsWithUsername)
      return res.status(400).json({
        message: "User with that username is already Registered",
      });

    const userExistsWithEmail = await User.findOne({ email });
    if (userExistsWithEmail)
      return res.status(400).json({
        message: "User with that email is already Registered",
      });

    const user = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      role: role || "buyer",
    });

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        email: user.email,
        name: user.username,
      },
      process.env.JWT_SECRET
    );

    return res.status(201).json({
      message: "You are successfully registered",
      token,
      user,
    });
  } catch (error) {
    console.log("Error in signup", error);
    return res.status(400).json({
      error: error.message,
    });
  }
}
