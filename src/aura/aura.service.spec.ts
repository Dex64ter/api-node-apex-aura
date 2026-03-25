import { Test, TestingModule } from '@nestjs/testing';
import { AuraService } from './aura.service';

describe('AuraService', () => {
  let service: AuraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuraService],
    }).compile();

    service = module.get<AuraService>(AuraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
