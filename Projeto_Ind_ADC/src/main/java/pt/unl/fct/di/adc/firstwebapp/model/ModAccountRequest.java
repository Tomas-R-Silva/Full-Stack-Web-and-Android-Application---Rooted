package pt.unl.fct.di.adc.firstwebapp.model;

public class ModAccountRequest {

    private Input input;
    private Token token;

    public ModAccountRequest() {}

    public Input getInput() {
        return input;
    }

    public void setInput(Input input) {
        this.input = input;
    }

    public Token getToken() {
        return token;
    }

    public void setToken(Token token) {
        this.token = token;
    }

    public static class Input {
        private String username;
        private Attributes attributes;

        public Input() {}

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

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