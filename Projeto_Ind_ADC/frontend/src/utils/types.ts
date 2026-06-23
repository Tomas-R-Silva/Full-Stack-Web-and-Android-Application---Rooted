//========== USER ==========

export type SignInData = {
  username: string;
  password: string;
  confirmation: string;
  role: string;
};

export type LogInData = {
  username: string;
  password: string;
};

export interface AccountProps {
  image?: ImageBitmap;
  bio?: string;
  onNext?: () => void; //? retira a obrgatoriedade de fazer parte
  onBack?: () => void;
};

export interface StepProps{
  formData: SignInData;
  setFormData: React.Dispatch<React.SetStateAction<SignInData>>;
  onNext?: () => void; //? retira a obrgatoriedade de fazer parte
  onBack?: () => void;
};

//========== EVENT ==========

export type EventItem = {
  eventId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: number;
  durationMinutes: number;
  organizerUsername: string;
  maxAttendees: number;
  attendeeCount: number;
  isPublic: boolean;
  status: string;
  createdAt: number;
  coverImageUrl?: string;
  imageUrls: string[];
};

export type EventResponse = {
  event: EventItem;
};

export type RequestEventList = {
  token?: {jwt:String;}
  category?: string;
  status?: string;
  organizerUsername?: string;
  pageSize: number;
  cursor?: string;
};

export type EventListResponse = {
  events: EventResponse[];
  count: number;
  nextCursor?: string;
};
