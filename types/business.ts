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
    hours: string;
    attachments?: string[] | Attachment[];
  }
  