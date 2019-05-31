import { body, param, query } from 'express-validator/check';

const validators = {
  register: [
    body('email')
      .trim()
      .not().isEmpty()
      .isEmail()
      .normalizeEmail(),
    body('username')
      .trim()
      .not().isEmpty()
      .isLength({ min: 3, max: 35 })
      .withMessage('Username must be at least 3 characters long and maximum of 35 characters')
      .matches(/^[\w]+$/i)
      .withMessage('Username must contain only letters, numbers and underscores'),
    body('password')
      .not().isEmpty()
      .isLength({ min: 5 })
      .withMessage('Password must be at least 5 characters long'),
    body('first_name')
      .trim()
      .not().isEmpty(),
    body('last_name')
      .trim()
      .not().isEmpty(),
  ],
  login: [
    body('username')
      .trim()
      .not().isEmpty(),
    body('password')
      .trim()
      .not().isEmpty()
      .isLength({ min: 5 })
      .withMessage('must be at least 5 chars long')
      .matches(/\d/)
      .withMessage('must contain a number'),
    body('clientId')
      .trim()
      .not().isEmpty(),
    body('clientSecret')
      .trim()
      .not().isEmpty(),
  ],
  appGetOne: [
    param('appId')
      .isNumeric()
      .withMessage('App id must be numeric'),
  ],
  appCreate: [
    body('name')
      .trim()
      .not().isEmpty(),
    body('description')
      .trim()
      .optional(),
  ],
  taskGetOne: [
    param('taskId')
      .isNumeric()
      .withMessage('Task id must be numeric'),
  ],
  taskGetMany: [
    query('ids')
      .optional()
      .not().isEmpty()
      .isString()
      .withMessage('ids must be string'),
  ],
  taskCreate: [
    body('name')
      .trim()
      .not().isEmpty()
      .withMessage('Task name can not be empty'),
    body('description')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Task description can not be empty'),
  ],
  taskDelete: [
    param('taskId')
      .isNumeric()
      .withMessage('Task id must be numeric'),
  ],
  taskEdit: [
    param('taskId')
      .isNumeric()
      .withMessage('Task id must be numeric'),
    body('name')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Task name can not be empty'),
    body('description')
      .optional()
      .trim(),
    body('status')
      .optional()
      .trim()
      .isNumeric()
      .withMessage('Task status must be numeric'),
    body('deadlineAt')
      .optional()
      .trim()
      .isNumeric()
      .withMessage('Task status must be numeric'),
    body('finishedAt')
      .optional()
      .trim()
      .isNumeric()
      .withMessage('Task status must be numeric'),
  ],
  taskGetExecutors: [
    param('taskId')
      .isNumeric()
      .withMessage('Task id must be numeric'),
  ],
  taskAddExecutors: [
    param('taskId')
      .isNumeric()
      .withMessage('Task id must be numeric'),
    body('user_ids')
      .not().isEmpty()
      .isString()
      .withMessage('user_ids must be string'),
  ],
  taskSetExecutors: [
    param('taskId')
      .isNumeric()
      .withMessage('Task id must be numeric'),
    body('user_ids')
      .isString()
      .withMessage('user_ids must be string'),
  ],
  taskRemoveExecutors: [
    param('taskId')
      .isNumeric()
      .withMessage('Task id must be numeric'),
    body('user_ids')
      .not().isEmpty()
      .isString()
      .withMessage('user_ids must be string'),
  ],
  taskSetStatus: [
    param('taskId')
      .isNumeric()
      .withMessage('Task id must be numeric'),
    body('status')
      .matches(/[0-4]/)
      .withMessage('The value of the \'status\' field can only be between 0 and 4'),
  ],
  taskFinish: [
    param('taskId')
      .isNumeric()
      .withMessage('Task id must be numeric'),
  ],
  listGetOne: [
    param('listId')
      .isNumeric()
      .withMessage('List id must be numeric'),
  ],
  listGetMany: [
    query('ids')
      .optional()
      .not().isEmpty()
      .isString()
      .withMessage('ids must be string'),
  ],
  listCreate: [
    body('name')
      .trim()
      .not().isEmpty()
      .withMessage('List name can not be empty'),
    body('description')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('List description can not be empty'),
  ],
  listDelete: [
    param('listId')
      .isNumeric()
      .withMessage('List id must be numeric'),
  ],
  listEdit: [
    param('listId')
      .isNumeric()
      .withMessage('List id must be numeric'),
    body('name')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('List name can not be empty'),
  ],
  userGetOne: [
    param('userId')
      .isNumeric()
      .withMessage('User id must be numeric'),
  ],
  userGetMany: [
    query('ids')
      .optional()
      .not().isEmpty()
      .isString()
      .withMessage('ids must be string'),
  ],
};

export default validators;
