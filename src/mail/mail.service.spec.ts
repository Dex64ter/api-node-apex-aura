import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { Resend } from 'resend';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: Resend,
          useValue: {
            emails: {
              send: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
