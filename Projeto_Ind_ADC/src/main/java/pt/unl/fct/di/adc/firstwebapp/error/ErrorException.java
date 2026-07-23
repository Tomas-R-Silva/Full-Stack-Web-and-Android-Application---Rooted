package pt.unl.fct.di.adc.firstwebapp.error;

public class ErrorException extends Exception{

	private static final long serialVersionUID = 1L;
	private final int status;
	private final Object ob;

	public ErrorException(int status,Object ob) {
		super();
		this.status=status;
		this.ob=ob;
	}
	public ErrorException(int status) {
		this(status,null);
	}
	public int getStatus() {
		return status;
	}
	
	public Object getdata() {
		return ob;
	}
	
	public static void trow(int status, Object ob) throws ErrorException {
		throw new ErrorException(status,ob);
	}
	public static void trow(int valeu) throws ErrorException {
		throw new ErrorException(valeu);
	}

}
