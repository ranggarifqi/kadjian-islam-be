export abstract class TestFactory<T> {
  abstract create(data?: Partial<T>): Promise<T>;
}
