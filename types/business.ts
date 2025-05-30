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
    attachments?: string[] | Attachment[];
  }
  