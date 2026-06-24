package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventInput;

public class ListForumRequest extends AbstractTokenInputRequest<ListForumRequest.ListForumInput>implements ModelInterface{

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
	public class ListForumInput extends EventInput implements ModelInterface{

		private String cursor;
		private int pageSize;

		public ListForumInput() {}

		public String getCursor() { return cursor; }
		public void setCursor(String cursor) { this.cursor = cursor; }

		public int getPageSize() { return pageSize; }
		public void setPageSize(int pageSize) { this.pageSize = pageSize; }
		
		 @Override
	    	public Map<String, Object> getformat() {
	        Map<String, Object> map=super.getformat();
	        map.put("cursor", ModelInterface.defaultstr);
	        map.put("pageSize", 20);
	        return map;
	        }
	}
}
