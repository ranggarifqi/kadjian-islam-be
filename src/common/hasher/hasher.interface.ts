export abstract class HasherService {
  abstract hash(rawPassword: string): Promise<string>;
  abstract compare(
    passwordToCompare: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
