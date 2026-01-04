import mongoose from "mongoose";

export interface UserType {
  name: string;
  email: string;
  picture: string;
  sub: string;
  projects: [{ name: string; techStack: string; createdAt: Date }];
}

const UserSchema = new mongoose.Schema<UserType>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email address!"],
  },
  picture: {
    type: String,
  },
  sub: {
    type: String,
    required: true,
    unique: true,
  },
  projects: [
    {
      name: {
        type: String,
        required: true,
      },
      techStack: {
        type: String,
        enum: ["react", "node", "express", "nextjs", "mern","blank"],
      },
      createdAt: Date,
    },
  ],
});

const User = mongoose.model("User", UserSchema);
export default User;
