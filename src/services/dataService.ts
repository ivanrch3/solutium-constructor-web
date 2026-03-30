import { getSupabase } from './supabaseClient';
import { Profile, Project, Customer, Product } from '../types/schema';
import { profileSchema, projectSchema, customerSchema, productSchema } from '../types/zodSchemas';
import { z } from 'zod';

// Helper to handle validation and logging
const validateData = <T>(schema: z.ZodType<T>, data: unknown, context: string): T | null => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Zod Validation Error in ${context}:`, result.error.format());
    return null;
  }
  return result.data;
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    const mappedData = {
      id: data.id,
      role: data.role,
      activeTheme: data.active_theme,
      fontFamily: data.font_family,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
    };

    return validateData(profileSchema, mappedData, 'getProfile');
  } catch (err) {
    console.error('Error in getProfile:', err);
    return null;
  }
};

export const getProfiles = async (page: number, pageSize: number): Promise<Profile[]> => {
  try {
    const supabase = getSupabase();
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .range(start, end);

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      role: item.role,
      activeTheme: item.active_theme,
      fontFamily: item.font_family,
      fullName: item.full_name,
      avatarUrl: item.avatar_url,
    }));

    const validData = mappedData
      .map(item => validateData(profileSchema, item, 'getProfiles'))
      .filter((item): item is Profile => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getProfiles:', err);
    return [];
  }
};

export const getProjects = async (page: number, pageSize: number): Promise<Project[]> => {
  try {
    const supabase = getSupabase();
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .range(start, end);

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      customerId: item.customer_id,
      status: item.status,
      createdAt: item.created_at,
      webConfig: item.web_config,
      branding: item.branding,
    }));

    const validData = mappedData
      .map(item => validateData(projectSchema, item, 'getProjects'))
      .filter((item): item is Project => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getProjects:', err);
    return [];
  }
};

export const getCustomers = async (page: number, pageSize: number): Promise<Customer[]> => {
  try {
    const supabase = getSupabase();
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .range(start, end);

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      companyName: item.company_name,
      contactEmail: item.contact_email,
      contactPhone: item.contact_phone,
      brandColors: item.brand_colors,
      createdAt: item.created_at,
    }));

    const validData = mappedData
      .map(item => validateData(customerSchema, item, 'getCustomers'))
      .filter((item): item is Customer => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getCustomers:', err);
    return [];
  }
};

export const getProducts = async (page: number, pageSize: number): Promise<Product[]> => {
  try {
    const supabase = getSupabase();
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(start, end);

    if (error) throw error;
    if (!data) return [];

    const mappedData = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      isActive: item.is_active,
      appData: item.app_data,
      createdAt: item.created_at,
    }));

    const validData = mappedData
      .map(item => validateData(productSchema, item, 'getProducts'))
      .filter((item): item is Product => item !== null);

    return validData;
  } catch (err) {
    console.error('Error in getProducts:', err);
    return [];
  }
};
