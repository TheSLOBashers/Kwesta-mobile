export type EventItem = {
  id: string;
  createdAt: string;
  description: string;
  location: any;
  joined: boolean;

  authorId: string;
  authorName: string;

  date?: string;
  time?: string;
  image?: string;
  flag?: boolean;
};