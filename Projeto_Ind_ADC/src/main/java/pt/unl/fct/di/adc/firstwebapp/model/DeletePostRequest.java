package pt.unl.fct.di.adc.firstwebapp.model;

/**
 * {
 *   "token": { "jwt": "<jwt>" },
 *   "postId": "..."
 * }
 */
public class DeletePostRequest {

	private Token token;
	private String postId;

	public DeletePostRequest() {}

	public Token getToken() { return token; }
	public void setToken(Token token) { this.token = token; }

	public String getPostId() { return postId; }
	public void setPostId(String postId) { this.postId = postId; }
}
