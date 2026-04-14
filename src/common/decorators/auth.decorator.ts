import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function Auth() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: 'Não autorizado' }),
  );
}
