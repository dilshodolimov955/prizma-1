export class CreateRoomDto {
  name: string;
  capacity: number;
  branchId: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
