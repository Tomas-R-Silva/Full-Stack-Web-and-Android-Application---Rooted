package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

public abstract class AbstractInputRequest<E extends ModelInterface> implements ModelInterface{
	/**
	 * {
	 *   "input": E
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
	
	@Override
	public Map<String, Object> getformat() {
		return Map.of("input",input.getformat());
	}

}
