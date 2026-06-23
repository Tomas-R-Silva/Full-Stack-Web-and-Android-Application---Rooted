package pt.unl.fct.di.adc.firstwebapp.model;

public abstract class AbstractInputRequest<E> {

	/**
	 * {
	 *   "input": "..."
	 * }
	 */
	
	public AbstractInputRequest() {}

	private E input;

	public E getInput() {
		return input;
	}

	public void setInput(E input) {
		this.input = input;
	}

}
