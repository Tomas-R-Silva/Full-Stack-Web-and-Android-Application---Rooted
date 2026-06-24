package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.model.ModelInterface;

public class EventInput implements EventInputInterface, ModelInterface{
	private String eventId;

	public EventInput() {}

	public String getEventId() { return eventId; }
	public void setEventId(String eventId) { this.eventId = eventId; }

	@Override
	public Map<String, Object> getformat() {
		return Map.of("eventId",ModelInterface.defaultstr);
	}

}
