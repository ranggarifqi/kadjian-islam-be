/**
 * jest.useFakeTimers somehow makes prisma's interactive transaction becomes timeout.
 * Found the similar issue (not from prisma) regarding this, and it can solve this problem
 * https://github.com/nock/nock/issues/2200#issuecomment-1280957462
 */
export const getFakeTimer = (now?: Date) => {
  return jest
    .useFakeTimers({
      doNotFake: [
        'nextTick',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
    })
    .setSystemTime(now);
};
