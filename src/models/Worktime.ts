import { model, Schema } from "mongoose";

const worktimeSchema = new Schema({
  userId: { type: String, required: true },
  startAt: { type: Date, required: true, default: Date.now() },
  endAt: Date,
});

const Worktime = model("Worktime", worktimeSchema);

export default Worktime;
