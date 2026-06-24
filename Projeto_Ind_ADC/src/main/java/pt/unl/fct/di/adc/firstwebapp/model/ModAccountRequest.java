package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class ModAccountRequest extends AbstractTokenInputRequest<ModAccountRequest.ModAccountRequestInput>implements ModelInterface{

    public ModAccountRequest() {}

    public static class ModAccountRequestInput extends ShortUser implements ModelInterface{
        private Attributes attributes;

        public ModAccountRequestInput() {}

        public Attributes getAttributes() {
            return attributes;
        }

        public void setAttributes(Attributes attributes) {
            this.attributes = attributes;
        }
        @Override
    	public Map<String, Object> getformat() {
        Map<String, Object> map=super.getformat();
        map.put("attributes", attributes.getformat());
        return map;
        }
    }

    public static class Attributes implements ModelInterface {
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
        @Override
    	public Map<String, Object> getformat() {
        return Map.of("phone",ModelInterface.defaultstr
        		,"address",ModelInterface.defaultstr);
        }
        
        
    }
}