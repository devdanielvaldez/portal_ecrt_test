import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { CreateAdminDTO } from '../schemas/user.schema';

export const setupFirstAdmin = async (data: CreateAdminDTO) => {
  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOneBy({ email: data.email });
  if (existing) throw new Error('ADMIN_ALREADY_EXISTS');
  const admin = new User();
  admin.email = data.email;
  admin.role = UserRole.ADMIN;
  admin.organization_id = null;
  await admin.setPassword(data.password);
  await userRepo.save(admin);
  return { id: admin.id, email: admin.email, role: admin.role, created_at: admin.created_at };
};
