export type SignInFormData = {
  email: string;
  password: string;
  confirmation: string;
  username: string;
  phone: string;
  address: string;
  categories: string[];
};

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
