package pt.unl.fct.di.adc.firstwebapp.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public class ForumKeyTokenRequest extends AbstractTokenInputRequest<ForumKeyTokenRequest.ForumKeyTokenInput>{

	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input": "..."
	 * }
	 */
	
	public ForumKeyTokenRequest() {}
	
    public static class ForumKeyTokenInput{
        private String forumKey;

        public ForumKeyTokenInput() {}

        // The client sends "input" as a plain string (the forum key), so accept a bare
        // JSON string and delegate it to forumKey instead of requiring an object.
        @JsonCreator
        public ForumKeyTokenInput(String forumKey) {
            this.forumKey = forumKey;
        }

        public String getForumKey() {
            return forumKey;
        }

        public void setForumKey(String forumKey) {
            this.forumKey = forumKey;
        }

    }

}
