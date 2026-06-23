package pt.unl.fct.di.adc.firstwebapp.model;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventInput;

public class PostMessageRequest extends AbstractTokenInputRequest<PostMessageRequest.PostMessageinput>{

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
	
	public class PostMessageinput extends EventInput{
		
	private String text;
	private String parentPostId;

	public PostMessageinput() {}

	public String getText() { return text; }
	public void setText(String text) { this.text = text; }

	public String getParentPostId() { return parentPostId; }
	public void setParentPostId(String parentPostId) { this.parentPostId = parentPostId; }
}
}