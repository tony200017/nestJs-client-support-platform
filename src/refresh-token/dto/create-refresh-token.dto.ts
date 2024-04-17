import mongoose from "mongoose";

export class CreateRefreshTokenDto {
refreshToken:string;
tokenExpires:Date;
userId:mongoose.Types.ObjectId;
}
