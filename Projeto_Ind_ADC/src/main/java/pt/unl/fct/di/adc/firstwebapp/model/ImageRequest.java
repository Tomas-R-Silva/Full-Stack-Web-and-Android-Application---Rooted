package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Collections;
import java.util.List;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventInput;

public class ImageRequest extends AbstractTokenInputRequest<ImageRequest.ImageRequestInput>{
	
	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input": { 
	 *   	"eventId": "...",
	 *   	"images": ["...", ...]}
	 * }
	 */
	
	public ImageRequest() {}

	public class ImageRequestInput extends EventInput{

		// Each string is a Base64 data URL: "data:image/jpeg;base64,/9j/4AAQ..." in /events/uploadImages
		private List<String> images;

		// Ids of images to remove in /events/deleteimage (each stored image has a unique id).
		private List<String> imageIds;

		public ImageRequestInput() {}

		public List<String> getImages() { return images != null ? images : Collections.emptyList(); }
		public void setImages(List<String> images) { this.images = images; }

		public List<String> getImageIds() { return imageIds != null ? imageIds : Collections.emptyList(); }
		public void setImageIds(List<String> imageIds) { this.imageIds = imageIds; }
	}

}
