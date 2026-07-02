package pt.unl.fct.di.adc.firstwebapp.model;
import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventInput;

public class PostMessageRequest extends AbstractTokenInputRequest<PostMessageRequest.PostMessageinput>implements ModelInterface{

	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input": {
	 *   	"eventId": "...",
	 *   	"text": "...",
	 *   	"parentPostId": "..."   (optional, for replies)}
	 * }
	 */

	public PostMessageRequest() {}

	public class PostMessageinput extends EventInput implements ModelInterface{

		private String text;
		private String parentPostId;

		public PostMessageinput() {}

		public String getText() { return text; }
		public void setText(String text) { this.text = text; }

		public String getParentPostId() { return parentPostId; }
		public void setParentPostId(String parentPostId) { this.parentPostId = parentPostId; }
		@Override
		public Map<String, Object> getformat() {
			Map<String, Object> map=super.getformat();
			map.put("text", ModelInterface.defaultstr);
			map.put("parentPostId", ModelInterface.defaultstr);
			return map;
		}

	}

	@SuppressWarnings("unchecked")
	@Override
	public Class<PostMessageinput> Getinputclass() {
		return PostMessageinput.class;
	}


}