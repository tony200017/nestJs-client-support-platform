import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';

import { RefreshToken, RefreshTokenSchema } from './refresh-token.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  controllers: [],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
