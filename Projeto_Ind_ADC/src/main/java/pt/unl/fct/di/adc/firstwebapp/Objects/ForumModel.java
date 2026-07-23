package pt.unl.fct.di.adc.firstwebapp.Objects;

public class ForumModel implements EventInputInterface{
	protected String id;
	protected String type;
	
	public String getType() { return type; }
	public void setType(String type) { this.type = type;}
	
	public String getId() { return id; }
	@Override
	public String getEventId() { return id; }
	@Override
	public void setEventId(String eventId) { this.id = eventId; type="EVENT";}
}
