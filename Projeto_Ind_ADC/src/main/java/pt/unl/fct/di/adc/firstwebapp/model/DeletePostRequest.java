package pt.unl.fct.di.adc.firstwebapp.model;

/**
 * {
 *   "token": { "jwt": "<jwt>" },
 *   "postId": "..."
 * }
 */
public class DeletePostRequest  extends AbstractTokenRequest{

	private String postId;

	public DeletePostRequest() {}

	public String getPostId() { return postId; }
	public void setPostId(String postId) { this.postId = postId; }
}
