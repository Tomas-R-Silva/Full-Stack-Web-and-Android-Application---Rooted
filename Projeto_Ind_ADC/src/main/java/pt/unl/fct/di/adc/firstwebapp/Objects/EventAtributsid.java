package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.model.ModelInterface;

public class EventAtributsid extends EventAtributs implements EventInputInterface,ModelInterface {

	protected String eventId;

	public EventAtributsid() {}

	public String getEventId() { return eventId; }
	public void setEventId(String eventId) { this.eventId = eventId; }

	@Override
	public Map<String, Object> getformat() {
		Map<String, Object> map=super.getformat();
		map.put("eventId", ModelInterface.defaultstr);
		return map;
	}



}
