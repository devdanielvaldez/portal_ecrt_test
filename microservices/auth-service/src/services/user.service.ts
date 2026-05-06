import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';

const userRepo = AppDataSource.getRepository(User);

export const createOrgUser = async (email: string, organization_id: string) => {
  const existing = await userRepo.findOneBy({ email });
  if (existing) throw new Error('EMAIL_EXISTS');
  const user = new User();
  user.email = email;
  user.role = UserRole.ORG_USER;
  user.organization_id = organization_id;
  user.status = 'ACTIVE';
  await userRepo.save(user);
  return { user: { id: user.id, email: user.email } };
};

export const getUsersByOrg = async (organization_id: string) => {
  return await userRepo.find({ where: { organization_id }, select: ['id', 'email', 'role', 'status', 'created_at'] });
};

export const updateUser = async (id: string, data: any) => {
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error('USER_NOT_FOUND');
  userRepo.merge(user, data);
  return await userRepo.save(user);
};

export const changePasswordLocal = async (id: string, newPassword: string) => {
  throw new Error('Password management is delegated to Active Directory. Use /forget-password or /change-password endpoints.');
};

export const deleteUser = async (id: string) => {
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error('USER_NOT_FOUND');
  await userRepo.softRemove(user);
  return true;
};
