package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

public class ForumKeyTokenRequest extends AbstractTokenInputRequest<ForumKeyTokenRequest.ForumKeyTokenInput>implements ModelInterface{

	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": "..."
	 * }
	 */
	
	public ForumKeyTokenRequest() {}
	
    public static class ForumKeyTokenInput implements ModelInterface{
        private String forumKey;


        public ForumKeyTokenInput() {}

        public String getForumKey() {
            return forumKey;
        }

        public void setForumKey(String forumKey) {
            this.forumKey = forumKey;
        }

    	@Override
    	public Map<String, Object> getformat() {
    		return Map.of("forumKey",ModelInterface.defaultstr);
    	}

		@Override
		public <E extends ModelInterface> Class<E> Getinputclass() {
			return null;
		}
    }
    
	@SuppressWarnings("unchecked")
	@Override
	public Class<ForumKeyTokenInput> Getinputclass() {
		return ForumKeyTokenInput.class;
	}

}
