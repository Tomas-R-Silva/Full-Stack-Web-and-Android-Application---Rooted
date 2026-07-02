package pt.unl.fct.di.adc.firstwebapp.model;

public class ForumKeyTokenRequest extends AbstractTokenInputRequest<ForumKeyTokenRequest.ForumKeyTokenInput>{

	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": "..."
	 * }
	 */
	
	public ForumKeyTokenRequest() {}
	
    public static class ForumKeyTokenInput{
        private String forumKey;


        public ForumKeyTokenInput() {}

        public String getForumKey() {
            return forumKey;
        }

        public void setForumKey(String forumKey) {
            this.forumKey = forumKey;
        }

    }

}
