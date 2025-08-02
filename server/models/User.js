import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    _id: {type: String , required: true},
    username: {type: String , required: true},
    email: {type: String , required: true},
    image: {type: String , required: true},
    role: {type: String , enum: ["user", "hotelOwner"],default: "user"},
    recentSearchedCities: [{type: String, required: false}],
    
  // ✅ New activity log field
  activity: [
    {
      type: {
        type: String,
        enum: ["login", "logout"],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

const User = mongoose.model("User",userSchema);

export default User;

