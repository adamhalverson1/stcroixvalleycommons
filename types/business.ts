export interface Business {
    id: string;
    name: string;
    description: string;
    categories: string;
    address: string;
    image: string;
    attachments?: string[] | Attachment[];
  }
  