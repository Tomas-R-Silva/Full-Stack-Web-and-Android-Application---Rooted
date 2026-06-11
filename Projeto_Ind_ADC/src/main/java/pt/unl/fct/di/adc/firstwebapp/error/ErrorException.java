package pt.unl.fct.di.adc.firstwebapp.error;

import com.google.cloud.datastore.Key;

public class ErrorException extends Exception{

	private static final long serialVersionUID = 1L;
	private final int status;
	private final Key key;

	public ErrorException(int status,Key key) {
		super();
		this.status=status;
		this.key=key;
	}
	public ErrorException(int status) {
		this(status,null);
	}
	public int getStatus() {
		return status;
	}
	
	public Key getKey() {
		return key;
	}
	public static void trow(int status, Key key) throws ErrorException {
		throw new ErrorException(status,key);
	}
	public static void trow(int valeu) throws ErrorException {
		throw new ErrorException(valeu);
	}

}
