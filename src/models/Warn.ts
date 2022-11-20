import { model, Schema } from "mongoose";

const warnSchema = new Schema({
  userId: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now() },
  reason: { type: String, required: true },
});

const Warn = model("Warn", warnSchema);

export default Warn;
