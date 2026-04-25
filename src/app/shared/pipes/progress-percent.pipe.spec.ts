import { ProgressPercentPipe } from './progress-percent.pipe';

describe('ProgressPercentPipe', () => {
  const pipe = new ProgressPercentPipe();

  it('transforms completed lessons into percent', () => {
    expect(pipe.transform(4, 10)).toBe(40);
  });

  it('rounds fractional progress', () => {
    expect(pipe.transform(2, 3)).toBe(67);
  });

  it('guards against division by zero', () => {
    expect(pipe.transform(1, 0)).toBe(0);
  });
});
