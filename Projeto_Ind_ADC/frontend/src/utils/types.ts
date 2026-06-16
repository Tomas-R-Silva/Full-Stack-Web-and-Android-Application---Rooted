export type FormData = {
  email: string;
  password: string;
  confirmation: string;
  username: string;
  phone: string;
  address: string;
};

export interface StepProps{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext?: () => void; //? retira a obrgatoriedade de fazer parte
  onBack?: () => void;
};