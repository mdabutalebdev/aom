import { FilterQuery } from 'mongoose';
import { Contact } from './contact.model';
import { IContact, TContactStatus } from './contact.interface';

interface IListQuery {
  search?: string;
  status?: string;
  page?: string;
  limit?: string;
}

interface IListResult {
  data: IContact[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// POST /api/contacts — PUBLIC: a visitor submits the contact form.
const createContact = async (payload: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<IContact> => {
  const contact = await Contact.create(payload);
  return contact;
};

// GET /api/contacts — admin: paginated, filterable list.
const getAllContacts = async (query: IListQuery): Promise<IListResult> => {
  const { search, status } = query;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IContact> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  const [data, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Contact.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// GET /api/contacts/:id — admin: single submission.
const getContactById = async (id: string): Promise<IContact> => {
  const contact = await Contact.findById(id);
  if (!contact) {
    throw Object.assign(new Error('Contact not found'), { status: 404 });
  }
  return contact;
};

// PATCH /api/contacts/:id/status — admin: update status.
const updateContactStatus = async (
  id: string,
  status: TContactStatus,
): Promise<IContact> => {
  const updated = await Contact.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );
  if (!updated) {
    throw Object.assign(new Error('Contact not found'), { status: 404 });
  }
  return updated;
};

// DELETE /api/contacts/:id — admin: delete a submission.
const deleteContact = async (id: string): Promise<IContact> => {
  const deleted = await Contact.findByIdAndDelete(id);
  if (!deleted) {
    throw Object.assign(new Error('Contact not found'), { status: 404 });
  }
  return deleted;
};

export const ContactService = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};
