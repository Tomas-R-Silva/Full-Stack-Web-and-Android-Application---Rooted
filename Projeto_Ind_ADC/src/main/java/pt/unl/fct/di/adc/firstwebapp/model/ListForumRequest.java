package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventInput;

public class ListForumRequest extends AbstractTokenInputRequest<ListForumRequest.ListForumInput>{

	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input": {
	 *   	"eventId": "...",
	 *   	"cursor": "...",     (optional, from a previous response's nextCursor)
	 *   	"pageSize": 50       (optional, default 50, max 100)
	 *   }
	 * }
	 */
	public ListForumRequest() {}
	public class ListForumInput extends EventInput{

		private String cursor;
		private int pageSize;

		public ListForumInput() {}

		public String getCursor() { return cursor; }
		public void setCursor(String cursor) { this.cursor = cursor; }

		public int getPageSize() { return pageSize; }
		public void setPageSize(int pageSize) { this.pageSize = pageSize; }
	}
	
}
