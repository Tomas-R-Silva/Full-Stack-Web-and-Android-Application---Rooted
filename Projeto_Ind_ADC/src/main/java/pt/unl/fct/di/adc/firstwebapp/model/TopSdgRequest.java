package pt.unl.fct.di.adc.firstwebapp.model;

public class TopSdgRequest extends AbstractInputRequest<TopSdgRequest.TopSdgInput>{

	/**
	 * {
	 *   "input": { "limit": 20 }   (optional, default 20)
	 * }
	 */

	public TopSdgRequest() {}

	public static class TopSdgInput {
		private Integer limit;

		public TopSdgInput() {}

		public Integer getLimit() { return limit; }
		public void setLimit(Integer limit) { this.limit = limit; }
	}

}
