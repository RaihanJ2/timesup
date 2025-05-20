import mongoose, { Schema } from "mongoose";
import { IAlarm } from "../types";

const AlarmSchema = new Schema({
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
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Alarm = mongoose.model<IAlarm>("Alarm", AlarmSchema);

export default Alarm;
