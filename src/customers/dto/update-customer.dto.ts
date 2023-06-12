import * as Joi from 'joi';

export const updateCustomerSchema = Joi.object({
  id: Joi.string().uuid(),
  name: Joi.string().required(),
  document: Joi.string().pattern(new RegExp(/^\d+$/)).required(),
});

export class UpdateCustomerDto {
  id: string;
  document: string;
  name: string;
}
