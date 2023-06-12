import * as Joi from 'joi';

export const createCustomerSchema = Joi.object({
  name: Joi.string().required(),
  document: Joi.string().required(),
});

export class CreateCustomerDto {
  document: string;
  name: string;
}
