package pt.unl.fct.di.adc.firstwebapp.model;

public abstract class AbstractShortUserRequest<E extends ShortUser> {

	public AbstractShortUserRequest() {}

	private E input;

	public E getInput() {
		return input;
	}

	public void setInput(E input) {
		this.input = input;
	}

}
