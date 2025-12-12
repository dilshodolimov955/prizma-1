export class CreateBranchDto {
  name: string;
  logoUrl?: string;
  address: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
