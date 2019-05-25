export default class ErrorCode extends Error {
  public code: number;

  constructor(code = 0) {
    super('Error with code');
    this.code = code;
  }
}
