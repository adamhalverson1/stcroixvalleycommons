export interface BusinessHours {
  Sunday?: { open: string; close: string };
  Monday?: { open: string; close: string };
  Tuesday?: { open: string; close: string };
  Wednesday?: { open: string; close: string };
  Thursday?: { open: string; close: string };
  Friday?: { open: string; close: string };
  Saturday?: { open: string; close: string };
}

export interface Business {
  id: string;
  plan:string;
  name: string;
  description: string;
  categories: string[];
  category: string[];
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
  slug: string;
  hours: BusinessHours; // 👈 changed from string to object
  website: string;
  attachments?: string[] | Attachment[];
}

export interface Events {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl?: string | undefined;
    isFeatured: boolean;
    slug: string;
}

export interface Coupons {

}