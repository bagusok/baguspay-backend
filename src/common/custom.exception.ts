import { HttpException } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(code: number, message: string, data?: any) {
    let statusResponse = false;

    if (code >= 200 && code < 300) {
      statusResponse = true;
    }

    super(
      {
        statusResponse,
        code: code,
        message,
        data,
      },
      code,
    );
  }
}
