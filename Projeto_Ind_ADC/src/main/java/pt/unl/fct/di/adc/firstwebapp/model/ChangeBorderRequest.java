package pt.unl.fct.di.adc.firstwebapp.model;

public class ChangeBorderRequest extends AbstractTokenInputRequest<ChangeBorderRequest.ChangeBorderInput>{

	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input": { "borderID": "..." }
	 * }
	 */

	public ChangeBorderRequest(){}

	public static class ChangeBorderInput{
		private String borderID;

		public String getBorderID(){ return borderID; }
		public void setBorderID(String borderID){ this.borderID = borderID; }
	}
}
