import mongoose from "mongoose";

const AlarmSchema = new mongoose.Schema({
  hours: {
    type: String,
    required: true,
  },
  minutes: {
    type: String,
    required: true,
  },
  ampm: {
    type: String,
    required: true,
    enum: ["AM", "PM"],
  },
  name: {
    type: String,
    required: true,
  },
  days: {
    type: [Number],
    default: [],
  },
  isSet: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: String, // Changed from ObjectId to String
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Alarm = mongoose.models.Alarm || mongoose.model("Alarm", AlarmSchema);
export default Alarm;
