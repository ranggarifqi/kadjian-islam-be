import { Test, TestingModule } from '@nestjs/testing';
import { LibPhoneNumberService } from './libPhoneNumber.service';

describe('libPhoneNumberService Unit test', () => {
  let service: LibPhoneNumberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibPhoneNumberService],
    }).compile();

    service = module.get<LibPhoneNumberService>(LibPhoneNumberService);
  });

  describe('splitCountryCodeAndNumber()', () => {
    const testCases: SplitTestCase[] = [
      {
        input: '+6212345678',
        expected: { countryCode: '+62', phoneNumber: '12345678' },
      },
      {
        input: '+62 12345678',
        expected: { countryCode: '+62', phoneNumber: '12345678' },
      },
      {
        input: '+62 1234-5678-90',
        expected: { countryCode: '+62', phoneNumber: '1234567890' },
      },
      {
        input: '081234567890',
        expected: { countryCode: '+62', phoneNumber: '81234567890' },
      },
      {
        input: '0812 3456 7890',
        expected: { countryCode: '+62', phoneNumber: '81234567890' },
      },
      {
        input: '0812-3456-7890',
        expected: { countryCode: '+62', phoneNumber: '81234567890' },
      },
    ];

    testCases.forEach((testCase) => {
      it(`should split ${testCase.input} correctly`, () => {
        const result = service.splitCountryCodeAndNumber(testCase.input);
        expect(result).toStrictEqual(testCase.expected);
      });
    });
  });
});

interface SplitTestCase {
  input: string;
  expected: { countryCode: string; phoneNumber: string };
}
