package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;


public class TwoNameTokenRequest extends AbstractTokenInputRequest<TwoNameTokenRequest.TwoNameTokenRequestInput>{

	public TwoNameTokenRequest() {}

	public static class TwoNameTokenRequestInput extends ShortUser{
		private String newname;


		public String getNewName() {
			return newname;
		}

		public void setNewName(String newname) {
			this.newname = newname;
		}  
	}

}

