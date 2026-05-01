import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';

const userRepo = AppDataSource.getRepository(User);

export const createOrgUser = async (email: string, organization_id: string) => {
  const existing = await userRepo.findOneBy({ email });
  if (existing) throw new Error('EMAIL_EXISTS');
  const password = Math.random().toString(36).slice(-10);
  const user = new User();
  user.email = email;
  user.role = UserRole.ORG_USER;
  user.organization_id = organization_id;
  await user.setPassword(password);
  await userRepo.save(user);
  return { user: { id: user.id, email: user.email }, raw_password: password };
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

export const changePassword = async (id: string, newPassword: string) => {
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error('USER_NOT_FOUND');
  await user.setPassword(newPassword);
  await userRepo.save(user);
  return true;
};

export const deleteUser = async (id: string) => {
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error('USER_NOT_FOUND');
  await userRepo.softRemove(user);
  return true;
};
