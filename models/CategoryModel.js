import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
});

export default mongoose.model("Category", categorySchema);

// type: String: Indicates that the slug field will store a string value.
// lowercase: true: This ensures that any string stored in slug will be converted to lowercase. URLs are case-insensitive, and lowercase URLs are generally preferred for consistency and SEO benefits.