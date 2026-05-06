import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { adClient } from '../config/ad-client';

export const setupFirstAdmin = async (email: string, plainPassword: string) => {
  const userRepo = AppDataSource.getRepository(User);
  
  // const existingLocal = await userRepo.findOneBy({ email });
  // if (existingLocal) throw new Error('ADMIN_ALREADY_EXISTS');

  const adResponse = await adClient.signUp({
    firstName: 'Admin',
    lastName: 'System',
    phone: '0000000000',
    email: email,
    password: plainPassword
  }).catch((err) => {
    throw new Error(`AD_CREATION_FAILED: ${err.message}`);
  });

  const admin = new User();
  admin.email = email;
  admin.role = UserRole.ADMIN;
  admin.organization_id = null;
  admin.status = 'ACTIVE';
  await userRepo.save(admin);

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    created_at: admin.created_at,
    ad_user_created: true
  };
};