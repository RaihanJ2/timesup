import { Document } from "mongoose";

export interface IUser extends Document {
  _Id?: string;
  email?: string;
  name?: string;
}
