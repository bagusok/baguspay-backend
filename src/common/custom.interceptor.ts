import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class CustomInterceptors implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    console.log('Before...');
    return handler.handle().pipe(
      map((data) => {
        return {
          status: data?.response?.statusResponse,
          code: data?.response?.code,
          message: data?.response?.message,
          data: data?.response?.data,
          // error: data?.error,
        };
      }),
    );
  }
}
