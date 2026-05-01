import { AppDataSource } from '../config/data-source';
import { Organization, OrgType } from '../entities/Organization';
import { AgencyAssignment } from '../entities/AgencyAssignment';

const orgRepo = AppDataSource.getRepository(Organization);
const assignRepo = AppDataSource.getRepository(AgencyAssignment);

export const assignCommerces = async (agencyId: string, commerceIds: string[]) => {
  const agency = await orgRepo.findOneBy({ id: agencyId, type: OrgType.AGENCY });
  if (!agency) throw new Error('AGENCY_NOT_FOUND');
  const commerces = await orgRepo.createQueryBuilder("org")
    .where("org.id IN (:...ids)", { ids: commerceIds })
    .andWhere("org.type = :type", { type: OrgType.COMMERCE })
    .getMany();
  if (commerces.length !== commerceIds.length) throw new Error('INVALID_COMMERCES');
  for (const commerce of commerces) {
    const existing = await assignRepo.findOneBy({ agency_id: agencyId, commerce_id: commerce.id });
    if (!existing) {
      const newAssign = assignRepo.create({ agency_id: agencyId, commerce_id: commerce.id });
      await assignRepo.save(newAssign);
    }
  }
  return true;
};

export const unassignCommerce = async (agencyId: string, commerceId: string) => {
  const assignment = await assignRepo.findOneBy({ agency_id: agencyId, commerce_id: commerceId });
  if (!assignment) throw new Error('ASSIGNMENT_NOT_FOUND');
  await assignRepo.remove(assignment);
  return true;
};

export const getAgencyCommerces = async (agencyId: string) => {
  const assignments = await assignRepo.find({ where: { agency_id: agencyId }, relations: ['commerce'] });
  return assignments.map(a => a.commerce);
};

export const getNetworkGraph = async () => {
  const orgs = await orgRepo.find({ select: ['id', 'name', 'type', 'status'] });
  const assignments = await assignRepo.find();
  const nodes = orgs.map(org => ({ id: org.id, label: org.name, group: org.type, status: org.status }));
  const edges = assignments.map(assign => ({ id: assign.id, source: assign.agency_id, target: assign.commerce_id }));
  return { nodes, edges };
};
