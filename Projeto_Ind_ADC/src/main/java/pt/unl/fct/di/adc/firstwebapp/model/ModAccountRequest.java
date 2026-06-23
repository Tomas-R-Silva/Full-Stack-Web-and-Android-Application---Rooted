package pt.unl.fct.di.adc.firstwebapp.model;

public class ModAccountRequest extends AbstractTokenInputRequest<ModAccountRequest.ModAccountRequestInput>{

    public ModAccountRequest() {}

    public static class ModAccountRequestInput extends ShortUser{
        private Attributes attributes;

        public ModAccountRequestInput() {}

        public Attributes getAttributes() {
            return attributes;
        }

        public void setAttributes(Attributes attributes) {
            this.attributes = attributes;
        }
    }

    public static class Attributes {
        private String phone;
        private String address;

        public Attributes() {}

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }
    }
}