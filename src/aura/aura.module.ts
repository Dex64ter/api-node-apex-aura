import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuraLogSchema } from './schemas/aura-log.schema';
import { AuraService } from './aura.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AuraLog', schema: AuraLogSchema }]),
  ],
  providers: [AuraService],
  exports: [AuraService],
})
export class AuraModule {}
