package pt.unl.fct.di.adc.firstwebapp.Objects;

import pt.unl.fct.di.adc.firstwebapp.Objects.ForumFull.ForumType;

public class ForumModel implements EventInputInterface{
	protected String id;
	protected String type;
	
	public ForumType getType() { return ForumType.valueof(type); }
	public void setType(ForumType type) { this.type = type.name();}
	
	public String getId() { return id; }
	@Override
	public String getEventId() { return (type.equals(ForumType.EVENT.name()))?id:null; }
	@Override
	public void setEventId(String eventId) { this.id = eventId; type=ForumType.EVENT.name();}
}
