import { Injectable } from '@nestjs/common';
import { ServiceGroupService } from 'src/web/services/service-group/service-group.service';

@Injectable()
export class UiService {
  constructor(private readonly serviceGroupService: ServiceGroupService) {}
}
