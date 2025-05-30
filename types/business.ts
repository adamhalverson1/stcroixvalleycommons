export interface BusinessHours {
  Sunday?: string;
  Monday?: string;
  Tuesday?: string;
  Wednesday?: string;
  Thursday?: string;
  Friday?: string;
  Saturday?: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  categories: string;
  category: string;
  address: string;
  image: string;
  city: string;
  state: string;
  phone: string;
  serviceArea: string;
  email: string;
  Facebook: string;
  Instagram: string;
  Twitter: string;
  hours: BusinessHours; // 👈 changed from string to object
  website: string;
  attachments?: string[] | Attachment[];
}