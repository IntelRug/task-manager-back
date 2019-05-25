import { validationResult } from 'express-validator/check';
import ErrorHelper from './ErrorHelper';

export default function validate(
  target: Object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>,
) {
  const originalMethod = descriptor.value;

  // eslint-disable-next-line no-param-reassign
  descriptor.value = (req, res, next) => {
    Object.keys(req.body).forEach(param => {
      if (/^\d+$/.test(req.body[param])) {
        req.body[param] = parseInt(req.body[param], 10);
      }
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ErrorHelper.api(res, 3, {
        errors: errors.array({
          onlyFirstError: true,
        }),
      });
    }
    return originalMethod(req, res, next);
  };

  return descriptor;

  // return Object.keys(actions).reduce((result, actionName) => ({
  //   ...result,
  //   [actionName]: (req, res, next) => {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(400).json({ errors: errors.array() });
  //     }
  //     actions[actionName](req, res, next);
  //   },
  // }), Object());
}
