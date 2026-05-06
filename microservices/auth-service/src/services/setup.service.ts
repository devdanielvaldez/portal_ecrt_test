import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';

export const setupFirstAdmin = async (email: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOneBy({ email });
  if (existing) throw new Error('ADMIN_ALREADY_EXISTS');
  const admin = new User();
  admin.email = email;
  admin.role = UserRole.ADMIN;
  admin.organization_id = null;
  admin.status = 'ACTIVE';
  await userRepo.save(admin);
  return { id: admin.id, email: admin.email, role: admin.role, created_at: admin.created_at };
};
