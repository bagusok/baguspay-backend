import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { decryptSignature } from 'src/utils';

export class SignatureMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers['x-signature']) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid Signature',
      });
    } else {
      const signature = req.headers['x-signature'] as string;
      const decryptedSignature = decryptSignature(signature);
      console.log(decryptedSignature);
      const getTimestamp = decryptedSignature.split(':')[1];

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const tsToSeconds = Math.floor(new Date(getTimestamp).getTime() / 1000);
      if (Math.abs(nowInSeconds - tsToSeconds) > 5) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Invalid Signature.',
        });
      }
    }
    next();
  }
}
