export interface Institution {
  id: string;
  name: string;
  location: string;
  description: string;
  cover_image: string;
  gallery_images: string[];
  address: string;
  logo_url: string | null;
  rating: number;
  programs_count: number;
  website: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  institution_type: string | null;
  slug: string | null;
  mission: string | null;
  vision: string | null;
  is_published: boolean;
  social_facebook: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  social_twitter: string | null;
  social_youtube: string | null;
  social_tiktok: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Program {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  duration: string | null;
  mode: 'Presencial' | 'Virtual' | 'Híbrido';
  cost: number | null;
  level: string | null;
  created_at: string;
  created_by: string | null;
}

export interface GalleryItem {
  id: string;
  institution_id: string;
  url: string;
  caption: string | null;
  category: string;
  sort_order: number;
  created_at: string;
  created_by: string | null;
}

export interface InstitutionSettings {
  id: string;
  institution_id: string;
  email_notifications: boolean;
  application_alerts: boolean;
  platform_updates: boolean;
  language: string;
  theme: string;
}

export interface Opportunity {
  id: string;
  institution_id: string;
  program_id: string | null;
  title: string;
  description: string | null;
  available_spots: number;
  deadline: string;
  status: 'activa' | 'cerrada' | 'borrador';
  created_at: string;
  created_by: string | null;
  programs?: Program;
  institutions?: Institution;
}

export interface ApplicationMessage {
  id: string;
  application_id: string;
  sender_type: 'institution' | 'student';
  sender_name: string;
  content: string;
  read_by_student: boolean;
  read_by_institution: boolean;
  created_at: string;
  created_by: string | null;
}

export interface Application {
  id: string;
  institution_id: string;
  opportunity_id: string | null;
  user_id: string | null;
  name: string;
  last_name: string | null;
  email: string;
  contact_email: string | null;
  phone: string;
  address: string | null;
  educational_level: string;
  birth_date: string | null;
  birth_place: string | null;
  birth_center: string | null;
  blood_type: string | null;
  province: string | null;
  city: string | null;
  sector: string | null;
  cedula_url: string | null;
  birth_certificate_url: string | null;
  residence_letter_url: string | null;
  cedula_rep_url: string | null;
  representative_name: string | null;
  representative_cedula: string | null;
  representative_id: string | null;
  identity_document: string | null;
  cv_url: string | null;
  certificates_url: string | null;
  status: 'pendiente' | 'aceptada' | 'rechazada';
  created_at: string;
  institutions?: Institution;
  opportunities?: Opportunity;
}

export interface Favorite {
  id: string;
  user_id: string;
  institution_id: string;
  created_at: string;
  institutions?: Institution;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'institution';
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export type UserRole = 'student' | 'institution' | null;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
}

export interface Notification {
  id: string;
  user_email: string;
  user_id: string | null;
  user_role: 'student' | 'institution' | 'admin';
  type: 'new_application' | 'status_changed' | 'new_message';
  title: string;
  message: string;
  related_id: string | null;
  read: boolean;
  created_at: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface AdminAccount {
  id: string;
  username: string;
  name: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: 'institution' | 'student' | 'application';
  target_id: string | null;
  details: string | null;
  created_at: string;
}

export interface AdminInstitution {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string;
  institution_type: string | null;
  is_published: boolean;
  is_suspended: boolean;
  suspended_at: string | null;
  created_at: string;
}

export interface AdminStudent {
  id: string;
  name: string;
  last_name: string | null;
  email: string;
  cedula: string | null;
  is_suspended: boolean;
  suspended_at: string | null;
  created_at: string;
}

export interface AdminApplication {
  id: string;
  name: string;
  last_name: string | null;
  email: string;
  status: string;
  educational_level: string;
  created_at: string;
  institution_id: string;
  institutions?: { name: string };
}
