package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventInput;

public class ImageRequest extends AbstractTokenInputRequest<ImageRequest.ImageRequestInput>implements ModelInterface{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": { 
	 *   	"eventId": "...",
	 *   	"images": ["...", ...]}
	 * }
	 */
	
	public ImageRequest() {}

	public class ImageRequestInput extends EventInput implements ModelInterface{

		// Each string is a Base64 data URL: "data:image/jpeg;base64,/9j/4AAQ..." in /events/uploadImages
		private List<String> images;

		public ImageRequestInput() {}

		public List<String> getImages() { return images != null ? images : Collections.emptyList(); }
		public void setImages(List<String> images) { this.images = images; }
		
		 @Override
	    	public Map<String, Object> getformat() {
	        Map<String, Object> map=super.getformat();
	        map.put("images", ModelInterface.defaultliststr);
	        return map;
	        }
	}
}
