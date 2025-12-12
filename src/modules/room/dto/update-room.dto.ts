export class UpdateRoomDto {
  name?: string;
  capacity?: number;
  branchId?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
