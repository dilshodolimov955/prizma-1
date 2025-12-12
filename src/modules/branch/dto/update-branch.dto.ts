export class UpdateBranchDto {
  name?: string;
  logoUrl?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
