export type SignInFormData = {
  email: string;
  password: string;
  confirmation: string;
  username: string;
  phone: string;
  address: string;
  categories: string[];
  role: string;
};

export type SignInData = {
  username: string;
  password: string;
  confirmation: string;
  phone: string;
  address: string;
  role: string;
};

export type LogInData = {
  username: string;
  password: string;
}

export interface AccountProps {
  image?: ImageBitmap;
  bio?: string;
  onNext?: () => void; //? retira a obrgatoriedade de fazer parte
  onBack?: () => void;
}

export interface StepProps{
  formData: SignInFormData;
  setFormData: React.Dispatch<React.SetStateAction<SignInFormData>>;
  onNext?: () => void; //? retira a obrgatoriedade de fazer parte
  onBack?: () => void;
};
