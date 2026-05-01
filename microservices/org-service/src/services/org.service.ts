import { AppDataSource } from '../config/data-source';
import { Organization } from '../entities/Organization';

const orgRepo = AppDataSource.getRepository(Organization);

export const createOrganization = async (data: any) => {
  const org: any = orgRepo.create(data);
  const saved = await orgRepo.save(org);
  const authResponse = await fetch(`${process.env.AUTH_SERVICE_URL}/api/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.INTERNAL_TOKEN || ''}`
    },
    body: JSON.stringify({ email: saved.email, organization_id: saved.id })
  });
  const authData = await authResponse.json();
  if (!authResponse.ok) {
    await orgRepo.remove(saved);
    throw new Error('AUTH_USER_CREATION_FAILED');
  }
  return { organization: saved, user_credentials: { email: saved.email, password: authData.data.raw_password } };
};

export const getOrganizations = async (type?: string, status?: string) => {
  const where: any = {};
  if (type) where.type = type;
  if (status) where.status = status;
  return await orgRepo.find({ where, order: { created_at: 'DESC' } });
};

export const getOrganizationById = async (id: string) => {
  const org = await orgRepo.findOneBy({ id });
  if (!org) throw new Error('NOT_FOUND');
  return org;
};

export const updateOrganization = async (id: string, data: any) => {
  const org = await orgRepo.findOneBy({ id });
  if (!org) throw new Error('NOT_FOUND');
  orgRepo.merge(org, data);
  return await orgRepo.save(org);
};

export const deleteOrganization = async (id: string) => {
  const org = await orgRepo.findOneBy({ id });
  if (!org) throw new Error('NOT_FOUND');
  await orgRepo.softRemove(org);
  return true;
};
