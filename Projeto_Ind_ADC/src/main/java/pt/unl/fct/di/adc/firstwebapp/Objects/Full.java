package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.LongValue;
import com.google.cloud.datastore.StringValue;

public interface Full {
	public static final long TIME_DIVIDER = 1000L;
	public Map<String,Object> tomap();
	public Map<String,Object> tomap(Entity e);	
	public Key getKey();

	public Entity toentity();
	
	public static String getString(Entity e,String name) {
		return e.contains(name)?e.getString(name):"";
	}
	
	public static String string(String str) {
		return str!=null?str:"";
	}
	
	public static long getLong(Entity e,String name) {
		return e.contains(name)?e.getLong(name):0;
	}
	
	public static double getDouble(Entity e,String name) {
		return e.contains(name)?e.getDouble(name):0;
	}
	
	public static boolean getBoolean(Entity e,String name) {
		return e.contains(name)?e.getBoolean(name):true;
	}
	
	public static List<StringValue> getStringValueList(Entity e,String name) {
		return e.contains(name)?e.getList(name):Collections.emptyList();
	}
	
	public static List<String> getStringList(Entity e,String name){
		return Full.getStringValueList(e,name).stream().map(v -> v.get()).collect(Collectors.toList());
	}
	
	public static List<StringValue> makeStringValueList(List<String> list) {
		return (list!=null)?list.stream().map(v -> StringValue.of(v)).collect(Collectors.toList()):Collections.emptyList();
	}
	
	public static List<LongValue> makeLongValueList(List<Long> list) {
		return (list!=null)?list.stream().map(v -> LongValue.of(v)).collect(Collectors.toList()):Collections.emptyList();
	}
	
	public static List<Long> getLongList(Entity e,String name){
		List<LongValue> l=e.getList(name);
		return e.contains(name)?l.stream().map(v -> v.get()).collect(Collectors.toList()):Collections.emptyList();
	}
	
	public static <E extends Enum<?>> List<StringValue> makeStringValueEnumList(List<E> list) {
		return (list!=null)?list.stream().map(v -> StringValue.of(v.name())).collect(Collectors.toList()):Collections.emptyList();
	}
	
	public static <E extends Enum<?>> List<String> makeStringEnumList(List<E> list) {
		return (list!=null)?list.stream().map(v -> v.name()).collect(Collectors.toList()):Collections.emptyList();
	}
	
	
}
