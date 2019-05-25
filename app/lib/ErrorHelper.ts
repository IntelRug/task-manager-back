import ErrorCode from './ErrorCode';

export default class ErrorHelper {
  // public static promiseError(error, statusCode = 500) {
  //   let e = (typeof error === 'string') ? new Error(error) : error;
  //   if (e instanceof Error) {
  //     Object.defineProperty(e, 'statusCode', statusCode);
  //     return Promise.reject(e);
  //   }
  //   e = new Error('Server error');
  //   Object.defineProperty(e, 'statusCode', 500);
  //   return Promise.reject(e);
  // }

  public static api(res, err = {}, additional = {}) {
    /**
     * Common: 0 - 99
     * Apps: 100 - 199
     * Users: 200 - 299
     * Tasks: 300 - 399
     * Organizations: 400 - 499
     */
    const errors = {
      0: 'Unknown error',
      1: 'Not logged in',
      2: 'Access denied',
      3: 'Wrong parameters given',
      4: 'Token expired',
      300: 'This task is already finished',
    };

    const code = err instanceof ErrorCode ? err.code : 0;
    const returnCode = errors[code] ? code : 0;
    const returnMessage = errors[errors[code] ? code : 0];

    return res.status(code === 0 ? 500 : 400)
      .send({ code: returnCode, message: returnMessage, ...additional });
  }
}
