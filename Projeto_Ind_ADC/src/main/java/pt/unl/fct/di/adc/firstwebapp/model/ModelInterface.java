package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

public interface ModelInterface {

	public Map<String,Object> getformat();

	public static final String defaultstr="\"...\"";
	public static final int defaultint=0;
	public static final boolean defaultbool=false;
	public static final long defaultlong=0L;
	public static final String defaultliststr="[\"...\",\"...\",\"...\"]";

	@SuppressWarnings("deprecation")
	public static <E extends ModelInterface> String formate(Class<E> e) throws InstantiationException, IllegalAccessException {
		return continuea(new StringBuilder(), e.newInstance().getformat()).toString();
	}

	@SuppressWarnings("unchecked")
	private static StringBuilder continuea(StringBuilder b,Map<String,Object> map) {
		b.append("{");
		Iterator<Entry<String,Object>> it=map.entrySet().iterator();
		while(it.hasNext()) {
			Entry<String,Object> et=it.next();
			b.append("\"").append(et.getKey()).append("\": ");
			Object obj=et.getValue();
			if(Map.class.isInstance(obj))
				continuea(b,(Map<String,Object>)obj);
			else
				b.append(obj);
			if(it.hasNext()) 
				b.append(",\n");
		}
		return b.append("}");

	}

}
