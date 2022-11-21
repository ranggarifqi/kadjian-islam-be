export abstract class BasePhoneService {
  abstract splitCountryCodeAndNumber(phoneNumber: string): {
    countryCode: string;
    phoneNumber: string;
  };
}
