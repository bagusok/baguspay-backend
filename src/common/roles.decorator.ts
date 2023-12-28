import { Reflector } from '@nestjs/core';
import { IRole } from '../auth/auth.service';

export const Roles = Reflector.createDecorator<IRole[]>();
